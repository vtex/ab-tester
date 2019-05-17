import { IOContext } from '@vtex/api'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { MinutesSinceQuery, TimeDifferenceInMinutes } from '../utils/hoursSince'

const HOUR_TO_MINUTE = 60

export async function Last24HoursData(account: string, abTestBeginning: string, ctx: IOContext): Promise<WorkspaceData[]> {
    if(TimeDifferenceInMinutes(abTestBeginning) < 24 * HOUR_TO_MINUTE) {
        return await GetWorkspacesData(StoreDashRequestURL(account, MinutesSinceQuery(abTestBeginning)), ctx)
    }
    return await GetWorkspacesData(StoreDashRequestURL(account, 'now-24h'), ctx)
}