import axios from 'axios'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoredashPath = '/metrics/storedash/sessioncube'

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

export async function GetWorkspaceData(endPoint: string, workspace: string, ctx: ColossusContext) {
    var metrics = await getDataFromStoreDash(endPoint, ctx)
    var total = 0,
        noOrders = 0
    for (var metric of metrics) {
        if (metric["workspace"] == workspace) {
            if (metric["data.orderPlaced"] == 'false') {
                noOrders += metric["count"]
                total += metric["count"]
            }
            else {
                total += metric["count"]
            }
        }
    }
    return WorkspaceData(workspace, total, noOrders)
}

export const WorkspaceData = (Workspace: string, TotalSessions: number, NoOrderSessions: number): WorkspaceData => ({
    Workspace: Workspace,
    Sessions: TotalSessions,
    OrderSessions: (TotalSessions - NoOrderSessions),
    NoOrderSessions: NoOrderSessions
})

export const AggregationQuery = (from: string): string => (
    '?from=' + from + '&to=now&operation=sum&fields=count&aggregateBy=workspace,data.orderPlaced')

export const StoreDashRequestURL = (account: string, ABTestBeginning: string): string => (
    baseURL + account + metricsStoredashPath + AggregationQuery(ABTestBeginning))