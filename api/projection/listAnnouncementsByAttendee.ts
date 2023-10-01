import { type D1Database } from '@cloudflare/workers-types'
import { Projection } from '@/core'
import { Announcement, AnnouncementLocales } from '@/announcement'

type AnnouncementSchema = {
  id: string
  announced_at: string
  message_en: string | null
  message_zh: string | null
  uri: string
  roles: string
}

export type ListAnnouncementsInput = {
  role: string
}

export class D1ListAnnouncementsByAttendee
  implements Projection<ListAnnouncementsInput, Announcement[]>
{
  private readonly db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  async query({ role }: ListAnnouncementsInput): Promise<Announcement[] | null> {
    if (!role) {
      return []
    }

    const stmt = this.db.prepare(`
      SELECT * FROM announcements
        WHERE (
          SELECT 1 FROM json_each(roles) WHERE json_each.value = ?
        )
        ORDER BY announced_at DESC
      `)
    const { results } = await stmt.bind(role).all<AnnouncementSchema>()

    return results.map(toAnnouncement)
  }
}

const toAnnouncement = (data: AnnouncementSchema): Announcement => {
  let roles: string[]
  try {
    roles = JSON.parse(data.roles)
  } catch {
    roles = []
  }

  return new Announcement({
    id: data.id,
    announcedAt: new Date(data.announced_at),
    messageEn: data.message_en,
    messageZh: data.message_zh,
    message: {
      ...(data.message_en && { [AnnouncementLocales.enUS]: data.message_en }),
      ...(data.message_zh && { [AnnouncementLocales.zhTW]: data.message_zh }),
    },
    uri: data.uri,
    roles,
  })
}
