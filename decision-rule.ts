import { logBeta } from './math-tools/beta-function';
import { beta, logBeta } from'./math-tools/beta-function'

export function ProbabilityOfMistake(a, b, c, d)
{
    var result = 1

    for (var j = 0; j < c; j++) {
        var logNum = logBeta(a+j, b+d),
            logDen = logBeta(1+j, d) + logBeta(a, b) + Math.log(d+j)

        result -= Math.exp(logNum - logDen)
    } 
    return result
}

export function LossFunction(x, y, z, w)
{
    var a = x+1,
        b = y+1,
        c = z+1,
        d = w+1

    var M1 = logBeta(a+1, b) - logBeta(a, b),
        M2 = logBeta(c+1, d) - logBeta(c, d)

    return Math.exp(M1) * ProbabilityOfMistake(a+1, b, c, d) - Math.exp(M2) * ProbabilityOfMistake(a, b, c+1, d)
}

export function ChooseWinner(convertedA, notConvertedA, convertedB, notConvertedB, epsilon)
{
    var chooseA = (LossFunction(convertedA, notConvertedA, convertedB, notConvertedB) < epsilon),
        chooseB = (LossFunction(convertedB, notConvertedB, convertedA, notConvertedA) < epsilon)

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