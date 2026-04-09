export async function fetchUserID() {
  try {
    const res = await fetch(`https://api.salesmessage.com/pub/v2.2/organization/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SALES_MESSAGE_API_KEY}`,
      },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    return data
  } catch (err) {
    console.error('Failed to fetch messages:', err)
    return []
  }
}
