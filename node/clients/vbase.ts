import { IOContext, VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'

const bucketName = (account: string) => 'ABTest-' + account
const fileName = 'currentABTest.json'

const jsonStream = (arg: any) => {
  const readable = new Readable()
  readable.push(JSON.stringify(arg))
  readable.push(null)
  return readable
}

export default class VBase {
  private client: BaseClient

  constructor(opts: any) {
    this.client = new BaseClient(opts)
  }

  public get = async (ctx: IOContext): Promise<VBaseABTestData> => {
    try {
      const file = await this.client.getFile(bucketName(ctx.account), fileName)
      return JSON.parse(file.data.toString()) as VBaseABTestData
    } catch (ex) {
      throw new Error(`Get request for key ${fileName} in bucket ${bucketName(ctx.account)} failed!`)
    }
  }

  public save = async (data: any, ctx: IOContext) => {
    try {
      await this.client.saveFile(bucketName(ctx.account), fileName, jsonStream(data))
    } catch (ex) {
      throw new Error(`Save request for key ${fileName} in bucket ${bucketName(ctx.account)} failed!`)
    }
  }

  public initializeABtest = async (initialTime: number, proportion: number, ctx: IOContext): Promise<void> => {
    const beginning = new Date().toISOString().substr(0, 16)
    return await this.save({
      dateOfBeginning: beginning,
      initialProportion: proportion,
      initialStageTime: initialTime,
    } as VBaseABTestData, ctx)
  }

  public finishABtest = async (ctx: IOContext): Promise<void> => {
    await this.client.deleteFile(bucketName(ctx.account), fileName)
  }
}

interface VBaseABTestData {
  dateOfBeginning: string
  initialStageTime: number
  initialProportion: number
}