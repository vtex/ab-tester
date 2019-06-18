# A/B Tester

This APP controls analytics part of a A/B test. Its functions are:

- Track the Workspace metrics
- Evaluate probabilities of one conversion rate be bigger than other
- Change value of parameters that controls the traffic in workspaces
- Evaluate when the test ends and decides the winner Workspace

As observed in the third point above the app do one more thing, which is auto-adjust the traffic in tested workspaces. This is important for two reasons:

- Don't waste the time of visitors in a clearly worse version when there is one.
- Moving traffic to a better version improves its "analysis" and then the "true" value of its convertion is calculated faster, which helps the convergence of the test.

## Some Math

Now we'll present some very important mathematical concepts used in the A/B test.

First, we will take the simplifying hypothesis of regard only the conversion rate as the metric to be optimized. Now we should understand where it appears. We model our optimization problem in the following way:

- The conversion rate is a random variable with an unknow probability distribution.
- Our model consider that this distribution is a Beta (https://en.wikipedia.org/wiki/Beta_distribution). The distribution has two parameters, which are `(a, b)` and represents `(<number of sessions with orders> + 1 , <number of sessions without orders> + 1)`. So the "unknow probability distribution" translates into unknow parameters of the Beta distribution.
- To learn these parameters we look at the numbers provided by user sessions and how many had an item purchase and how many hadn't. We update our "belief" as follows: if before we have a Beta distribution with parameters `(a, b)`, after the session we update to `(a+1, b)` if the user bought something or update to `(a, b+1)` if he didn't.

 *Remark* As told in Wiki's description, beta distribution is a suitable model for the random behavior of percentages and proportions. As told before in a process with successes and failures, a beta distribution with parameters `(#successes + 1, #failures + 1)` is a good model to the random variable measuring the porportion `#succcesses/(#successes + #failures)` That's the reason we use it as a model for the random variable associated to conversion rate.

Then we must understand some functions calculated to evaluate the performance of each workspace. The key concept here is the `ExpectedLoss`, which represents the expected value of the loss in each choice of workspace. Here the english tells a very important part of the concept: if we want to calculate the expected loss choosing `workspaceA` instead of `workspaceB`, events that corresponds to the former being better than the latter have 0 loss as we actually have gain.

The formal definition of `ExpectedLoss` of choosing `workspaceA` instead of `workspaceB` is the expected value of `X_b-X_a`, where `X_a` represents the random variable that describes the metric observed for `workspaceA` and `X_b` represents the random variable for `workspaceB`, but only calculated for events such that `X_b>X_a`. As every mathematical model definition a nice example can elucidate the concept defined. Look the following:

> Think about a game where you play against a bank roll a fair dice and look the top face of it. The value that appears is the number of dollars the bank you give you. What is the expectation of money that you'll win playing this game? It's easy to calculate, just `1/6+2/6+3/6+4/6+5/6+6/6 = 3.5`. Now we'll change the game a bit. Suppose that when the number in the top face is an odd number you receive nothing and when is even you receive that amount of dollars. The expectation is very likely the last one we calculated but now you receive 0 dollars when the number is odd, so the value can be calculated as `0/6+2/6+0/6+4/6+0/6+6/6 = 2`. The expected value in this game is very likely the one we calculate in *Expected Loss*. As the name suggests, we're calculating the expected value of loss choosing a variant. Well, when this variant is better than the other we don't have any loss, so it's  0. Otherwise there is some loss and we will associate to it its probability of happening.

We also calculate the probability of "B beats A" which usually is calculated for any workspace other than `master` being the "B" and `master` being the "A". To calculate it we just consider the jointy distribution of random variables `X_a` and `X_b` and calculate the probability of `X_b>X_a`.

## Use

Install the app and then use the following commands on vtex cli:

`vtex workspace abtest start`: Start A/B testing the current workspace against master.

`vtex workspace abtest status`: Prints info about currently running A/B tests.

`vtex workspace abtest finish`: Prints the latest info about running A/B tests and stops A/B testing in the current workspace.
