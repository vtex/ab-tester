import { logBeta } from '../beta-function'
import { digamma } from '../digamma-function'

export function KLDivergence(Beta1: ABTestParameters, Beta2: ABTestParameters)
{
    const a = Beta1.a
    const b = Beta1.b
    const c = Beta2.a
    const d = Beta2.b
    let total = -logBeta(a, b) + logBeta(c, d)
    const sum = a + b
    const lambda1 = digamma(a) - digamma(sum)
    const lambda2 = digamma(b) - digamma(sum)

    total += ((a - c) * lambda1) + ((b - d) * lambda2)

    return total
}