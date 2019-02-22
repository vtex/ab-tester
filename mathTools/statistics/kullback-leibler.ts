import { logBeta } from '../beta-function'
import { digamma } from '../digamma-function'

export function KLDivergence(parameterA1, parameterA2, parameterB1, parameterB2)
{
    var total = -logBeta(parameterA1, parameterA2) + logBeta(parameterB1, parameterB2),
        parameterA = parameterA1 + parameterA2,
        lambda1 = digamma(parameterA1) - digamma(parameterA),
        lambda2 = digamma(parameterA2) - digamma(parameterA)

    total += ((parameterA1 - parameterB1) * lambda1) + ((parameterA2 - parameterB2) * lambda2)

    return total
}