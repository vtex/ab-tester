import { Evaluate } from './abTest/evaluate'

const account = 'boticario'
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

export async function ABTestStatus(ctx: ColossusContext): Promise<string> {
    const { resources: { vbase } } = ctx

    const data = await vbase.get(bucket, fileName)
    if (!data) {
        return 'Test not initialized'
    }
    const beginning = data.timeStart
    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)
    console.log(tResult)
    return tResult

}