import { ExternalClient, IOContext } from '@vtex/api'
import { WorkspaceData } from '../utils/workspace'
import { MinutesSinceQuery } from '../utils/hoursSince'

const baseURL = (account: string) => `http://api.vtex.com/api/storedash/${account}/metrics/storedash`

export default class Storedash extends ExternalClient {
    constructor(ctx: IOContext) {
        super(baseURL(ctx.account), ctx, {
            headers: {
                'Proxy-Authorization': ctx.authToken,
                VtexIdclientAutCookie: ctx.authToken,
            },
        })
    }

    public getStoredashData = (from: string) => {
        return this.http.get<StoreDashResponse[]>('navigationcube' + AggregationQueryFrom(from), { metric: 'storedash-get' })
    }

    public getStoredashDataFromTo = (from: string, to: string) => {
        return this.http.get<StoreDashResponse[]>('navigationcube' + AggregationQueryFromTo(from, to), { metric: 'storedash-get' })
    }

    public getWorkspacesData = async (beginning: string): Promise<WorkspaceData[]> => {
        const from =  MinutesSinceQuery(beginning)
        const metrics = await this.getStoredashData(from)
        const workspacesData: WorkspaceData[] = []
        for (const metric of metrics) {
            const m: StoreDashResponse = metric as unknown as StoreDashResponse
            workspacesData.push(WorkspaceData(m.workspace, m['data.sessions'], m['data.sessionsOrdered'], m['data.ordersValue']))
        }
        return workspacesData
    }

    public getWorkspacesGranularData = async (beginning: string): Promise<{data: WorkspaceData[], updateTime: string}> => {
        const metrics = await this.getStoredashData(MinutesSinceQuery(beginning))
        const workspacesData: Map<string, WorkspaceData> = new Map()
        for (const metric of metrics) {
            const m: StoreDashResponse = metric as unknown as StoreDashResponse
            workspacesData.set(m.workspace, WorkspaceData(m.workspace, m['data.sessions'], m['data.sessionsOrdered'], m['data.ordersValue']))
        }

        const dateFrom: Date = new Date(beginning)
        const dateTo: Date = new Date(beginning)
        const now = new Date()
        dateTo.setMinutes(dateTo.getMinutes() + 5)
        while (dateTo < now) {
            const metrics = await this.getStoredashDataFromTo(MinutesSinceQuery(dateFrom.toISOString().substr(0, 16)), MinutesSinceQuery(dateTo.toISOString().substr(0, 16)))
            for (let i = 0; i < metrics.length; i++) {
                const m: StoreDashResponse = metrics[i] as unknown as StoreDashResponse
                const workspaceData = workspacesData.get(m['workspace'])
                if (workspaceData !== undefined) {
                    workspaceData.OrdersValueHistory.push(CalculateOrdersValue(m['data.ordersValue'], m['data.sessionsOrdered']))
                }
            }
            dateFrom.setTime(dateTo.getTime())
            dateTo.setMinutes(dateTo.getMinutes() + 5)
        }
        return {data: [ ...workspacesData.values() ], updateTime: dateFrom.toISOString().substr(0, 16)}
    }
}

const CalculateOrdersValue = (value: number, sessions: number): number => {
    const sessionsCleaned = (sessions === NaN || sessions <= 0) ? 1 : sessions
    const valueCleaned = (value === NaN || value <= 0) ? 0 : value
    return (valueCleaned/sessionsCleaned)
}

const AggregationQueryFrom = (from: string): string => (
    '?from=' + from + '&to=now&operation=sum&fields=data.sessions,data.sessionsOrdered,data.ordersValue&aggregateBy=workspace'
)

const AggregationQueryFromTo = (from: string, to: string): string => (
    '?from=' + from + '&to=' + to + '&operation=sum&fields=data.sessions,data.sessionsOrdered,data.ordersValue&aggregateBy=workspace'
)

interface StoreDashResponse {
    workspace: string
    'data.sessions': number
    'data.sessionsOrdered': number
    'data.ordersValue': number
}