function sample(sum, count) 
{
    return rbeta(1 + sum, 1 + count - sum)
}
exports.sample = sample;

  // The next algorithm is due to Cheng in Generating Beta Variates with Nonintegral Parameters
  // This is important because we'll use the Thompson Sampling and consider the Posterior to be a Beta distribution

function rbeta(a, b) 
{
  var ratio = a / b
    , min = Math.min(a, b)
    , lhs, rhs, y, r1, r2, lambda

  lambda = min <= 1 ?
  min : Math.sqrt( (2 * a * b - a - b) / (a + b - 2) )

    // This choice of parameter lambda is for optimization of algorithm execution
    // Further explications on the above mentioned article

do {
    r1 = Math.random()
    r2 = Math.random()
    y = Math.pow( (1 / r1) - 1, 1 / lambda)
    lhs = 4 * r1 * r1 * r2
    rhs = Math.pow(y, - a - lambda) * Math.pow((1 + ratio) / (1 + ratio * y), a + b)
} while(lhs >= rhs)

    var betaSecondKind = ratio * y / (1 + ratio * y)

    return betaSecondKind / (1 + betaSecondKind)
}
exports.rbeta = rbeta;