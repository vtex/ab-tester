var test = require('./test-evaluation');

require('util');

function ABtest()
{
    var winner = ' '
    if(test.Evaluate(account, beginning, 'master', 'abtesting'))
    {
        winner = test.Evaluate(account, beginning, 'master', 'abtesting')
    }
    else
    {
        winner = 'none'
    }
    
    return util.format('Winner: %s ; %s', winner, test.temporaryResult(account, beginning, 'master', 'abtesting'))
}
exports.ABtest = ABtest;