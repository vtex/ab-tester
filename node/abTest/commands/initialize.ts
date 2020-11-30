import { firstOrDefault } from '../../utils/firstOrDefault'
import getRequestParams from '../../utils/Request/getRequestParams'
import { checkTestType, checkTestApproach, checkIfNaN, CheckProportion, CheckInitializingWorkspaces as CheckWorkspaces } from '../../utils/Request/Checks'
import { InitializeParameters, InitializeWorkspaces } from '../initialize-Router'
import TestingWorkspaces from '../../typings/testingWorkspace'

export function InitializeAbTestForWorkspace(ctx: Context): Promise<void> {
    const workspace = ctx.vtex.route.params.initializingWorkspace
    return RunChecksAndInitialize(ctx, workspace, '1', '5000', 'conversion', 'bayesian')
}

export function InitializeAbTestForWorkspaceWithParameters(ctx: Context): Promise<void> {
    const { vtex: { route: { params: { hours, proportion, initializingWorkspace } } }} = ctx  
    return RunChecksAndInitialize(ctx, initializingWorkspace, hours, proportion, 'conversion', 'bayesian')
}

export async function InitializeAbTestWithBodyParameters(ctx: Context): Promise<void> {
    const { InitializingWorkspaces, Hours, Proportion, Type, Approach } = await getRequestParams(ctx)
    return RunChecksAndInitialize(ctx, InitializingWorkspaces, Hours, Proportion, Type, Approach)
}

async function RunChecksAndInitialize(ctx: Context, InitializingWorkspaces: UrlParameter, Hours: UrlParameter, Proportion: UrlParameter, Type: string, Approach: string): Promise<void> {
    const [ workspacesString, hoursOfInitialStage, proportionOfTraffic ] = [ InitializingWorkspaces, Hours, Proportion ].map(firstOrDefault) 

    checkTestType(Type)
    const testType = Type as TestType

    checkTestApproach(Approach)
    const approach = Approach as TestApproach

    const workspacesNames = workspacesString.split(' ')
    await CheckWorkspaces(workspacesNames, ctx)

    checkIfNaN(hoursOfInitialStage, proportionOfTraffic)
    const [ numberHours, numberProportion] = [ Number(hoursOfInitialStage), CheckProportion(Number(proportionOfTraffic))]

    return InitializeAbTest(workspacesNames, numberHours, numberProportion, ctx, testType, approach)
}

async function InitializeAbTest(workspacesNames: string[], hoursOfInitialStage: number, proportionOfTraffic: number, ctx: Context, testType: TestType, approach: TestApproach): Promise<void> {
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
        await InitializeParameters(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray(), proportionOfTraffic)
        await InitializeWorkspaces(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray())
        await storage.initializeABtest(hoursOfInitialStage, proportionOfTraffic, testType, approach, ctx)
        
        logger.info({message: `A/B Test initialized in ${account} for workspaces ${workspacesNames}`, account: `${account}`, workspaces: `${workspacesNames}`, proportion: `${proportionOfTraffic}`, type: `${testType}`, approach: `${approach}`, method: 'TestInitialized' })
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found: ' + err.message
        }
        err.message = 'Error initializing A/B test: ' + err.message
        throw err
    }
}