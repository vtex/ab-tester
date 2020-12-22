import { firstOrDefault } from '../../utils/firstOrDefault'
import getRequestParams from '../../utils/Request/getRequestParams'
import { checkTestType, checkTestApproach, checkIsMAB, checkIfNaN, CheckProportion, CheckInitializingWorkspaces as CheckWorkspaces } from '../../utils/Request/Checks'
import { InitializeProportions, InitializeWorkspaces } from '../initialize-Router'
import TestingWorkspaces from '../../typings/testingWorkspace'

export function InitializeAbTestForWorkspace(ctx: Context): Promise<void> {
    const workspace = ctx.vtex.route.params.initializingWorkspace
    return RunChecksAndInitialize(ctx, workspace, '1', '5000', 'conversion', 'bayesian', 'true')
}

export function InitializeAbTestForWorkspaceWithParameters(ctx: Context): Promise<void> {
    const { vtex: { route: { params: { hours, proportion, initializingWorkspace } } }} = ctx  
    return RunChecksAndInitialize(ctx, initializingWorkspace, hours, proportion, 'conversion', 'bayesian', 'true')
}

export async function InitializeAbTestWithBodyParameters(ctx: Context): Promise<void> {
    const { InitializingWorkspaces, Hours, Proportion, Type, Approach, IsMAB } = await getRequestParams(ctx)
    return RunChecksAndInitialize(ctx, InitializingWorkspaces, Hours, Proportion, Type, Approach, IsMAB)
}

async function RunChecksAndInitialize(ctx: Context, InitializingWorkspaces: UrlParameter, Hours: UrlParameter, Proportion: UrlParameter, Type: string, Approach: string, IsMAB: string): Promise<void> {
    const [ workspacesString, hoursOfInitialStage, masterProportion ] = [ InitializingWorkspaces, Hours, Proportion ].map(firstOrDefault) 

    checkTestType(Type)
    const testType = Type as TestType

    checkTestApproach(Approach)
    const approach = Approach as TestApproach

    checkIsMAB(IsMAB)
    const isMAB = IsMAB as unknown as boolean

    const workspacesNames = workspacesString.split(' ')
    await CheckWorkspaces(workspacesNames, ctx)

    checkIfNaN(hoursOfInitialStage, masterProportion)
    const [ numberHours, numberMasterProportion] = [ Number(hoursOfInitialStage), CheckProportion(Number(masterProportion))]

    return InitializeAbTest(workspacesNames, numberHours, numberMasterProportion, ctx, testType, approach, isMAB)
}

async function InitializeAbTest(workspacesNames: string[], hoursOfInitialStage: number, masterProportion: number, ctx: Context, testType: TestType, approach: TestApproach, isMAB: boolean): Promise<void> {
    const { vtex: { account, logger }, clients: { abTestRouter, storage } } = ctx
    try {
        const currentWorkspaces = await abTestRouter.getWorkspaces(account)   
        const testingWorkspaces = new TestingWorkspaces({id: '', workspaces: currentWorkspaces.ToArray()})
        const hasTestingWorkspaces = testingWorkspaces.Length() > 0
        if (!hasTestingWorkspaces || !testingWorkspaces.Includes('master')) {
            testingWorkspaces.Add('master')
        }
        for (const workspace of workspacesNames) {
            testingWorkspaces.Add(workspace)
        }
        await InitializeProportions(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray(), masterProportion)
        await InitializeWorkspaces(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray())
        await storage.initializeABtest(testingWorkspaces.WorkspacesNames(), hoursOfInitialStage, masterProportion, testType, approach, isMAB, ctx)
        
        logger.info({message: `A/B Test initialized in ${account} for workspaces ${workspacesNames}`, account: `${account}`, workspaces: `${workspacesNames}`, proportion: `${masterProportion}`, type: `${testType}`, approach: `${approach}`, method: 'TestInitialized' })
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found: ' + err.message
        }
        err.message = 'Error initializing A/B test: ' + err.message
        throw err
    }
}