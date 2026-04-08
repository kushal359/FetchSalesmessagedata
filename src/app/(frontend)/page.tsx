import './styles.css'
import Link from 'next/link'

export default async function HomePage() {
  return (
    <div className="home">
      <ul>
        <li>
          <Link href={'/fetchconvo'}>Get Conversations</Link>
        </li>
      </ul>
    </div>
  )
}
