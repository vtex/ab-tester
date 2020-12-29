import { Bounds } from './forNormalDistribution/densityEstimation'

type Function = (x: number) => number

const nSteps = 5e+4

export function integrate(f: Function, from: number, to: number) {
    if (to <= from) return 0

    const n_steps = 1e+4
    const step = (to-from) / (n_steps+1)
    let I = 0

    for (let i = 1; i <= n_steps; i++) {
        I += f(from + i*step)
    }

    return I * (to - from) / n_steps
}

// The function below integrates f(x).g[0](y[0]).g[1](y[1])...g[len(g)-1](y[len(g)-1])
// over the set of points (x, y) in (0,boundX) x (0,boundsY[0]) x ... x (0,boundsY[len(g)-1]) 
// such that y[i] < r[i]x for all i = 0,1,...len(g)-1.

export function probabilityUnderDiagonal(f: Function, g: Function[], r: number[], boundX: number, boundsY: number[]) {
    const n = g.length

    const stepX = boundX / (nSteps+1)
    const boundY = boundsY.map((bound, idx) => Math.min(bound, r[idx]*boundX))
    const stepY = boundY.map((bound) => bound/(nSteps+1))

    let partial = Array(n).fill(0)
    let I = 0
    let point = [...stepY]

    for (let i = 1; i <= nSteps; i++) {
        for (const j in point) {
            while (point[j] <= Math.min(boundY[j], r[j] * i*stepX)) { 
                partial[j] += g[j](point[j])
                point[j] += stepY[j]
            }
        }
        I += f(i*stepX) * evaluateProduct(partial)
    }
    return I * boundX * evaluateProduct(boundY) / (nSteps**(n+1))
}

const evaluateProduct = (values: number[]) => values.reduce((previousProduct, currentValue) => previousProduct * currentValue)

// The function below integrates (rX.x-rY.y).f(x).g(y) over the set of points
// (x, y) in (0,boundX) x (0,boundY) such that rY.y < rX.x

export function differenceExpectationUnderDiagonal(f: Function, g: Function, rX: number, rY: number, boundX: number, boundY: number) {
    const stepX = boundX / (nSteps+1)
    const actualBoundY = Math.min(boundY, rX * boundX / rY)
    const stepY = actualBoundY / (nSteps+1)

    let sumOfDensities = 0
    let partial = 0
    let I = 0
    let point = stepY

    for (let i = 1; i <= nSteps; i++) {
        partial += rX*stepX * sumOfDensities
        while (rY*point < Math.min(rY*actualBoundY, rX * i*stepX)) {
            sumOfDensities += g(point)
            partial += (rX*i*stepX - rY*point) * g(point)
            point += stepY
        }
        I += f(i*stepX) * partial
    }
    return I * boundX * actualBoundY / nSteps**2
}

// The function below integrates f(x).g[0](y[0]).g[1](y[1])...g[len(g)-1](y[len(g)-1])
// over the set of points (x, y) in boundX x boundsY[0] x ... x boundsY[len(g)-1]
// that satisfy y[i] < x for all i = 0,1,...,len(g)-1.

export function ProbabilityUnderDiagonal(f: Function, g: Function[], boundX: Bounds, boundsY: Bounds[]) {
    const n = g.length

    const stepX = (boundX.u-boundX.l) / (nSteps+1)
    const upperBoundsY = boundsY.map(bound => Math.min(bound.u, boundX.u))
    const stepY = boundsY.map((bound, idx) => (upperBoundsY[idx]-bound.l)/(nSteps+1))

    let partial = Array(n).fill(0)
    let I = 0
    let pointX = boundX.l + stepX
    let pointY = boundsY.map((bound, idx) => bound.l+stepY[idx])

    for (let i = 1; i <= nSteps; i++) {
        for (const j in pointY) {
            while (pointY[j] <= Math.min(upperBoundsY[j], pointX)) { 
                partial[j] += g[j](pointY[j])
                pointY[j] += stepY[j]
            }
        }
        I += f(pointX) * evaluateProduct(partial)
        pointX += stepX
    }
    return I * (boundX.u - boundX.l) * evaluateProduct(interval_lengths(upperBoundsY, boundsY)) / (nSteps**(n+1))
}

const interval_lengths = (actualUpperBounds: number[], bounds: Bounds[]) => bounds.map((bound, idx) => actualUpperBounds[idx] - bound.l)