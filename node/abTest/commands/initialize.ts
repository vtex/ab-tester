import { TSMap } from 'typescript-map'
import { v4 as uuid } from 'uuid'
import { LoggerClient as Logger } from '../../clients/logger'
import Router from '../../clients/router'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'

export async function InitializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { initializingWorkspace } } }, resources: { router, vbase } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        let workspaceMetadata = await router.getWorkspaces(account)
        const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
        const hasTestingWorkspaces = workspaceMetadata ? true : false
        if (!hasTestingWorkspaces ? true : !testingWorkspaces.Includes('master')) {
            testingWorkspaces.Add('master')
            workspaceMetadata = {
                Id: uuid(),
                workspaces: testingWorkspaces.ToArray(),
            }
        }
        testingWorkspaces.Add(workspaceName)
        const testingParameters = new TestingParameters(testingWorkspaces.ToArray())

        await InitializeWorkspaces(account, workspaceMetadata.Id, testingWorkspaces.ToArray(), router)
        const tsmap = new TSMap<string, Workspace>([...testingParameters.Get()])
        await router.setParameters(account, {
            Id: workspaceMetadata.Id,
            Workspaces: tsmap,
        })

        await vbase.initializeABtest()
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