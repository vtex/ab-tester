import Storedash from '../../clients/storedash'
import { MinutesSinceQuery, TimeDifferenceInMinutes } from '../../utils/hoursSince'

const HOUR_TO_MINUTE = 60

export async function Last24HoursData(abTestBeginning: string, storedash: Storedash): Promise<WorkspaceData[]> {
    if (TimeDifferenceInMinutes(abTestBeginning) < 24 * HOUR_TO_MINUTE) {
        return await storedash.getWorkspacesData(MinutesSinceQuery(abTestBeginning))
    }
    return await storedash.getWorkspacesData('now-24h')
}