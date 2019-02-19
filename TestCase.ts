import { Evaluate } from './ab-test/evaluate'
import { ColossusContext } from 'colossus'
// import { formatDate } from './ab-test/date-formater'
import VBase from './node/vbase';


export async function ABtest(ctx: ColossusContext)
{
    const vbase = await new VBase(ctx.vtex)
    var beginning = '2019-01-01'
    var account = 'basedevmkp'
    //var testId = '0001'

    var data = await vbase.get('ABTest', 'currentTestAB.json')
    console.log(data.testId)
    /* if(data.name == testId)
    {
        beginning = data.timeStart
    }*/

    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)



    console.log(tResult)
    return  tResult
}