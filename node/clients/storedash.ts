import { ExternalClient, IOContext } from '@vtex/api'
import { WorkspaceData } from '../utils/workspace'

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
        return this.http.get<StoreDashResponse[]>('sessioncube' + AggregationQuery(from), { metric: 'storedash-get' })
    }

    public getWorkspacesData = async (from: string): Promise<WorkspaceData[]> => {
        const metrics = await this.getStoredashData(from)
        const workspacesData: WorkspaceData[] = []
        for (const metric of metrics) {
            const m: StoreDashResponse = metric as unknown as StoreDashResponse
            workspacesData.push(WorkspaceData(m.workspace, m.count, m['data.orderPlaced']))
        }
        return workspacesData
    }
}

const AggregationQuery = (from: string): string => {
    const stringArr = from.split('-')
    const timeString = stringArr[1]
    const time = Number(timeString.split('m')[0])
    if (time > 60) {
        return `?from=${from}&to=now-60m&operation=sum&fields=count,data.orderPlaced&aggregateBy=workspace`
    }
    return '?from=now-10m&to=now&operation=sum&fields=count,data.orderPlaced&aggregateBy=workspace'
}

interface StoreDashResponse {
    workspace: string
    count: number
    'data.orderPlaced': number
}