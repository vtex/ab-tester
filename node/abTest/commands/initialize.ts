import { TSMap } from 'typescript-map'
import { TestType } from '../../clients/vbase'
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
    
    if (Number.isNaN(Number(hoursOfInitialStage)))
    {
        throw new Error(`An error occurred when reading amount of hours to fix proportion of traffic: value is not a number.`)
    }
    if (Number.isNaN(Number(proportionOfTraffic)))
    {
        throw new Error(`An error occurred when reading proportion of traffic being distributed between workspaces: value is not a number.`)
    }
    
    return InitializeAbTest(workspaceName, Number(hoursOfInitialStage), Number(proportionOfTraffic), ctx)
}

export async function InitializeAbTestWithBodyParameters(ctx: Context): Promise<void> {
    const { InitializingWorkspace, Hours, Proportion, Type } = await getRequestParams(ctx)
    const [ workspaceName, hoursOfInitialStage, proportionOfTraffic, type ] = [ InitializingWorkspace, Hours, Proportion, Type ].map(firstOrDefault)
    const testType = TestType[type as keyof typeof TestType]

    if (Number.isNaN(Number(hoursOfInitialStage)))
    {
        throw new Error(`An error occurred when reading amount of hours to fix proportion of traffic: value is not a number.`)
    }
    if (Number.isNaN(Number(proportionOfTraffic)))
    {
        throw new Error(`An error occurred when reading proportion of traffic being distributed between workspaces: value is not a number.`)
    }

    return InitializeAbTest(workspaceName, Number(hoursOfInitialStage), Number(proportionOfTraffic), ctx, testType)
}

async function InitializeAbTest(workspaceName: string, hoursOfInitialStage: number, proportionOfTraffic: number, ctx: Context, testType: TestType = TestType.conversion): Promise<void> {
    const { vtex: { account, logger }, clients: { abTestRouter, storage } } = ctx
    try {
        const testingWorkspaces = await abTestRouter.getWorkspaces(account)
        const hasTestingWorkspaces = testingWorkspaces.Length() > 0
        if (!hasTestingWorkspaces || !testingWorkspaces.Includes('master')) {
            testingWorkspaces.Add('master')
        }
        testingWorkspaces.Add(workspaceName)
        const testingParameters = createTestingParameters(testType, testingWorkspaces.ToArray())
        testingParameters.Add(workspaceName)
        testingParameters.UpdateWithFixedParameters(proportionOfTraffic)

        await InitializeWorkspaces(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray())

        const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
        await abTestRouter.setParameters(account, {
            Id: testingWorkspaces.Id(),
            parameterPerWorkspace: tsmap,
        })

        await storage.initializeABtest(hoursOfInitialStage, proportionOfTraffic, testType, ctx)
        logger.info({message: `A/B Test initialized in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, proportion: `${proportionOfTraffic}`, method: 'TestInitialized' })
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found'
        }
        logger.error({ status: ctx.status, message: err.message })
        throw err
    }
}

function InitializeWorkspaces(ctx: Context, id: string, testingWorkspaces: ABTestWorkspace[]): Promise<void> {
    return ctx.clients.abTestRouter.setWorkspaces(ctx.vtex.account, {
        id: (id),
        workspaces: testingWorkspaces,
    })
}