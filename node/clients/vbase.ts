import { VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'
import { concatErrorMessages } from '../utils/errorHandling'
import { InitialWorkspaceData } from '../utils/workspace'

const bucketName = (account: string) => 'ABTest-' + account
const abTestHistoryFile = 'abTestHistory.json'
const testFileName = 'currentABTest.json'
const WorkspaceDataFile = 'workspaceDataCache.json'

const jsonStream = (arg: any) => {
  const readable = new Readable()
  readable.push(JSON.stringify(arg))
  readable.push(null)
  return readable
}

const InitialWorkspaceDataCache = (date: Date, workspaces: string[]): WorkspaceDataCache => {
  return {
    lastUpdate: date.toISOString().substr(0, 16),
    ordersValue: workspaces.map(workspace => InitialWorkspaceData(workspace)),
  }
}

export default class VBase extends BaseClient {

  public getTestData = async (ctx: Context): Promise<VBaseABTestData> => {
    try {
      const testData = await this.get(testFileName, ctx)
      return testData as VBaseABTestData
    } catch (err) {
      err.message = 'Error getting test\'s metadata from VBase: ' + err.message
      throw err
    }
  }

  public getWorkspaceDataCache = async (ctx: Context): Promise<WorkspaceDataCache> => {
    try {
      const ordersValueHistory = await this.get(WorkspaceDataFile, ctx)
      return ordersValueHistory as WorkspaceDataCache
    } catch (err) {
      err.message = `Error getting test's OrdersValueHistory from VBase: ` + err.message
      throw err
    }
  }

  public save = async (data: any, file: string, ctx: Context) => {
    try {
      await this.saveFile(bucketName(ctx.vtex.account), file, jsonStream(data))
    } catch (err) {
      err.message = concatErrorMessages(`Error saving file ${file} in bucket ${bucketName(ctx.vtex.account)}`, err.message)
      throw err
    }
  }

  public initializeABtest = async (testingWorkspaces: string[], initialTime: number, masterProportion: number, testType: TestType, approach: TestApproach, isMAB: boolean, ctx: Context) => {
    const beginning = new Date().toISOString().substr(0, 16)
    try {
      const initialCache = InitialWorkspaceDataCache(new Date(), testingWorkspaces)
      await this.save(initialCache, WorkspaceDataFile, ctx)
    } catch (err) {
      err.message = 'Error setting initial cache on VBase: ' + err.message
      throw err
    }
    try {
      await this.save({
        dateOfBeginning: beginning,
        initialProportion: masterProportion,
        initialStageTime: initialTime,
        testType: testType,
        testApproach: approach,
        isMAB: isMAB
      } as VBaseABTestData, testFileName, ctx)
    } catch (err) {
      err.message = 'Error setting initial test data on VBase: ' + err.message
      throw err
    }

    try {
      const testHistory = await this.fetchTestHistory(ctx)
      testHistory.onGoing = beginning
      await this.save(testHistory, abTestHistoryFile, ctx)
    } catch (err) {
      err.message = 'Error setting test history on VBase: ' + err.message
      await this.maintainConsistentMetadata(ctx).catch((ex) => {err.message = ex.message + err.message})
      throw err
    }
  }

  public finishABtest = async (ctx: Context, results: TestResult, beginning: string): Promise<void> => {
    const testHistory = await this.fetchTestHistory(ctx)
    
    if (beginning !== testHistory.onGoing) {
      beginning = testHistory.onGoing
      ctx.vtex.logger.error(`Inconsistent data about initialization date`)
    }

    const testResultsFile = 'TestResults' + beginning + '.json'

    testHistory.onGoing = ''
    testHistory.finishedTests.push(beginning)
    if (testHistory.finishedTests.length > 100) {
      testHistory.finishedTests.shift()
    }

    try {
      await this.save(testHistory, abTestHistoryFile, ctx)
     } catch (err) {
      err.message = concatErrorMessages('Error saving test history in VBase', err.message)
      throw err
     }

     try {
      await this.save(results, testResultsFile, ctx)
     } catch (err) {
      err.message = concatErrorMessages('Error saving test results in VBase', err.message)
      throw err
    }

    try {
      await this.deleteFile(bucketName(ctx.vtex.account), testFileName)
    } catch (err) {
      err.message = concatErrorMessages(`Error deleting file ${testFileName} from VBase's bucket ${bucketName(ctx.vtex.account)}: test's metadata may be inconsistent`, err.message)
      throw err
    }

    try {
      await this.deleteFile(bucketName(ctx.vtex.account), WorkspaceDataFile)
    } catch (err) {
      err.message = concatErrorMessages(`Error deleting file ${WorkspaceDataFile} from VBase's bucket ${bucketName(ctx.vtex.account)}`, err.message)
      throw err
    }
  }

  public updateWorkspaceDataCache = async (newValue: WorkspaceDataCache, ctx: Context): Promise<void> => {
    try {
      return await this.save(newValue, WorkspaceDataFile, ctx)
    } catch (err) {
      err.message = `Error updating test's workspace data cache on VBase: ` + err.message
      throw err
    }
  }

  private get = async (file: string, ctx: Context) => {
    try {
      const rawFile = await this.getFile(bucketName(ctx.vtex.account), file)
      return JSON.parse(rawFile.data.toString())
    } catch (err) {
      err.message = concatErrorMessages(`Error reading from file ${testFileName} in bucket ${bucketName(ctx.vtex.account)}`, err.message)
      throw err
    }
  }

  private fetchTestHistory = async (ctx: Context): Promise<ABTestHistory> => {
    try {
      const abTestHistory = await this.get(abTestHistoryFile, ctx) as ABTestHistory
      return abTestHistory
    } catch (err) {
      if (ctx.status === 404) {
        return {
          finishedTests: [],
          onGoing: '',
        } as ABTestHistory
      }
      err.message = 'Error fetching test\'s metadata: ' + err.message
      throw err
    }
  }

  private maintainConsistentMetadata = async (ctx: Context) => {
    try {
      await this.deleteFile(bucketName(ctx.vtex.account), testFileName)
    } catch (ex) {
      ctx.vtex.logger.error({ exception: ex, error: 'inconsistent_state', account: ctx.vtex.account, workspace: ctx.vtex.workspace })
      throw new Error(`The test metadata are inconsistent! `)
    }
  }
}

declare global {
  interface VBaseABTestData {
    dateOfBeginning: string
    initialStageTime: number
    initialProportion: number
    testType: TestType
    testApproach: TestApproach
    isMAB: boolean
  }

  interface WorkspaceDataCache {
    ordersValue: WorkspaceData[]
    lastUpdate: string
  }
}

interface ABTestHistory {
  onGoing: string
  finishedTests: string[]
}