import { TimeToCompleteAbTest } from '../analysis/time/timeToComplete'

export async function TTCAbTest(ctx: ColossusContext): Promise<number> {
    const { vtex: { account, route: { params: { probability } } }, resources: { logger, storedash } } = ctx
    try {
        logger.info(`A/B Test Time to Complete checked in ${account}`, 'TestTime')
        return await TimeToCompleteAbTest(1 - Number(probability), storedash)
    } catch (err) {
        logger.error({ status: ctx.status, message: err.message })
        throw new Error(err)
    }
}