import { logBeta } from '../beta-function'
import { digamma } from '../digamma-function'

export function KLDivergence(workspaceA: WorkspaceData, workspaceB: WorkspaceData)
{
    const a = workspaceA["OrderSessions"] + 1,
        b = workspaceA["NoOrderSessions"] + 1,
        c = workspaceB["OrderSessions"] + 1,
        d = workspaceB["NoOrderSessions"] + 1
    var total = -logBeta(a, b) + logBeta(c, d),
        total = a + b,
        lambda1 = digamma(a) - digamma(total),
        lambda2 = digamma(b) - digamma(total)

    total += ((a - c) * lambda1) + ((b - d) * lambda2)

    return total
}