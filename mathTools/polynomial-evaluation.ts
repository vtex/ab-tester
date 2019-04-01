export function evalpoly(P: number[], x: number): number {
    var num = 0
    var degree = P.length

    if (degree < 2 || x === 0) {
        if (degree === 0) {
            return 0;
        }
        return P[0]
    }
    degree -= 1
    num = P[degree] * x + P[degree - 1]
    degree -= 2
    while (degree >= 0) {
        num = num * x + P[degree]
        degree -= 1
    }
    return num
}

export function evalrational(P: number[], Q: number[], x: number): number {
    var num = evalpoly(P, x),
        den = evalpoly(Q, x)

    return num / den
}