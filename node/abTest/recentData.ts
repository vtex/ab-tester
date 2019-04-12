import { IOContext } from '@vtex/api'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'

export async function Last24HoursData(account: string, ctx: IOContext): Promise<WorkspaceData[]> {
    return await GetWorkspacesData(StoreDashRequestURL(account, 'now-24h'), ctx)
}