import { v4 as uuid } from 'uuid'
import { LoggerClient as Logger } from '../../clients/logger'
import Router from '../../clients/router'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { InitializeABTestParams } from '../../workspace/modify'

export async function InitializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { probability, initializingWorkspace } } }, resources: { router, vbase } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        let workspaceMetadata = await router.getWorkspaces(account)
        const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
        const hasTestingWorkspaces = workspaceMetadata ? true : false
        if (!hasTestingWorkspaces ? true : !testingWorkspaces.Includes('master')) {
            await InitializeABTestParams(account, 'master', ctx.vtex)
            testingWorkspaces.Add('master')
            workspaceMetadata = {
                Id: uuid(),
                workspaces: testingWorkspaces.ToArray(),
            }
        }
        testingWorkspaces.Add(workspaceName)
        const testingParameters = new TestingParameters(testingWorkspaces.ToArray())

        await InitializeWorkspaces(account, workspaceMetadata.Id, testingWorkspaces.ToArray(), router)
        await router.setParameters(account, testingParameters.ToArray())

        await InitializeABTestParams(account, workspaceName, ctx.vtex)
        await vbase.initializeABtest(1 - Number(probability))
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found'
        }
        const logger = new Logger(ctx.vtex, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}

async function InitializeWorkspaces(account: string, Id: string, testingWorkspaces: ABTestWorkspace[], router: Router): Promise<void> {
    await router.setWorkspaces(account, {
        Id: (Id),
        workspaces: testingWorkspaces,
    })
}