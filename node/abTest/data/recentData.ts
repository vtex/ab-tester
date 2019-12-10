import Storedash from '../../clients/storedash'
import { TimeDifferenceInMinutes } from '../../utils/hoursSince'

const HOUR_TO_MINUTE = 60

export async function Last24HoursData(abTestBeginning: string, storedash: Storedash): Promise<WorkspaceData[]> {
    if (TimeDifferenceInMinutes(abTestBeginning) < 24 * HOUR_TO_MINUTE) {
        return await storedash.getWorkspacesData(abTestBeginning)
    }
    const beginning = new Date()
    beginning.setDate(beginning.getDate() - 1)
    return await storedash.getWorkspacesData(beginning.toISOString().substr(0, 16))
}