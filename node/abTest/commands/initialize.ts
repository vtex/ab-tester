import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../../typings/testingParameters'
import { firstOrDefault } from '../../utils/firstOrDefault'
import getRequestParams from '../../utils/Request/getRequestParams'
import { checkTestType, checkIfNaN, CheckProportion, CheckWorkspace } from '../../utils/Request/Checks'

export function InitializeAbTestForWorkspace(ctx: Context): Promise<void> {
    const workspace = ctx.vtex.route.params.initializingWorkspace
    return RunChecksAndInitialize(ctx, workspace, '1', '5000', 'conversion')
}

export function InitializeAbTestForWorkspaceWithParameters(ctx: Context): Promise<void> {
    const { vtex: { route: { params: { hours, proportion, initializingWorkspace } } }} = ctx  
    return RunChecksAndInitialize(ctx, initializingWorkspace, hours, proportion, 'conversion')
}

export async function InitializeAbTestWithBodyParameters(ctx: Context): Promise<void> {
    const { InitializingWorkspaces, Hours, Proportion, Type } = await getRequestParams(ctx)
    return RunChecksAndInitialize(ctx, InitializingWorkspaces, Hours, Proportion, Type)
}

async function RunChecksAndInitialize(ctx: Context, InitializingWorkspace: UrlParameter, Hours: UrlParameter, Proportion: UrlParameter, Type: string): Promise<void> {
    const [ workspaceName, hoursOfInitialStage, proportionOfTraffic ] = [ InitializingWorkspace, Hours, Proportion ].map(firstOrDefault) 

    checkTestType(Type)
    const testType = Type as TestType

    await CheckWorkspace(workspaceName, ctx)

    checkIfNaN(hoursOfInitialStage, proportionOfTraffic)
    const [ numberHours, numberProportion] = [ Number(hoursOfInitialStage), CheckProportion(Number(proportionOfTraffic))]

    return InitializeAbTest(workspaceName, numberHours, numberProportion, ctx, testType)
}

async function InitializeAbTest(workspaceName: string, hoursOfInitialStage: number, proportionOfTraffic: number, ctx: Context, testType: TestType): Promise<void> {
    const { vtex: { account, logger }, clients: { abTestRouter, storage } } = ctx
    try {
        const testingWorkspaces = await abTestRouter.getWorkspaces(account)
        const hasTestingWorkspaces = testingWorkspaces.Length() > 0
        if (!hasTestingWorkspaces || !testingWorkspaces.Includes('master')) {
            testingWorkspaces.Add('master')
        }
        testingWorkspaces.Add(workspaceName)
        const testingParameters = createTestingParameters(testType, testingWorkspaces.ToArray())
        testingParameters.UpdateWithFixedParameters(proportionOfTraffic)

        await InitializeWorkspaces(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray())

        const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
        await abTestRouter.setParameters(account, {
            Id: testingWorkspaces.Id(),
            parameterPerWorkspace: tsmap,
        })

        await storage.initializeABtest(hoursOfInitialStage, proportionOfTraffic, testType, ctx)
        logger.info({message: `A/B Test initialized in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, proportion: `${proportionOfTraffic}`, type: `${testType}`, method: 'TestInitialized' })
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found: ' + err.message
        }
        err.message = 'Error initializing A/B test: ' + err.message
        throw err
    }
}

async function InitializeWorkspaces(ctx: Context, id: string, testingWorkspaces: ABTestWorkspace[]): Promise<void> {
    return await ctx.clients.abTestRouter.setWorkspaces(ctx.vtex.account, {
        id: (id),
        workspaces: testingWorkspaces,
    }).catch((err) => {
        err.message = 'Error initializing workspaces: ' + err.message
    })
}