import { VBase } from '@vtex/api'
import { IOContext } from 'colossus'
import { Readable } from 'stream'

const bucket: string = 'master'
const userAgent: string = 'VTEX AB-Tester'

const toStream = (arg: any) => {
  const readable = new Readable()
  readable.push(JSON.stringify(arg))
  readable.push(null)
  return readable
}

export default function VBaseClient({ account, workspace, region, authToken }: IOContext) {
    const client = new VBase({ account, workspace, region, authToken, userAgent })
    const fileName = 'ab-test-data.json'

    return {
        loadBeginning: async () => {
          try {
            const { data } = await client.getFile(bucket, fileName)
            return data
          } catch (err) {
            if(err.status === 404) {
              return []
            }
            throw err
          }
        },

        finishABTest: async () => {
          try {
            return await client.saveFile(bucket, fileName, toStream({}), false)
          } catch (err) {
            throw err
          }
        },

        saveAsBeginning: async (data) => {
          try {
            return await client.saveFile(bucket, fileName, toStream(data), false)
          } catch (err) {
            throw err
          }
        },
    }
}