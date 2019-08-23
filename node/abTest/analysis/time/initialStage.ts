import Storedash from '../../../clients/storedash'
import { totalSessions, WorkspaceData } from '../../../utils/workspace'
import { AverageDaySessions } from './timeToComplete'

const TIME_STEP_FACTOR = (1 / 24)
const MasterWorkspaceName = 'master'
const INFINITE_MASS = 1e9

const IsInitialConstraint = (sessions: number, dailySessions: number, hours: number): boolean => (
    sessions < (hours * TIME_STEP_FACTOR * dailySessions)
)

export async function IsInitialStage(hours: number, workspacesData: WorkspaceData[], storedash: Storedash) {
    const dailySessions = await AverageDaySessions(storedash)
    return IsInitialConstraint(totalSessions(workspacesData), dailySessions, hours)
}

export const InitialParameters = (proportion: number, workspaces: ABTestWorkspace[]): Map<string, WorkspaceData> => {
    const map = new Map<string, WorkspaceData>()
    let noOrderSessions = 0
    let orderSessions = 0

    for (const workspace of workspaces) {
        [noOrderSessions, orderSessions] = workspace.name !== MasterWorkspaceName ? [0, 0]
            : [(1 - proportion) * INFINITE_MASS, proportion * INFINITE_MASS]
        map.set(workspace.name, WorkspaceData(workspace.name, noOrderSessions + orderSessions, orderSessions))
    }
    return map
}