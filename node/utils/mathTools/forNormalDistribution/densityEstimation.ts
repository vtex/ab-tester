import { normalQuantile } from './quantile'

const error = 1e-5

/*
*  When the variation is small (in our case, this amounts to the number of sessions
*  being big), the normal distribution's pdf evaluates to huge numbers on a
*  small interval and to really small numbers on the rest of the real line.
*  With that in mind, we restrict our calculations to the the significant
*  interval, so that we achieve more accurate results with better performance.
*/

 
// If we are integrating over {(x,y) | y < x} and if all the points in the significant interval
// belong to such set, we can assume we are integrating over (-infty, infty) x (-infty, infty).
// On the other hand, if none of the points in the significant interval satisfy the inequality,
// the integration amounts to approximately - with extremely small error - zero.
export function has0or1Probability(boundsX: Bounds, boundsOthers: Bounds[]) {
    for (const i in boundsOthers) {
        if (boundsX.u < boundsOthers[i].l) return [true, 0]
        if (boundsX.l < boundsOthers[i].u) return [false, NaN]
    }
    return [true, 1]
}

// Returns l and u such that PDF(x) > error => l < x < u.
export const bounds = (distribution: NormalDistribution) => ({
    l: normalQuantile(distribution, error),
    u: normalQuantile(distribution, 1-error)
})

export interface Bounds {
    l: number   // lower
    u: number   // upper
} 