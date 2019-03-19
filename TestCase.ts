import { Evaluate } from './node/abTest/evaluate'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

// TODO: `Id` should be determined in a general way based on account and workspaces
const testId = '0001'

export async function initializeABtest(ctx: ColossusContext): Promise<void> {
    const { resources: { vbase } } = ctx
    const beginning = new Date().toISOString().substr(0, 10)

    return vbase.save(bucket, fileName, {
        Id: testId,
        timeStart: beginning
    } as ABTestData)
}

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult> {
    const { vtex: { account }, resources: { vbase } } = ctx

    const data = await vbase.get(bucket, fileName)
    if (!data) {
        return {
            Winner: 'Test not initialized',
            ExpectedLossChoosingA: 0,
            ExpectedLossChoosingB: 0,
            KullbackLeibler: 0
        }
    }
    const beginning = data.timeStart
    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)
    return tResult

}