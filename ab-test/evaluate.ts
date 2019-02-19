import axios from 'axios'
import { ChooseWinner, LossFunction } from '../math-tools/decision-rule'
import { ColossusContext } from 'colossus'

const boundError = 0.00001
const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoreDashURL = '/metrics/storedash/'

export async function Evaluate(account, ABTestBeginning, workspaceA, workspaceB, ctx: ColossusContext)
{
    var endPointBounceSessions = StoreDashRequestURL(account, ABTestBeginning, 'bouncesessions'),
        endPointNoBounceSessions = StoreDashRequestURL(account, ABTestBeginning, 'nobouncesessions'),
        endPointOrderPlacedSessions = StoreDashRequestURL(account, ABTestBeginning, 'orderplacedsessions')

    var ordersA = await GetMetricFromStoreDash(endPointOrderPlacedSessions, workspaceA, ctx),
        ordersB = await GetMetricFromStoreDash(endPointOrderPlacedSessions, workspaceB, ctx),
        bounceSessionsA = await GetMetricFromStoreDash(endPointBounceSessions, workspaceA, ctx),
        bounceSessionsB = await GetMetricFromStoreDash(endPointBounceSessions, workspaceB, ctx),
        noBounceSessionsA = await GetMetricFromStoreDash(endPointNoBounceSessions, workspaceA, ctx),
        noBounceSessionsB = await GetMetricFromStoreDash(endPointNoBounceSessions, workspaceB, ctx)

    var sessionsA = bounceSessionsA + noBounceSessionsA,
        sessionsB = bounceSessionsB + noBounceSessionsB

    if(sessionsA == 0 || sessionsB == 0)
    {
        return 'A/B Test not initialized for one of the workspaces or it does not already has visitors.'
    }

    var lossA = LossFunction(ordersA, sessionsA - ordersA, ordersB, sessionsB - ordersB),
        lossB = LossFunction(ordersB, sessionsB - ordersB, ordersA, sessionsA - ordersA)

    var winner = ChooseWinner(ordersA, (bounceSessionsA + noBounceSessionsA) - ordersA, ordersB, (bounceSessionsB + noBounceSessionsB) - ordersB, boundError)
    return 'Winner: ' + winner + ' ; Expected Loss Choosing A: ' + lossA + ' ; Expected Loss Choosing B: ' + lossB
}

export async function GetMetricFromStoreDash(endPoint, workspace, ctx: ColossusContext)
{
    var metrics = await getDataStoreDash(endPoint, ctx)
    for(var metric of metrics)
    {
        if(metric.workspace == workspace)
        {
            return metric.sum
        }
    }
    return 0
}

export async function getDataStoreDash(endPoint, ctx: ColossusContext): Promise<JSON[]>
{
    return new Promise<JSON[]>((resolve, _reject) =>{
    axios.get(endPoint,
        {
            headers: {
                'Proxy-Authorization': ctx.vtex.authToken,
                'VtexIdclientAutCookie': ctx.vtex.authToken
            }
        })
        .then(response => {
            console.log(response.data)
            resolve(response.data);
          })
        .catch(error => {
            console.log(error)
        })
    })
}

export function StoreDashRequestURL(account, ABTestBeginning, metric)
{
    return baseURL + account + metricsStoreDashURL + metric + '?from=' + ABTestBeginning + '&to=now&operation=sum&aggregateBy=workspace'
}