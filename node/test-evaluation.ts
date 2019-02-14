import axios from 'axios'
import { ChooseWinner, LossFunction } from '../decision-rule';
import { ColossusContext } from 'colossus'

// declare const baseURL = 'http://api.vtex.com/api/storedash/'
// declare const metricsStoreDashPath = '/metrics/storedash/'

export async function Evaluate(account, ABTestBeginning, workspaceA, workspaceB, ctx: ColossusContext)
{
    var endPointBounceSessions = StoreDashRequestURL(account, ABTestBeginning, 'bouncesessions'),
        endPointNoBounceSessions = StoreDashRequestURL(account, ABTestBeginning, 'nobouncesessions'),
        endPointOrderPlacedSessions = StoreDashRequestURL(account, ABTestBeginning, 'orderplacedsessions')

    var ordersA = await Ammount(endPointOrderPlacedSessions, workspaceA, ctx),
        ordersB = await Ammount(endPointOrderPlacedSessions, workspaceB, ctx),
        bounceSessionsA = await Ammount(endPointBounceSessions, workspaceA, ctx),
        bounceSessionsB = await Ammount(endPointBounceSessions, workspaceB, ctx),
        noBounceSessionsA = await Ammount(endPointNoBounceSessions, workspaceA, ctx),
        noBounceSessionsB = await Ammount(endPointNoBounceSessions, workspaceB, ctx)

    var sessionsA = bounceSessionsA + noBounceSessionsA,
        sessionsB = bounceSessionsB + noBounceSessionsB
    
    console.log( LossFunction(10000, 1000000, 12000, 1000150) )

    var lossA = LossFunction(ordersA, sessionsA - ordersA, ordersB, sessionsB - ordersB),
        lossB = LossFunction(ordersB, sessionsB - ordersB, ordersA, sessionsA - ordersA)

    var winner = ChooseWinner(ordersA, (bounceSessionsA + noBounceSessionsA) - ordersA, ordersB, (bounceSessionsB + noBounceSessionsB) - ordersB, 0.005)    
    return 'Winner: ' + winner + ' ; Expected Loss Choosing A: ' + lossA + ' ; Expected Loss Choosing B: ' + lossB
}

export async function Ammount(endPoint, workspace, ctx: ColossusContext)
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
    const baseURL = 'http://api.vtex.com/api/storedash/'
    const metricsStoreDashURL = '/metrics/storedash/'
    return baseURL + account + metricsStoreDashURL + metric + '?from=' + ABTestBeginning + '&to=now&operation=sum&aggregateBy=workspace'
}