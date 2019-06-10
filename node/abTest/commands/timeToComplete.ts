import { LoggerClient as Logger } from '../../clients/logger'
import { TimeToCompleteAbTest } from '../analysis/time/timeToComplete'

export async function TTCAbTest(ctx: ColossusContext): Promise<number> {
    const { vtex: { route: { params: { probability } } }, resources: { storedash } } = ctx
    try {
        return await TimeToCompleteAbTest(1 - Number(probability), storedash)
    } catch (err) {
        const logger = new Logger(ctx.vtex, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}