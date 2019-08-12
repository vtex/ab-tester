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
        return this.http.get<StoreDashResponse[]>('navigationcube' + AggregationQuery(from), { metric: 'storedash-get' })
    }

    public getWorkspacesData = async (from: string): Promise<WorkspaceData[]> => {
        const metrics = await this.getStoredashData(from)
        const workspacesData: WorkspaceData[] = []
        for (const metric of metrics) {
            const m: StoreDashResponse = metric as unknown as StoreDashResponse
            workspacesData.push(WorkspaceData(m.workspace, m['data.sessions'], m['data.sessionsOrdered']))
        }
        return workspacesData
    }
}

const AggregationQuery = (from: string): string => (
    '?from=' + from + '&to=now&operation=sum&fields=data.sessions,data.sessionsOrdered&aggregateBy=workspace'
)

interface StoreDashResponse {
    workspace: string
    'data.sessions': number
    'data.sessionsOrdered': number
}