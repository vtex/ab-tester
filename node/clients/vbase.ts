import { VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'

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
    ordersValue: [],
    lastUpdate: date.toISOString().substr(0, 16)
  }
}

export default class VBase extends BaseClient {

  public getTestData = async (ctx: Context): Promise<VBaseABTestData> => {
    try {
      const testData = await this.get(testFileName, ctx)
      return testData as VBaseABTestData
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`An error occurred trying to get test's metadata!`)
    }
  }

  public getWorkspaceDataCache = async (ctx: Context): Promise<WorkspaceDataCache> => {
    try {
      const ordersValueHistory = await this.get(WorkspaceDataFile, ctx)
      return ordersValueHistory as WorkspaceDataCache
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`An error occurred trying to get test's OrdersValueHistory!`)
    }
  }

  public save = async (data: any, file: string, ctx: Context) => {
    try {
      await this.saveFile(bucketName(ctx.vtex.account), file, jsonStream(data))
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`Save request for key ${file} in bucket ${bucketName(ctx.vtex.account)} failed!`)
    }
  }

  public initializeABtest = async (initialTime: number, proportion: number, ctx: Context) => {
    const beginning = new Date().toISOString().substr(0, 16)
    try {
      const initialCache = InitialWorkspaceDataCache(new Date())
      await this.save(initialCache, WorkspaceDataFile, ctx)
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`An error occurred initializing the test!`)
    }
    try {
      await this.save({
        dateOfBeginning: beginning,
        initialProportion: proportion,
        initialStageTime: initialTime,
        testType: TestType.conversion,
      } as VBaseABTestData, testFileName, ctx)
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`An error occurred initializing the test!`)
    }

    try {
      const testHistory = await this.fetchTestHistory(ctx)
      testHistory.onGoing = beginning
      await this.save(testHistory, abTestHistoryFile, ctx)
    } catch (ex) {
      ctx.clients.logger.error(ex)
      this.mantainConsistentMetadata(ctx)
      throw new Error(`An error occurred initializing the test!`)
    }
  }

  public finishABtest = async (ctx: Context, results: TestResult[]): Promise<void> => {
    const testHistory = await this.fetchTestHistory(ctx)
    if (!(results.length > 0) || results[0].ABTestBeginning !== testHistory.onGoing) {
      ctx.clients.logger.error(`Inconsistent data about initialization date`)
    }

    const testResultsFile = 'TestResults' + testHistory.onGoing + '.json'

    testHistory.onGoing = ''
    testHistory.finishedTests.push(results[0].ABTestBeginning)
    if (testHistory.finishedTests.length > 100) {
      testHistory.finishedTests.shift()
    }
    try {
      await Promise.all([this.save(testHistory, abTestHistoryFile, ctx), this.save(results, testResultsFile, ctx)])
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`Something went wrong while finishing the test and updating its metadata!`)
    }

    try {
      await this.deleteFile(bucketName(ctx.vtex.account), testFileName)
    } catch (ex) {
      ctx.clients.logger.error({ exception: ex, error: 'inconsistent_state', account: ctx.vtex.account, workspace: ctx.vtex.workspace })
      throw new Error(`Something went wrong while finishing the test and updating its metadata! Tests metadata can be inconsistent.`)
    }
  }

  public updateWorkspaceDataCache = async (newValue: WorkspaceDataCache, ctx: Context): Promise<void> => {
    try {
      return this.save(newValue, WorkspaceDataFile, ctx)
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`An error occurred trying to update test's workspace data cache!`)
    }
  }

  private get = async (file: string, ctx: Context) => {
    try {
      const rawFile = await this.getFile(bucketName(ctx.vtex.account), file)
      return JSON.parse(rawFile.data.toString())
    } catch (ex) {
      ctx.clients.logger.error(ex)
      throw new Error(`Get request for key ${testFileName} in bucket ${bucketName(ctx.vtex.account)} failed!`)
    }
  }

  private fetchTestHistory = async (ctx: Context): Promise<ABTestHistory> => {
    try {
      const abTestHistory = await this.get(abTestHistoryFile, ctx) as ABTestHistory
      return abTestHistory
    } catch (ex) {
      ctx.clients.logger.error(ex)
      if (ctx.status === 404) {
        return {
          finishedTests: [],
          onGoing: '',
        } as ABTestHistory
      }
      ctx.clients.logger.error(ex)
      throw new Error(`An error occurred fetching test metadata!`)
    }
  }

  private mantainConsistentMetadata = async (ctx: Context) => {
    try {
      await this.deleteFile(bucketName(ctx.vtex.account), testFileName)
    } catch (ex) {
      ctx.clients.logger.error({ exception: ex, error: 'inconsistent_state', account: ctx.vtex.account, workspace: ctx.vtex.workspace })
      throw new Error(`An error occurred initializing the test and its metadata are inconsistent!`)
    }
  }
}

export enum TestType {
  conversion,
  revenue,
}

interface VBaseABTestData {
  dateOfBeginning: string
  initialStageTime: number
  initialProportion: number
  testType: TestType
}

interface ABTestHistory {
  onGoing: string
  finishedTests: string[]
}

interface WorkspaceDataCache {
  ordersValue: WorkspaceData[]
  lastUpdate: string
}