import { ExternalClient, IOContext } from '@vtex/api'
import { WorkspaceData } from '../utils/workspace'
import { MinutesSinceQuery } from '../utils/hoursSince'
import { concatErrorMessages } from '../utils/errorHandling'

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

    public getStoredashData = async (from: string) => {
        try {
            return await this.http.get<StoreDashResponse[]>('navigationcube' + AggregationQueryFrom(from), { metric: 'storedash-get' })
        } catch (err) {
            err.message = concatErrorMessages(`Error getting test's metadata from storedash`, err.message)
            throw err
        }
    }

    public getStoredashDataFromTo = async (from: string, to: string) => {
        try{
            return await this.http.get<StoreDashResponse[]>('navigationcube' + AggregationQueryFromTo(from, to), { metric: 'storedash-get' })
        } catch (err) {
            err.message = concatErrorMessages(`Error getting test's partial metadata from storedash`, err.message)
            throw err
        }
    }

    public getWorkspacesData = async (beginning: string): Promise<WorkspaceData[]> => {
        try {
            const from =  MinutesSinceQuery(beginning)
            const metrics = await this.getStoredashData(from)
            const workspacesData: WorkspaceData[] = []
            for (const metric of metrics) {
                const m: StoreDashResponse = metric as unknown as StoreDashResponse
                workspacesData.push(WorkspaceData(m.workspace, m['data.sessions'], m['data.sessionsOrdered'], m['data.ordersValue']))
            }
            return workspacesData
        } catch (err) {
            err.message = 'Error getting workspaces data: ' + err.message
            throw err
        }
    }

    public getWorkspacesGranularData = async (beginning: string): Promise<{data: WorkspaceData[], updateTime: string}> => {
        try {
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
                        workspaceData.OrdersValueHistory.push(...CalculateOrdersValue(m['data.ordersValue'], m['data.sessionsOrdered']))
                    }
                }
                dateFrom.setTime(dateTo.getTime())
                dateTo.setMinutes(dateTo.getMinutes() + 5)
            }
            return {data: [ ...workspacesData.values() ], updateTime: dateFrom.toISOString().substr(0, 16)}
        } catch (err) {
            err.message = 'Error getting workspaces granular data: ' + err.message
            throw err
        }
    }
}

const CalculateOrdersValue = (value: number, sessions: number): number[] => {
    let ordersValue: number[] = []

    if (isNaN(value) || isNaN(sessions) || value <= 0 || sessions <= 0) {
        return ordersValue
    }
    const avarageValue = value/sessions
    for (let i = 0; i < Math.round(sessions); i++) {
        ordersValue.push(avarageValue)
    }
    return ordersValue
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