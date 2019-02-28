/*
* This algorithm probably wont be there anymore and implemented in the kube-router as a logic of
* sortition for Workspaces.
*/

export function sample(successes, failures) {
    return rbeta(1 + successes, 1 + failures)
}

/*
* The next algorithm is due to Cheng in Generating Beta Variates with Nonintegral Parameters
* This is important because we'll use the Thompson Sampling and consider the Prior, and the
* Posterior to be a Beta distribution
*/

export function rbeta(a, b) {
    var ratio = a / b
        , min = Math.min(a, b)
        , lhs, rhs, y, random1, random2, lambda

    lambda = min <= 1 ?
        min : Math.sqrt((2 * a * b - a - b) / (a + b - 2))

    // This choice of parameter lambda is for optimization of algorithm execution
    // Further explanations in the above mentioned article

    do {
        random1 = Math.random()
        random2 = Math.random()
        y = Math.pow((1 / random1) - 1, 1 / lambda)
        lhs = 4 * random1 * random1 * random2
        rhs = Math.pow(y, - a - lambda) * Math.pow((1 + ratio) / (1 + ratio * y), a + b)
    } while (lhs >= rhs)

    var betaSecondKind = ratio * y / (1 + ratio * y)

    return betaSecondKind / (1 + betaSecondKind)
}