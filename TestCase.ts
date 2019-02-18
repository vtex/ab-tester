import { Evaluate } from './ab-test/evaluate'
import { ColossusContext } from 'colossus'

export async function ABtest(ctx: ColossusContext)
{
    var account = 'basedevmkp'
    var beginning = '2018'
    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)

    console.log(new Date().getTime())
    console.log(tResult)
    return  tResult
}