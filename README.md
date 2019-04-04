# A/B Tester

This APP controls analytics part of a A/B test. Its functions are:

  - Track the Workspace metrics
  - Evaluate probabilities of one conversion rate be bigger than other
  - Change value of parameters that controls the traffic in workspaces
  - Evaluate when the test ends and decides the winner Workspace

As observed in the third point above the app do one more thing, which is auto-adjust the traffic in tested workspaces. This is important for two reasons:

  - Don't waste the time of visitors in a clearly worse version when there is one.
  - Moving traffic to a better version improves its "analysis" and then the "true" value of its convertion is calculated faster, which helps the convergence of the test.

## Mathematical Tools

Inside `math-tools` are mathematical functions necessary to evaluate the partial result of the test. Also there is the `decision-rule` that says when there is a Workspace that can be considered the best (with high probability) and which one is this. 

## Use

Install the app and then use the following commands on vtex cli:
