import { logBeta } from '../beta-function'
import { digamma } from '../digamma-function'

export function KLDivergence(Beta1: BetaDistribution, Beta2: BetaDistribution)
{
    const a = Beta1["parameterA"],
        b = Beta1["parameterB"],
        c = Beta2["parameterA"],
        d = Beta2["parameterB"]
    var total = -logBeta(a, b) + logBeta(c, d),
        sum = a + b,
        lambda1 = digamma(a) - digamma(sum),
        lambda2 = digamma(b) - digamma(sum)

    total += ((a - c) * lambda1) + ((b - d) * lambda2)

    return total
}