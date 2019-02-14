import { logBeta } from './math-tools/beta-function';

/*
    The reason for using the function logBeta is that we're dealing with very large numbers and the 
    Beta with parameters that big will be infiinity and we wont have a determined value for the fraction
    of these "infinity" values. But the fraction calculated is small - not too small - and the logBeta 
    of these large numbers are possible to calculate. So we do the calculations using the logarithmics 
    and then exponatiating.
*/

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
    /*
        We sum 1 to the variables because the Beta function Beta(alpha, beta) consider the situation of
        alpha-1 successes and beta-1 failures.
    */
    var a = x+1,
        b = y+1,
        c = z+1,
        d = w+1

    var logCoefficient1 = logBeta(a+1, b) - logBeta(a, b),
        logCoefficient2 = logBeta(c+1, d) - logBeta(c, d)

    return Math.exp(logCoefficient1) * ProbabilityOfMistake(a+1, b, c, d) - Math.exp(logCoefficient2) * ProbabilityOfMistake(a, b, c+1, d)
}

export function ChooseWinner(convertedInWorkspaceA, notConvertedInWorkspaceA, convertedInWorkspaceB, notConvertedInWorkspaceB, epsilon)
{
    var chooseA = (LossFunction(convertedInWorkspaceA, notConvertedInWorkspaceA, convertedInWorkspaceB, notConvertedInWorkspaceB) < epsilon),
        chooseB = (LossFunction(convertedInWorkspaceB, notConvertedInWorkspaceB, convertedInWorkspaceA, notConvertedInWorkspaceA) < epsilon)

    if (chooseA && chooseB)
    {
        return 'draw'
    }
    else if (chooseA)
    {
        return 'Workspace A'
    }
    else if (chooseB)
    {
        return 'Worksapce B'
    }
    else
    {
        return null
    }
}