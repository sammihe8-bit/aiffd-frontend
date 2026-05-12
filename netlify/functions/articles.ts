import type { Handler } from '@netlify/functions'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = process.env.NOTION_DATABASE_ID

export const handler: Handler = async () => {
  if (!NOTION_TOKEN || !DATABASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Notion credentials' }),
    }
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Status',
          select: { equals: '已发布' },
        },
        sorts: [
          { property: 'Date', direction: 'descending' },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return { statusCode: res.status, body: JSON.stringify({ error: err }) }
    }

    const data = await res.json()

    const articles = data.results.map((page: any) => {
      const p = page.properties
      return {
        id: page.id,
        title: p.Name?.title?.[0]?.plain_text ?? '',
        excerpt: p.Excerpt?.rich_text?.[0]?.plain_text ?? '',
        author: p.Author?.select?.name ?? '',
        tag: p.Tag?.select?.name ?? '',
        date: p.Date?.date?.start ?? '',
        readTime: p.ReadTime?.rich_text?.[0]?.plain_text ?? '',
        link: p.Link?.url ?? '#',
        featured: p.Featured?.checkbox ?? false,
        coverColor: p.CoverColor?.rich_text?.[0]?.plain_text ?? '#E8E0D5',
      }
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60', // 缓存60秒
      },
      body: JSON.stringify(articles),
    }
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    }
  }
}
