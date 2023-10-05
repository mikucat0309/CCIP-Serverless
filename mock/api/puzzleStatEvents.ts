import { json, IRequest } from 'itty-router'
import { D1Database } from '@cloudflare/workers-types'

type Env = {
  DB: D1Database
}

type PuzzleStatEvent = {
  id: string
  type: string
  aggregate_id: string
  version: number
  payload: string
  occurred_at: string
}

type PuzzleStatEvents = PuzzleStatEvent[]

export async function createPuzzleStatEventHandler(req: IRequest, { DB }: Env) {
  const payload = await req.json<PuzzleStatEvent | PuzzleStatEvents>()
  const events = Array.isArray(payload) ? payload : [payload]
  const stmt = DB.prepare(
    `INSERT INTO puzzle_stat_events (id, type, aggregate_id, version, payload, occurred_at) VALUES (?, ?, ?, ?, ?, ?)`
  )
  const res = await DB.batch(
    events.map(({ id, type, aggregate_id, version, payload, occurred_at }) =>
      stmt.bind(id, type, aggregate_id, version, payload, occurred_at)
    )
  )

  return json(res)
}
