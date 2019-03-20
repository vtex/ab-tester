# A/B Tester

This APP controls the analytics part during a A/B test. Its functions are:

  - Track the Workspace metrics
  - Evaluate probabilities of one conversion rate be bigger than other
  - Change value of parameters that controls the traffic in workspaces
  - Evaluate when the test ends and decides the winner Workspace

## Mathematical Tools

Inside `math-tools` are mathematical functions necessary to evaluate the partial result of the test. Also there is the `decision-rule` that says when there is a Workspace that can be considered the best (with high probability) and which one is this. 

## Use

Link the app and then use the following commands on vtex cli:
