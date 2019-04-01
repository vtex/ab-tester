import { logBeta } from '../beta-function'
import { digamma } from '../digamma-function'

export function KLDivergence(Beta1: ABTestParameters, Beta2: ABTestParameters)
{
    const a = Beta1.a,
        b = Beta1.b,
        c = Beta2.a,
        d = Beta2.b
    var total = -logBeta(a, b) + logBeta(c, d),
        sum = a + b,
        lambda1 = digamma(a) - digamma(sum),
        lambda2 = digamma(b) - digamma(sum)

    total += ((a - c) * lambda1) + ((b - d) * lambda2)

    return total
}