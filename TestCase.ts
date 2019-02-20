import { Evaluate } from './ab-test/evaluate'
import { ColossusContext } from 'colossus'
// import { formatDate } from './ab-test/date-formater'
import VBase from './node/vbase';

const account = 'basedevmkp'

export async function initializeABtest(ctx: ColossusContext)
{
    const vbase = await new VBase(ctx.vtex)
    var beginning = '2019-01-01' //formatDate(new Date().getTime())
    var testId = '0001'

    await vbase.save('ABTest', 'currentTestAB.json', {
        name: testId,
        timeStart: beginning
    })
}

export async function ABTestStatus(ctx: ColossusContext)
{
    const vbase = await new VBase(ctx.vtex)

    var data = await vbase.get('ABTest', 'currentTestAB.json')
    var beginning = data.timeStart
    /* if(data.name == testId)
    {
        beginning = data.timeStart
    }*/

    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)
    console.log(tResult)
    return  tResult
}