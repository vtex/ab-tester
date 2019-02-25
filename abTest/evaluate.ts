import axios from 'axios'
import { ChooseWinner, LossFunction } from '../mathTools/decision-rule'
import { boundError } from '../mathTools/statistics/bound-error'
import { KLDivergence } from '../mathTools/statistics/kullback-leibler'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoredashURL = '/metrics/storedash/SessionCube?from='
const aggregationURL = '&to=now&operation=sum&aggregateBy=workspace,data.orders'

export async function Evaluate(account, ABTestBeginning, workspaceA, workspaceB, ctx: ColossusContext): Promise<TestResult> {
    const endPoint = StoreDashRequestURL(account, ABTestBeginning)

    const noOrderSessionsA = await GetSessionsFromStoreDash(endPoint, workspaceA, false, ctx),
        noOrderSessionsB = await GetSessionsFromStoreDash(endPoint, workspaceB, false, ctx),
        sessionsA = await GetSessionsFromStoreDash(endPoint, workspaceA, true, ctx),
        sessionsB = await GetSessionsFromStoreDash(endPoint, workspaceB, true, ctx)

    if (sessionsA == 0 || sessionsB == 0) {
        return {
            Winner: 'A/B Test not initialized for one of the workspaces or it does not already has visitors.',
            ExpectedLossChoosingA: 0,
            ExpectedLossChoosingB: 0,
            KullbackLeibler: 0
        }
    }

    var orderSessionsA = sessionsA - noOrderSessionsA,
        orderSessionsB = sessionsB - noOrderSessionsB

    const lossA = LossFunction(orderSessionsA, noOrderSessionsA, orderSessionsB, noOrderSessionsB),
        lossB = LossFunction(orderSessionsB, noOrderSessionsB, orderSessionsA, noOrderSessionsA),
        kldivergence = KLDivergence(orderSessionsA, noOrderSessionsA, orderSessionsB, noOrderSessionsB)

    const winner = ChooseWinner(orderSessionsA, noOrderSessionsA, orderSessionsB, noOrderSessionsB, boundError()) || 'not yet decided'
    return {
        Winner: winner,
        ExpectedLossChoosingA: lossA,
        ExpectedLossChoosingB: lossB,
        KullbackLeibler: kldivergence
    }
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

export const StoreDashRequestURL = (account, ABTestBeginning): string =>
    baseURL + account + metricsStoredashURL + ABTestBeginning + aggregationURL