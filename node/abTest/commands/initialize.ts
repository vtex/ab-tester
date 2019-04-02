import { LoggerClient as Logger } from '../../clients/logger'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { TestingWorkspaces } from '../../workspace/list'
import { InitializeABTestParams } from '../../workspace/modify'
import { initializeABtest } from '../saveBeginning'

export async function InitializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { probability, initializingWorkspace } } } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        const testingWorkspaces = await TestingWorkspaces(account, ctx)
        if (!testingWorkspaces.includes('master')) {
            await InitializeABTestParams(account, 'master', ctx)
        }
        await InitializeABTestParams(account, workspaceName, ctx)
        await initializeABtest(1 - Number(probability), ctx)
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found'
        }
        const logger = new Logger(ctx, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}

export async function getWithRetriesHelper(retries: number, ctx: ColossusContext) {
    let error = null
    while (retries--) {
        try {
            return await InitializeAbTestForWorkspace(ctx)
        } catch (err) {
            err.response ?
                console.error(`Error ${err.response.status} on initialize A/B Test, ${retries} retries left`) :
                console.error(`Error on initialize A/B Test, ${retries} retries left`)
            error = err
        }
    }
    throw error
}