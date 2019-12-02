import { TSMap } from 'typescript-map'
import { v4 as uuid } from 'uuid'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'

export function InitializeAbTestForWorkspace(ctx: Context): Promise<void> {
    return InitializeAbTest(1, 0.5, ctx)
}

export function InitializeAbTestForWorkspaceWithParameters(ctx: Context): Promise<void> {
    const { vtex: { route: { params: { hours, proportion } } }} = ctx
    const hoursOfInitialStage = firstOrDefault(hours)
    const proportionOfTraffic = firstOrDefault(proportion)
    return InitializeAbTest(Number(hoursOfInitialStage), Number(proportionOfTraffic), ctx)
}

async function InitializeAbTest(hoursOfInitialStage: number, proportionOfTraffic: number, ctx: Context): Promise<void> {
    const { vtex: { account, route: { params: { initializingWorkspace } } }, clients: { logger, abTestRouter, storage } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        let workspaceMetadata = await abTestRouter.getWorkspaces(account)
        const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
        const hasTestingWorkspaces = workspaceMetadata ? true : false
        if (!hasTestingWorkspaces || !testingWorkspaces.Includes('master')) {
            testingWorkspaces.Add('master')
            workspaceMetadata = {
                id: uuid(),
                workspaces: testingWorkspaces.ToArray(),
            }
        }
        testingWorkspaces.Add(workspaceName)
        const testingParameters = new TestingParameters(workspaceMetadata.workspaces)
        testingParameters.Add(workspaceName)
        testingParameters.SetWithFixedParameters(proportionOfTraffic)

        await InitializeWorkspaces(ctx, workspaceMetadata.id, testingWorkspaces.ToArray())

        const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
        await abTestRouter.setParameters(account, {
            Id: workspaceMetadata.id,
            parameterPerWorkspace: tsmap,
        })

        await storage.initializeABtest(hoursOfInitialStage, proportionOfTraffic, ctx.vtex)
        logger.info({message: `A/B Test initialized in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, proportion: `${proportionOfTraffic}`, method: 'TestInitialized' })
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found'
        }
        logger.error({ status: ctx.status, message: err.message })
        throw new Error(err)
    }
}

function InitializeWorkspaces(ctx: Context, id: string, testingWorkspaces: ABTestWorkspace[]): Promise<void> {
    return ctx.clients.abTestRouter.setWorkspaces(ctx.vtex.account, {
        id: (id),
        workspaces: testingWorkspaces,
    })
}