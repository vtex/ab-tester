import { TimeToCompleteAbTest } from '../analysis/time/timeToComplete'

export async function TTCAbTest(ctx: Context): Promise<number> {
    const { vtex: { account, logger, route: { params: { probability } } }, clients: { storedash } } = ctx
    try {
        logger.info(`A/B Test Time to Complete checked in ${account}`)
        return await TimeToCompleteAbTest(1 - Number(probability), storedash)
    } catch (err) {
        err.message = 'Error calculating TimeToComplete: ' + err.message
        throw err
    }
}