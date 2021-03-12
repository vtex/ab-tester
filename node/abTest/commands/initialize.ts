import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../../typings/testingParameters'
import { firstOrDefault } from '../../utils/firstOrDefault'
import getRequestParams from '../../utils/BodyParser/getRequestParams'

export function InitializeAbTestForWorkspace(ctx: Context): Promise<void> {
    const workspace = ctx.vtex.route.params.initializingWorkspace
    const workspaceName = firstOrDefault(workspace)

    return InitializeAbTest(workspaceName, 1, 5000, ctx)
}

export function InitializeAbTestForWorkspaceWithParameters(ctx: Context): Promise<void> {
    const { vtex: { route: { params: { hours, proportion, initializingWorkspace } } }} = ctx
    const [ workspaceName, hoursOfInitialStage, proportionOfTraffic ] = [ initializingWorkspace, hours, proportion ].map(firstOrDefault)
    checkIfNaN(hoursOfInitialStage, proportionOfTraffic)
    
    return InitializeAbTest(workspaceName, Number(hoursOfInitialStage), Number(proportionOfTraffic), ctx)
}

export async function InitializeAbTestWithBodyParameters(ctx: Context): Promise<void> {
    const { InitializingWorkspace, Hours, Proportion, Type } = await getRequestParams(ctx)
    const [ workspaceName, hoursOfInitialStage, proportionOfTraffic ] = [ InitializingWorkspace, Hours, Proportion ].map(firstOrDefault)
    const testType = Type as TestType
    
    checkIfNaN(hoursOfInitialStage, proportionOfTraffic)

    return InitializeAbTest(workspaceName, Number(hoursOfInitialStage), Number(proportionOfTraffic), ctx, testType)
}

async function InitializeAbTest(workspaceName: string, hoursOfInitialStage: number, proportionOfTraffic: number, ctx: Context, testType: TestType = 'conversion'): Promise<void> {
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

const checkIfNaN = (hours: string, proportion: string) => {
    if (Number.isNaN(Number(hours))) {
        throw new Error(`Error reading time parameter: make sure to insert a number`)
    }
    if (Number.isNaN(Number(proportion))) {
        throw new Error(`Error reading proportion parameter: make sure to insert a number`)
    }
} 