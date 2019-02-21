import { VBase as BaseClient } from '@vtex/api'
import { Readable } from 'stream'

const jsonStream = (arg: any) => {
  const readable = new Readable()
  readable.push(JSON.stringify(arg))
  readable.push(null)
  return readable
}

export default class VBase {
  client: BaseClient

  constructor(opts: any) {
    this.client = new BaseClient(opts)
  }

  get = async (bucket, path) => {
    let file = await this.client.getFile(bucket, path)
    return JSON.parse(file.data.toString())
  }

  save = async (bucket: string, path: string, data: any) => {
    try {
      await this.client.saveFile(bucket, path, jsonStream(data))
    } catch (ex) {
      throw new Error(`Save request for key ${path} in bucket ${bucket} failed!`)
    }
  }
}