import { VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'
import { concatErrorMessages } from '../utils/errorHandling'

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

const InitialWorkspaceDataCache = (date: Date): WorkspaceDataCache => {
  return {
    lastUpdate: date.toISOString().substr(0, 16),
    ordersValue: [],
  }
}

export default class VBase extends BaseClient {

  public getTestData = async (ctx: Context): Promise<VBaseABTestData> => {
    try {
      const testData = await this.get(testFileName, ctx)
      return testData as VBaseABTestData
    } catch (ex) {
      ctx.vtex.logger.error(ex)
      throw new Error(`An error occurred trying to get test's metadata!`)
    }
  }

  public getWorkspaceDataCache = async (ctx: Context): Promise<WorkspaceDataCache> => {
    try {
      const ordersValueHistory = await this.get(WorkspaceDataFile, ctx)
      return ordersValueHistory as WorkspaceDataCache
    } catch (ex) {
      ctx.vtex.logger.error(ex)
      throw new Error(`An error occurred trying to get test's OrdersValueHistory!`)
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

  public initializeABtest = async (initialTime: number, proportion: number, testType: TestType, ctx: Context) => {
    const beginning = new Date().toISOString().substr(0, 16)
    try {
      const initialCache = InitialWorkspaceDataCache(new Date())
      await this.save(initialCache, WorkspaceDataFile, ctx)
    } catch (err) {
      err.message = 'Error setting initial cache on VBase: ' + err.message
      throw err
    }
    try {
      await this.save({
        dateOfBeginning: beginning,
        initialProportion: proportion,
        initialStageTime: initialTime,
        testType: testType,
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

  public finishABtest = async (ctx: Context, results: TestResult[]): Promise<void> => {
    const testHistory = await this.fetchTestHistory(ctx)
    let hasTestResult = true
    if (results.length === 0) {
      hasTestResult = false
      ctx.vtex.logger.error(`Inconsistent data about initialized test`)
    }
    let date = hasTestResult ? results[0].ABTestBeginning : ''
    if (date !== testHistory.onGoing) {
      date = testHistory.onGoing
      ctx.vtex.logger.error(`Inconsistent data about initialization date`)
    }

    const testResultsFile = 'TestResults' + date + '.json'

    testHistory.onGoing = ''
    testHistory.finishedTests.push(date)
    if (testHistory.finishedTests.length > 100) {
      testHistory.finishedTests.shift()
    }
    try {
      await Promise.all([this.save(testHistory, abTestHistoryFile, ctx), this.save(results, testResultsFile, ctx)])
    } catch (ex) {
      ctx.vtex.logger.error(ex)
      throw new Error(`Something went wrong while finishing the test and updating its metadata!`)
    }

    try {
      await this.deleteFile(bucketName(ctx.vtex.account), testFileName)
    } catch (ex) {
      ctx.vtex.logger.error({ exception: ex, error: 'inconsistent_state', account: ctx.vtex.account, workspace: ctx.vtex.workspace })
      throw new Error(`Something went wrong while finishing the test and updating its metadata! Tests metadata can be inconsistent.`)
    }
  }

  public updateWorkspaceDataCache = async (newValue: WorkspaceDataCache, ctx: Context): Promise<void> => {
    try {
      return this.save(newValue, WorkspaceDataFile, ctx)
    } catch (ex) {
      ctx.vtex.logger.error(ex)
      throw new Error(`An error occurred trying to update test's workspace data cache!`)
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
  }
}

interface ABTestHistory {
  onGoing: string
  finishedTests: string[]
}

interface WorkspaceDataCache {
  ordersValue: WorkspaceData[]
  lastUpdate: string
}