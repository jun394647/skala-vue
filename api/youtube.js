// GitHub Pages엔 서버가 없어 이 함수가 404 나는 게 정상 — 프론트는 그 경우 음악 카드에 안내 문구를 보여준다
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET만 지원합니다.' })
    return
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'YOUTUBE_API_KEY가 설정되지 않았습니다.' })
    return
  }

  const query = req.query?.q
  if (!query) {
    res.status(400).json({ error: 'q 쿼리 파라미터가 필요합니다.' })
    return
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '1',
      key: apiKey,
    })
    const response = await fetch(`${SEARCH_URL}?${params.toString()}`)

    if (!response.ok) {
      res.status(502).json({ error: `YouTube 요청 실패 (${response.status})` })
      return
    }

    const data = await response.json()
    const item = data.items?.[0]
    const video = item ? { id: item.id.videoId, title: item.snippet.title } : null

    res.status(200).json({ video })
  } catch (error) {
    res.status(500).json({ error: `검색 중 오류: ${error.message}` })
  }
}
