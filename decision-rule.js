var mTools = require('./math-tools/beta&gamma-functions');

function ProbabilityOfMistake(a, b, c, d)
{
    var result = 1

    for (var j = 0; i < c; j++) {
        result -= mTools.Beta(a+j, b+d)/((d+j) * mTools.Beta(1+j, d) * mTools.Beta(a, b))
    } 
    return result
}
exports.ProbabilityOfMistake = ProbabilityOfMistake;

function LossFunction(x, y, z, w)
{
    var a = x+1,
        b = y+1,
        c = z+1,
        d = w+1

    return ( mTools.Beta(a+1, b) / mTools.Beta(a, b) ) * ProbabilityOfMistake(a+1, b, c, d) - ( mTools.Beta(c+1, d) / mTools.Beta(c, d) ) * ProbabilityOfMistake(a, b, c+1, d)      
}
exports.LossFunction = LossFunction;

function ChooseWinner(x, y, z, w, epsilon)
{
    var chooseA = (LossFunction(x, y, z, w) < epsilon),
        chooseB = (LossFunction(z, w, x, y) < epsilon)

    if (chooseA && chooseB)
    {
        return 'draw'
    }
    else if (chooseA)
    {
        return 'armA'
    }
    else if (chooseB)
    {
        return 'armB'
    }
    else
    {
        return null
    }
}
exports.ChooseWinner = ChooseWinner;
