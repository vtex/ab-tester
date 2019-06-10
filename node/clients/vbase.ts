import { VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'

const bucketName = 'ABTest'
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

  public get = async (bucket: string, path: string) => {
    try {
      const file = await this.client.getFile(bucket, path)
      return JSON.parse(file.data.toString())
    } catch (ex) {
      throw new Error(`Get request for key ${path} in bucket ${bucket} failed!`)
    }
  }

  public save = async (bucket: string, path: string, data: any) => {
    try {
      await this.client.saveFile(bucket, path, jsonStream(data))
    } catch (ex) {
      throw new Error(`Save request for key ${path} in bucket ${bucket} failed!`)
    }
  }

  public initializeABtest = async (probability: number): Promise<void> => {
    const beginning = new Date().toISOString().substr(0, 16)
    return await this.save(bucketName, fileName, {
      dateOfBeginning: beginning,
      probability: (probability),
    } as VBaseABTestData)
  }

  public finishABtest = async (): Promise<void> => {
    await this.client.deleteFile(bucketName, fileName)
  }
}