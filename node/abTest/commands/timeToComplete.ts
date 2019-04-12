import { LoggerClient as Logger } from '../../clients/logger'
import { TimeToCompleteAbTest } from '../timeToComplete'

export async function TTCAbTest(ctx: ColossusContext): Promise<number> {
    const { vtex: { account, route: { params: { probability } } } } = ctx
    try {
        return await TimeToCompleteAbTest(account, 1 - Number(probability), ctx)
    } catch (err) {
        const logger = new Logger(ctx.vtex, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}