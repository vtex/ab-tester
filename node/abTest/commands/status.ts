import { LoggerClient as Logger } from '../../clients/logger'
import { DefaultEvaluationResponse } from '../../utils/evaluation-response'
import { TestWorkspaces } from '../test-workspaces'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult[]> {
    const { vtex: { account }, resources: { vbase } } = ctx

    try {
        const data = await vbase.get(bucket, fileName)
        if (!data) {
            return [DefaultEvaluationResponse('Test not initialized', 'none', 'none')]
        }
        const beginning = data.timeStart
        const probability = data.probability

        return await TestWorkspaces(account, beginning, probability, ctx)
    } catch (err) {
        const logger = new Logger(ctx, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}