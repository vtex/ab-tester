import { Beta } from'./math-tools/beta&gamma-functions'

export function ProbabilityOfMistake(a, b, c, d)
{
    var result = 1

    for (var j = 0; j < c; j++) {
        result -= Beta(a+j, b+d)/((d+j) * Beta(1+j, d) * Beta(a, b))
    } 
    return result
}

export function LossFunction(x, y, z, w)
{
    var a = x+1,
        b = y+1,
        c = z+1,
        d = w+1

    return ( Beta(a+1, b) / Beta(a, b) ) * ProbabilityOfMistake(a+1, b, c, d) - ( Beta(c+1, d) / Beta(c, d) ) * ProbabilityOfMistake(a, b, c+1, d)      
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