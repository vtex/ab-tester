import { TSMap } from 'typescript-map'
import { v4 as uuid } from 'uuid'
import Router from '../../clients/router'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'

export async function InitializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    await InitializeAbTest(1, 0.5, ctx)
}

export async function InitializeAbTestForWorkspaceWithParameters(ctx: ColossusContext): Promise<void> {
    const { vtex: { route: { params: { hours, proportion } } }} = ctx
    const hoursOfInitialStage = firstOrDefault(hours)
    const proportionOfTraffic = firstOrDefault(proportion)
    await InitializeAbTest(Number(hoursOfInitialStage), Number(proportionOfTraffic), ctx)
}

async function InitializeAbTest(hoursOfInitialStage: number, proportionOfTraffic: number, ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { initializingWorkspace } } }, resources: { logger, router, vbase } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        let workspaceMetadata = await router.getWorkspaces(account)
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
        const testingParameters = new TestingParameters(testingWorkspaces.ToArray())

        await InitializeWorkspaces(account, workspaceMetadata.id, testingWorkspaces.ToArray(), router)
        
        let tsmap = new TSMap<string, ABTestParameters>()
        for (let entry of testingParameters.Get()) {
            tsmap.set(entry[0], entry[1].abTestParameters)
        }

        await router.setParameters(account, {
            Id: workspaceMetadata.id,
            parameterPerWorkspace: tsmap,
        })

        await vbase.initializeABtest(hoursOfInitialStage, proportionOfTraffic, ctx.vtex)
        logger.info(`A/B Test initialized in ${account} for workspace ${workspaceName}`, { account: `${account}`, workspace: `${workspaceName}`, method: 'TestInitialized' })
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found'
        }
        logger.error({ status: ctx.status, message: err.message })
        throw new Error(err)
    }
}

async function InitializeWorkspaces(account: string, id: string, testingWorkspaces: ABTestWorkspace[], router: Router): Promise<void> {
    await router.setWorkspaces(account, {
        id: (id),
        workspaces: testingWorkspaces,
    })
}