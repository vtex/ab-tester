import axios from 'axios'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricStoredashPath = '/metrics/storedash/navigationcube'

export async function getDataFromStoreDash(endPoint: string, ctx: ColossusContext): Promise<JSON[]> {
    return new Promise<JSON[]>((resolve, _reject) => {
        axios.get(endPoint,
            {
                headers: {
                    'Proxy-Authorization': ctx.vtex.authToken,
                    'VtexIdclientAutCookie': ctx.vtex.authToken
                }
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.log(error)
            })
    })
}

export async function GetWorkspaceData(endPoint: string, workspace: string, ctx: ColossusContext): Promise<WorkspaceData> {
    const metrics = await getDataFromStoreDash(endPoint, ctx)
    var total = 0,
        orderSessions = 0
    for (var metric of metrics) {
        if (metric["workspace"] == workspace) {
            orderSessions += metric["data.sessionsOrdered"]
            total += metric["data.sessions"]
        }
    }
    return WorkspaceData(workspace, total, orderSessions)
}

export const WorkspaceData = (Workspace: string, TotalSessions: number, OrderSessions: number): WorkspaceData => ({
    Workspace: Workspace,
    Sessions: TotalSessions,
    OrderSessions: OrderSessions,
    NoOrderSessions: (TotalSessions - OrderSessions)
})

export const AggregationQuery = (from: string): string => (
    '?from=' + from + '&to=now&operation=sum&fields=data.sessions,data.sessionsOrdered&aggregateBy=workspace')

export const StoreDashRequestURL = (account: string, ABTestBeginning: string): string => (
    baseURL + account + metricStoredashPath + AggregationQuery(ABTestBeginning))