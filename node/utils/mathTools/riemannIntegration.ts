type Function = (x: number) => number
const nSteps = 5e+4
 
// The function below integrates f(x).g[0](y[0]).g[1](y[1])...g[len(g)-1](y[len(g)-1])
// over the set of points (x, y) in (0,boundX) x (0,boundsY[0]) x ... x (0,boundsY[len(g)-1]) 
// such that Y[i] < r[i]x for all i = 0,1,...len(g)-1

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

/*
*  At some point, we may want to restrict the intervals of integration's lower bounds, integrating
*  over (fromX,toX) x (fromY[0],toY[0]) x ... x (fromY[len(g)-1],toY[len(g)-1]), 
*  instead of performing the integration all the way from 0.
*  This may be case, for example, if we realise that a store
*  has a high convertion rate and a huge number of sessions.
*/

export function alternativeProbabilityUnderDiagonal(f: Function, g: Function[], r: number[], fromX: number, toX: number, fromY: number[], toY: number[]) {
    const n = g.length

    const stepX = (toX-fromX) / (nSteps+1)
    const to_Y = toY.map((to, idx) => Math.min(to, r[idx]*toX))
    const stepY = to_Y.map((to, idx) => (to-fromY[idx])/(nSteps+1))

    let partial = Array(n).fill(0)
    let I = 0
    let pointX = fromX + stepX
    let pointY = fromY.map((from, idx) => from+stepY[idx])

    for (let i = 1; i <= nSteps; i++) {
        for (const j in pointY) {
            while (pointY[j] <= Math.min(to_Y[j], r[j] * pointX)) { 
                partial[j] += g[j](pointY[j])
                pointY[j] += stepY[j]
            }
        }
        I += f(pointX) * evaluateProduct(partial)
        pointX += stepX
    }
    return I * (toX - fromX) * evaluateProduct(differences(to_Y, fromY)) / (nSteps**(n+1))
}

const differences = (values1: number[], values2: number[]) => values1.map((value1, idx) => value1-values2[idx])