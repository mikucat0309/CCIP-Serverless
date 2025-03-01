import { type D1Database } from '@cloudflare/workers-types'
import { type Class } from '@/core/utils'
import { Repository } from '@/core'
import { Stats, StatEvent, PuzzleStatIncremented, PuzzleStatDecremented } from '@/puzzle'

type EventSchema = {
  id: string
  type: string
  aggregate_id: string
  version: number
  payload: string
  occurred_at: Date
}

const eventConstructors: Record<string, Class<StatEvent>> = {
  PuzzleStatIncremented: PuzzleStatIncremented,
  PuzzleStatDecremented: PuzzleStatDecremented,
}

export class D1PuzzleStatsRepository implements Repository<Stats> {
  private readonly db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  async findById(id: string): Promise<Stats | null> {
    const { results } = await this.db
      .prepare('SELECT * FROM puzzle_stat_events WHERE aggregate_id = ?')
      .bind(id)
      .all<EventSchema>()

    const events = results
      .sort((a, b) => a.version - b.version)
      .map(event => buildDomainEvent(event))
      .filter<StatEvent>((event): event is StatEvent => event != null)

    return new Stats(id, events)
  }

  async save(_stats: Stats): Promise<void> {
    return
  }

  async delete(_stats: Stats): Promise<void> {
    return
  }
}

function buildDomainEvent(event: EventSchema): StatEvent | null {
  const klass = eventConstructors[event.type]
  if (!klass) {
    return null
  }

  const domainEvent = Object.create(klass.prototype)

  const payload = JSON.parse(event.payload) as object
  const properties = {
    id: event.id,
    aggregateId: event.aggregate_id,
    occurredAt: event.occurred_at,
    ...payload,
  }
  Object.assign(domainEvent, properties)

  return domainEvent
}
