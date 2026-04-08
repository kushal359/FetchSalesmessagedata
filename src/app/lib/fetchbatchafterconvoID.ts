import { fetchBatchData } from './fetchbatchdata'
import { fetcheachConvo } from './fetcheachconvo'

export async function fetchDetailedBatchData() {
  const baseData = await fetchBatchData()

  const results: any[] = []

  const chunkSize = 20

  for (let i = 0; i < baseData.length; i += chunkSize) {
    const chunk = baseData.slice(i, i + chunkSize)

    const chunkResults = await Promise.all(
      chunk.map(async (item) => {
        const id = item?.id
        if (!id) return null

        try {
          const details = await fetcheachConvo(id)

          return {
            id: String(id),
            teamenoch_type: item.teamenoch_type,
            details,
            uploadedAt: new Date(),
          }
        } catch (err) {
          console.error(`Failed for ID ${id}`, err)
          return null
        }
      }),
    )

    results.push(...chunkResults.filter(Boolean))
  }
  console.log(results)
  return results
}
