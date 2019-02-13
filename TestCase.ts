import { Evaluate } from './node/test-evaluation'
import { ColossusContext } from 'colossus'

export async function ABtest(ctx: ColossusContext)
{
    var account = 'basedevmkp'
    var beginning = '2018'
    //var winner = Evaluate(account, beginning, 'master', 'abtesting', ctx) ? Evaluate(account, beginning, 'master', 'abtesting', ctx) : 'none'
    
    // return 'Winner:' + winner + ' ; ' + temporaryResult(account, beginning, 'master', 'abtesting')

    const tResult = await Evaluate(account, beginning, 'master', 'abtesting', ctx)

    console.log(tResult)
    return  tResult
}