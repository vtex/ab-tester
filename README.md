# A/B Tester

This APP controls the analytics part during a A/B test. Its functions are:

  - Keep tracking of the Workspaces metrics
  - Evaluate what are the probabilities of each conversion rate to be a specific value
  - Based on these probabilities assign weights for the Workspaces controlling their traffic
  - Evaluate when the test ends and decides the winner Workspace

## The `decision-rule.js`

There are functions that can answer the question "Does the A/B Test finished?". The way it does it is verifying if the test already has a winner or if both `Workspaces` have (almost) equal performance.
The most important function here is the `LossFunction`. It tell us, in some sense, how much we'll loose if chosen one of the options. With this evaluation 
we can create a Decision Rule that tell us that one `Workspace` won the Test if the evaluated `LossFunction` in respect to it is smaller than `epsilon`.

#### `ProbabilityOfMistake` function

Here we're trying to calculate the probability of `P(X>Y)` where `X` and `Y` are two random variables. The parameters are `a`, `b`, `c` and `d` are the parameters 
of the Beta distributions `X~Beta(a, b)` and `Y~Beta(c, d)`. Considering a `Beta` distribution we have the beautiful formula calculated in the function 
`ProbabilityOfMistake` due to Evan Miller. 

#### `LossFunction` function

The parameters are `x`, `y`, `z` and `w` wich are respectively the number of sales in `Workspace A`, the number of visitors that didn't bought anything 
in the `Workspace A`, number of sales in `Workspace B`, the number of visitors that didn't bought anything in the `Workspace B` are respectively substituted
by `a+1`, `b+1`, `c+1` and `d+1` as a `Beta(p, q)` distribution consider that some outcome happened `p-1` times and didn't happened `q-1` times.
This function calculates the expected value of loss choosing `Workspace A` instead of `Workspace B`. Again, this calculation would be difficult but
for `Beta` distributions we have the beautiful formula given in the function `LossFunction` that came from a algebraic manipulation using the formula of 
E. Miller used in the function `ProbabilityOfMistake`.

## The `test-evaluation.js`

#### `getDataStoreDash` function

Returns a data from StoreDash given an endpoint

#### `Evaluate` function

Returns the winner Workspace. Uses function `Ammount` to get the specifics data about `Sessions` and `orderPlacedSessions`.
