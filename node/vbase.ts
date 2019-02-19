import { VBase as BaseClient} from '@vtex/api'
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

  list = async (bucket) => {
    let result = await this.client.listFiles(bucket)
    return result.data
  }

  listContents = async (bucket) => {
    let files = await this.list(bucket)
    let contents = files.map(f => {
      return this.get(bucket, f.path)
    })
    return await Promise.all(contents)
  }

  get = async (bucket, path) => {
    let file = await this.client.getFile(bucket, path)
    return JSON.parse(file.data.toString())
  }

  save = async (bucket, path, data) => {
    try {
      await this.client.saveFile(bucket, path, jsonStream(data))
    } catch (ex) {
      throw new Error(`Save request for key ${path} in bucket ${bucket} failed!`)
    }
  }
}