import { Evaluate } from './abTest/evaluate'
import { ColossusContext } from 'colossus'

const account = 'boticario'
const bucket = 'ABTest'
const fileName = 'currentABTest.json'

// TODO: `testId` should be determined in a general way based on account and workspaces
const testId = '0001'

export async function initializeABtest(ctx: ColossusContext) {
    const { resources: { vbase } } = ctx
    const beginning = new Date().toISOString().substr(0, 10)

    await vbase.save(bucket, fileName, {
        name: testId,
        timeStart: beginning
    })
}

export async function ABTestStatus(ctx: ColossusContext): Promise<string> {
    const { resources: { vbase } } = ctx

    let data = await vbase.get(bucket, fileName)
    if (!data) {
        return 'Test not initialized'
    }
    const beginning = data.timeStart
    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)
    console.log(tResult)
    return tResult

}