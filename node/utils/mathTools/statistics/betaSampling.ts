// The next algorithm is due to Cheng in Generating Beta Variates with Nonintegral Parameters

export const RandomBeta = (betaVariable: ABTestParameters): number => {
    const a = betaVariable.a
    const b = betaVariable.b
    const ratio = a / b
    const min = Math.min(a, b)
    let LHS: number
    let RHS: number
    let y: number
    let random1: number
    let random2: number

    const lambda = min <= 1.0 ? min : Math.sqrt((2 * a * b - a - b) / (a + b - 2))

    // This choice of parameter lambda is for optimization of algorithm execution
    // Further explanations in the above mentioned article

    do {
        random1 = 1 - Math.random()
        random2 = Math.random()
        y = Math.pow((1.0 / random1) - 1.0, 1.0 / lambda)
        LHS = 4 * random1 * random1 * random2
        RHS = Math.pow(y, -a - lambda) * Math.pow((1.0 + ratio) / (1.0 + ratio * y), a + b)
    } while (LHS >= RHS)

    return ratio * y / (1.0 + ratio * y)
}