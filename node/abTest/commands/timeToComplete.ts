import { LoggerClient as Logger } from '../../clients/logger'
import { TimeToCompleteAbTest } from '../time-to-complete'

export async function TTCAbTest(ctx: ColossusContext): Promise<number> {
    const { vtex: { account, route: { params: { probability } } } } = ctx
    try {
        return await TimeToCompleteAbTest(account, 1 - Number(probability), ctx)
    } catch (err) {
        const logger = new Logger(ctx, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}

export async function getWithRetriesHelper(retries: number, ctx: ColossusContext) {
    let error = null
    while (retries--) {
        try {
            return await TTCAbTest(ctx)
        } catch (err) {
            err.response ?
                console.error(`Error ${err.response.status} on getting TTC of A/B Test, ${retries} retries left`) :
                console.error(`Error on getting TTC of A/B Test, ${retries} retries left`)
            error = err
        }
    }
    throw error
}