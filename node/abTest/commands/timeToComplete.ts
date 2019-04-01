import { TimeToCompleteAbTest } from '../time-to-complete'
import { LoggerClient as Logger } from '../../clients/logger'

export async function TTCAbTest(ctx: ColossusContext): Promise<number> {
    const { vtex: { account, route: { params: { probability } } } } = ctx
    try {
        return await TimeToCompleteAbTest(account, Number(probability), ctx)
    } catch (err) {
        const logger = new Logger(ctx, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}