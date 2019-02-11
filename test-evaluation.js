import { headerDefault, withAuthToken } from './headers'
const axios = require('axios');

var decisionRule = require('./decision-rule');

require('util');

function Evaluate(account, ABTestBeginning, workspaceA, workspaceB)
{
    var endPointBounceSessions = util.format('http://api.vtex.com/api/storedash/%s/metrics/bouncesessions?from=%s&to=now&operation=sum&aggregateBy=workspace', account, ABTestBeginning),
        endPointNoBounceSessions = util.format('http://api.vtex.com/api/storedash/%s/metrics/nobouncesessions?from=%s&to=now&operation=sum&aggregateBy=workspace', account, ABTestBeginning),
        endPointOrderPlacedSessions = util.format('http://api.vtex.com/api/storedash/%s/metrics/orderplacedsessions?from=%s&to=now&operation=sum&aggregateBy=workspace', account, ABTestBeginning)

    var ordersA = Ammount(endPointOrderPlacedSessions, workspaceA),
        ordersB = Ammount(endPointOrderPlacedSessions, workspaceB),
        bounceSessionsA = Ammount(endPointBounceSessions, workspaceA),
        bounceSessionsB = Ammount(endPointBounceSessions, workspaceB),
        noBounceSessionsA = Ammount(endPointNoBounceSessions, workspaceA),
        noBounceSessionsB = Ammount(endPointNoBounceSessions, workspaceB)

    return decisionRule.ChooseWinner(ordersA, (bounceSessionsA + noBounceSessionsA) - ordersA, ordersB, (bounceSessionsB + noBounceSessionsB) - ordersB, 0.05)
}
exports.Evaluate = Evaluate;

function Ammount(endPoint, workspace)
{
    var rawData = getDataStoreDash(endPoint)
    var metrics = JSON.parse(rawData)
    for(metric in metrics)
    {
        if(metric.workspace == workspace)
        {
            return metric.sum
        }
    }
    return null
}
exports.Ammount = Ammount;


// TODO: the functions for auth are not finished yet
function getDataStoreDash(endPoint)
{
    axios.get(endPoint,
        {
            headers: withAuthToken(headerDefault(), { vtex }, false)
        })
    .then(function (response) {
        return response.data
    })
    .catch(function (error) {
        console.log(error)
      })
}
exports.getDataStoreDash = getDataStoreDash;

function temporaryResult(account, ABTestBeginning, workspaceA, workspaceB)
{
    var endPointBounceSessions = util.format('http://api.vtex.com/api/storedash/%s/metrics/bouncesessions?from=%s&to=now&operation=sum&aggregateBy=workspace', account, ABTestBeginning),
        endPointNoBounceSessions = util.format('http://api.vtex.com/api/storedash/%s/metrics/nobouncesessions?from=%s&to=now&operation=sum&aggregateBy=workspace', account, ABTestBeginning),
        endPointOrderPlacedSessions = util.format('http://api.vtex.com/api/storedash/%s/metrics/orderplacedsessions?from=%s&to=now&operation=sum&aggregateBy=workspace', account, ABTestBeginning)

    var ordersA = Ammount(endPointOrderPlacedSessions, workspaceA),
        ordersB = Ammount(endPointOrderPlacedSessions, workspaceB),
        bounceSessionsA = Ammount(endPointBounceSessions, workspaceA),
        bounceSessionsB = Ammount(endPointBounceSessions, workspaceB),
        noBounceSessionsA = Ammount(endPointNoBounceSessions, workspaceA),
        noBounceSessionsB = Ammount(endPointNoBounceSessions, workspaceB)

        var notConvertedA = bounceSessionsA + noBounceSessionsA,
            notConvertedB = bounceSessionsB + noBounceSessionsB

        var lossA = LossFunction(ordersA, notConvertedA, ordersB, notConvertedB),
            lossB = LossFunction(ordersB, notConvertedB, ordersA, notConvertedA)

        return util.format('Expected Loss Choosing A: %f ; Expected Loss Choosing B: %f', lossA, lossB)
}
exports.temporaryResult = temporaryResult;