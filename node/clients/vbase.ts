import { IOContext, VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'

const bucketName = (account: string) => 'ABTest-' + account
const fileName = 'currentABTest.json'
const resultsListFile = 'resultsList.json'

const jsonStream = (arg: any) => {
  const readable = new Readable()
  readable.push(JSON.stringify(arg))
  readable.push(null)
  return readable
}

export default class VBase extends BaseClient {
  public get = async (ctx: IOContext): Promise<VBaseABTestData> => {
    try {
      const file = await this.getFile(bucketName(ctx.account), fileName)
      return JSON.parse(file.data.toString()) as VBaseABTestData
    } catch (ex) {
      throw new Error(`Get request for key ${fileName} in bucket ${bucketName(ctx.account)} failed!`)
    }
  }

  public save = async (data: any, file: string, ctx: IOContext) => {
    try {
      await this.saveFile(bucketName(ctx.account), file, jsonStream(data))
    } catch (ex) {
      throw new Error(`Save request for key ${file} in bucket ${bucketName(ctx.account)} failed!`)
    }
  }

  public initializeABtest = (initialTime: number, proportion: number, ctx: IOContext): Promise<void> => {
    const beginning = new Date().toISOString().substr(0, 16)
    return this.save({
      dateOfBeginning: beginning,
      initialProportion: proportion,
      initialStageTime: initialTime,
    } as VBaseABTestData, fileName, ctx)
  }

  public finishABtest = async (ctx: IOContext, results: TestResult[]): Promise<void> => {
    await this.deleteFile(bucketName(ctx.account), fileName)
    if (results.length > 0) {
      const testResultsFile = 'TestResults' + results[0].ABTestBeginning + '.json'
      const resultsList = [...await this.fetchResultsList(ctx), testResultsFile]
      await Promise.all([this.save(results, testResultsFile, ctx), this.save(resultsList, resultsListFile, ctx)])
    }
  }

  private fetchResultsList = async (ctx: IOContext): Promise<string[]> => {
    try {
      const listFile = await this.getFile(bucketName(ctx.account), resultsListFile)
      return JSON.parse(listFile.data.toString()) as string[]
    }
    catch {
      return []
    }
  }
}

interface VBaseABTestData {
  dateOfBeginning: string
  initialStageTime: number
  initialProportion: number
}