import { logGamma } from '../gamma-function'

const error = 1e-4

/*
*  When the parameters are big, the beta distribution's pdf evaluates to huge numbers
*  on a small piece of (0,1) and to really small numbers on the rest of it.
*  With that in mind, we restrict our calculations to the the significant
*  interval, so that we achieve more accurate results with better performance.
*/

 
// If we are integrating over {(x,y) | y < r.x} and if all the points in the significant
// interval belong to such set, we can assume we are integrating over (0,1) x (0,1).
// On the other hand, if none of the points in the significant interval satisfy the inequality,
// the integration amounts to approximately - with extremely small error - zero.
export function has0or1Probability(X: ABTestParameters, Others: ABTestParameters[], boundX: number, boundsOthers: number[], r: number[]): [boolean, number] {
    const lowerBoundX = calculateLowerBound(X.a, X.b)

    for (const i in Others) {
        const lowerBound = calculateLowerBound(Others[i].a, Others[i].b)

        if (r[i]*boundX < lowerBound) return [true, 0]
        if (r[i] * lowerBoundX < boundsOthers[i]) return [false, NaN]
    }
    return [true, 1]
}

// Returns l in [0,1) such that beta(a,b)(x) > 1/e^10 => x > l.
// At each step, we suppose x ~ k and apply AM-GM to replace beta(a,b)(x) with a linear expression.
// The new bound we find becomes the new value of k.
export function calculateLowerBound(a: number, b: number) {
    if (a === 1 || b === 1) return 0
    const f = (x: number) => nextLowerBound(a, b, x)
    return iterate(f, (a-1)/(2*a+2*b-4))
}

function nextLowerBound(a: number, b: number, k: number) {
    let bound = k-b*k
    bound += (a+b-2) * k**((b-1)/(a+b-2)) * (1-k)**((a-1)/(a+b-2)) / Math.exp((10+logGamma(a+b)-logGamma(a)-logGamma(b))/(a+b-2))
    bound /= (a-1 - k*(a+b-2))

    if (bound >= (a-1)/(a+b-2)) return (a-1)/(a+b-2) - error   // when k is too big, bound < k; therefore, if bound >= (a-1)/(a+b-2)), k was too small
    if (bound <= 0) return error                               // when k is too small, bound > k; therefore, if bound <= 0, k was too big

    return bound
}

// Returns r in (0,1] such that beta(a,b)(x) > 1/e^10 => x < r.
// Same procedure as in calculateLowerBound.
export function calculateBound(a: number, b: number) {
    if (b === 1) return 1
    const f = (x: number) => nextBound(a, b, x)
    return iterate(f, (2*a+b-3)/(2*a+2*b-4))
}

function nextBound(a: number, b: number, k: number) {
    let bound = b*k-k
    bound -= (a+b-2) * k**((b-1)/(a+b-2)) * (1-k)**((a-1)/(a+b-2)) / Math.exp((10+logGamma(a+b)-logGamma(a)-logGamma(b))/(a+b-2))
    bound /= (k*(a+b-2) - a+1)

    if (bound <= (a-1)/(a+b-2)) return (a-1)/(a+b-2) + error   // when k is too small, bound > k; therefore, if bound <= (a-1)/(a+b-2)), k was too big
    if (bound >= 1) return 1-error                             // when k is too big, bound < k; therefore, if bound >= 1, k was too small

    return bound
}

function iterate(f: (x: number) => number, initialPoint: number) {
    let previous = initialPoint
    let current = f(previous)
    while (Math.abs(previous - current) > error) {
        previous = current
        current = f(previous)
    }
    return current
}