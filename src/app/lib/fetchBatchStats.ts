export async function fetchBatchStats(lastDoc?: any) {
  const res = await fetch('/api/get-batch-stats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lastDoc }),
  })

  return res.json()
}
