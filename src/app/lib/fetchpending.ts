export async function fetchpending() {
  try {
    const res = await fetch(
      `https://api.salesmessage.com/prod/int/v5/core/conversations?team_id=19834&team_type=2&filter=pending&limit=100&offset=0&sort_by=last_manual_message_at&grouped_response=true&order=newest&exclude=100051452`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SALES_MESSAGE_API_KEY}`,
        },
        next: { revalidate: 0 },
      },
    )

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (err) {
    console.error('Failed to fetch messages:', err)
    return []
  }
}
