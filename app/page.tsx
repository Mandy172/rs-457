import { existsSync } from 'node:fs'
import path from 'node:path'
import { Experience } from '@/components/Experience'

export default function Page() {
  const hasModel = existsSync(path.join(process.cwd(), 'public', 'models', 'bike.glb'))
  return <Experience hasModel={hasModel} />
}
