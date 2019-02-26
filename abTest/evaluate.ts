import axios from 'axios'
import { ChooseWinner, LossFunction } from '../mathTools/decision-rule'
import { boundError } from '../mathTools/statistics/bound-error'
import { KLDivergence } from '../mathTools/statistics/kullback-leibler'
import { Workspaces } from '@vtex/api';

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoredashURL = '/metrics/storedash/SessionCube?from='
const aggregationURL = '&to=now&operation=sum&aggregateBy=workspace,data.orders'

export async function Evaluate(account, ABTestBeginning, workspaceA, workspaceB, ctx: ColossusContext): Promise<TestResult> {
    const endPoint = StoreDashRequestURL(account, ABTestBeginning)

    const workspaceAData = await GetSessionsFromStoreDash(endPoint, workspaceA, ctx),
        workspaceBData = await GetSessionsFromStoreDash(endPoint, workspaceB, ctx)

    if (workspaceAData["sessions"] == 0 || workspaceBData["sessions"] == 0) {
        return EvaluationResponse('A/B Test not initialized for one of the workspaces or it does not already has visitors.', 0, 0, 0)
    }

    const lossA = LossFunction(workspaceAData["OrderSessions"], workspaceAData["NoOrderSessions"], workspaceBData["OrderSessions"], workspaceBData["NoOrderSessions"]),
        lossB = LossFunction(workspaceBData["OrderSessions"], workspaceBData["NoOrderSessions"], workspaceAData["OrderSessions"], workspaceAData["NoOrderSessions"]),
        kldivergence = KLDivergence(workspaceAData["OrderSessions"], workspaceAData["NoOrderSessions"], workspaceBData["OrderSessions"], workspaceBData["NoOrderSessions"])

    const winner = ChooseWinner(workspaceAData["OrderSessions"], workspaceAData["NoOrderSessions"], workspaceBData["OrderSessions"], workspaceBData["NoOrderSessions"], boundError()) || 'not yet decided'
    return EvaluationResponse(winner, lossA, lossB, kldivergence)
}

export async function GetSessionsFromStoreDash(endPoint, workspace, ctx: ColossusContext) {
    var metrics = await getDataFromStoreDash(endPoint, ctx)
    var total = 0,
        noOrders = 0
    for (var metric of metrics) {
        if (metric["workspace"] == workspace) {
            if (metric["data.orders"] == 0) {
                noOrders += metric["sum"]
                total += metric["sum"]
            }
            total += metric["sum"]
        }
    }
    return WorkspaceData(workspace, total, noOrders)
}

export async function getDataFromStoreDash(endPoint, ctx: ColossusContext): Promise<JSON[]> {
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

export const StoreDashRequestURL = (account, ABTestBeginning): string => (
    baseURL + account + metricsStoredashURL + ABTestBeginning + aggregationURL)

export const WorkspaceData = (Workspace, TotalSessions, NoOrderSessions): WorkspaceData => ({
    Workspace: Workspace,
    Sessions: TotalSessions,
    OrderSessions: (TotalSessions - NoOrderSessions),
    NoOrderSessions: NoOrderSessions
})

export const EvaluationResponse = (winner, lossA, lossB, KullbackLeibler): TestResult => ({
    Winner: winner,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    KullbackLeibler: KullbackLeibler
})