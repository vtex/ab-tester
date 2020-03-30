import { TimeToCompleteAbTest } from '../analysis/time/timeToComplete'

export async function TTCAbTest(ctx: Context): Promise<number> {
    const { vtex: { account, route: { params: { probability } } }, clients: { logger, storedash } } = ctx
    try {
        logger.info(`A/B Test Time to Complete checked in ${account}`, 'TestTime')
        return await TimeToCompleteAbTest(1 - Number(probability), storedash)
    } catch (err) {
        logger.error({ status: ctx.status, message: err.message })
        throw err
    }
}