import { Evaluate } from './ab-test/evaluate'
import { ColossusContext } from 'colossus'
import VBase from './node/vbase';

const account = 'boticario'
const bucket = 'ABTest'
const fileName = 'currentTestAB.json'

// TODO: `testId` should be determined in a general way based on account and workspaces
const testId = '0001'

export async function initializeABtest(ctx: ColossusContext) {
    const vbase = await new VBase(ctx.vtex)
    const beginning = new Date().toISOString().substr(0, 10)
    console.log(beginning)

    await vbase.save('ABTest', 'currentTestAB.json', {
        name: testId,
        timeStart: beginning
    })
}

export async function ABTestStatus(ctx: ColossusContext): Promise<string> {
    const vbase = await new VBase(ctx.vtex)

    var data = await vbase.get(bucket, fileName)
    var beginning = data.timeStart
    if (data.name == testId) {
        beginning = data.timeStart
    }

    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)
    console.log(tResult)
    return tResult
}