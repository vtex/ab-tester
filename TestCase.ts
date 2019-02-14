import { Evaluate } from './node/test-evaluation'
import { ColossusContext } from 'colossus'

export async function ABtest(ctx: ColossusContext)
{
    var account = 'basedevmkp'
    var beginning = '2018'
    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)

    console.log(tResult)
    return  tResult
}