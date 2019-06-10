import Storedash from '../../../clients/storedash'
import { totalSessions } from '../../../utils/workspace'
import { AverageDaySessions } from './timeToComplete'

const TIME_STEP_FACTOR = (1 / 24)

const IsInitialConstraint = (sessions: number, dailySessions: number): boolean => (
    sessions < (TIME_STEP_FACTOR * dailySessions)
)

export async function IsInitialStage(workspacesData: WorkspaceData[], storedash: Storedash) {
    const dailySessions = await AverageDaySessions(storedash)
    return IsInitialConstraint(totalSessions(workspacesData), dailySessions)
}