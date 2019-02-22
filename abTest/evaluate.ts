import axios from 'axios'
import { ChooseWinner, LossFunction } from '../mathTools/decision-rule'
import { boundError } from '../mathTools/statistics/bound-error'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoredashURL = '/metrics/storedash/SessionCube?from='
const aggregationURL = '&to=now&operation=sum&aggregateBy=workspace,data.orders'

export async function Evaluate(account, ABTestBeginning, workspaceA, workspaceB, ctx: ColossusContext) {
    const endPoint = StoreDashRequestURL(account, ABTestBeginning)

    const noOrderSessionsA = await GetSessionsFromStoreDash(endPoint, workspaceA, false, ctx),
        noOrderSessionsB = await GetSessionsFromStoreDash(endPoint, workspaceB, false, ctx),
        sessionsA = await GetSessionsFromStoreDash(endPoint, workspaceA, true, ctx),
        sessionsB = await GetSessionsFromStoreDash(endPoint, workspaceB, true, ctx)

    if (sessionsA == 0 || sessionsB == 0) {
        return 'A/B Test not initialized for one of the workspaces or it does not already has visitors.'
    }

    var orderSessionsA = sessionsA - noOrderSessionsA,
        orderSessionsB = sessionsB - noOrderSessionsB

    const lossA = LossFunction(orderSessionsA, noOrderSessionsA, orderSessionsB, noOrderSessionsB),
          lossB = LossFunction(orderSessionsB, noOrderSessionsB, orderSessionsA, noOrderSessionsA)

    const winner = ChooseWinner(orderSessionsA, noOrderSessionsA, orderSessionsB, noOrderSessionsB, boundError()) || 'not yet decided'
    return 'Winner: ' + winner + ' | Expected Loss Choosing A: ' + lossA + ' ; Expected Loss Choosing B: ' + lossB
}

export async function GetSessionsFromStoreDash(endPoint, workspace, isTotalSessions: boolean, ctx: ColossusContext) {
    var metrics = await getDataStoreDash(endPoint, ctx)
    var total = 0
    for (var metric of metrics) {
        if (isTotalSessions) {
            if (metric["workspace"] == workspace) {
                total += metric["sum"]
            }
        }
        else {
            if (metric["workspace"] == workspace && metric["data.orders"] != 0) {
                total += metric["sum"]
            }
        }
    }
    return total
}

export async function getDataStoreDash(endPoint, ctx: ColossusContext): Promise<JSON[]> {
    return new Promise<JSON[]>((resolve, _reject) => {
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

export function StoreDashRequestURL(account, ABTestBeginning) {
    return baseURL + account + metricsStoredashURL + ABTestBeginning + aggregationURL
}