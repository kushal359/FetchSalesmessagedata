import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { saveBatchStats } from './app/lib/saveBatchstats'
import { fetchDetailedBatchData } from './app/lib/fetchbatchafterconvoID'
import { getBatchStats } from './app/services/statsServices'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  endpoints: [
    {
      path: '/batch-stats',
      method: 'get',
      handler: async () => {
        try {
          const data = await fetchDetailedBatchData()
          const result = await saveBatchStats(data)
          return Response.json(result)
        } catch (err) {
          console.error(err)

          return Response.json({ error: 'Something went wrong' }, { status: 500 })
        }
      },
    },
    {
      path: '/get-batch-stats',
      method: 'post',
      handler: async (req: any) => {
        try {
          const { lastDoc } = await req.json()

          const result = await getBatchStats(100, lastDoc)
          return Response.json(result)
        } catch (err) {
          return Response.json({ error: 'Failed to fetch' }, { status: 500 })
        }
      },
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
