// GitHub Pages엔 서버가 없어 이 함수가 404 나는 게 정상 — 프론트는 그 경우 합성 원형 코스로 폴백한다
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST만 지원합니다.' })
    return
  }

  const apiKey = process.env.ORS_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ORS_API_KEY가 설정되지 않았습니다.' })
    return
  }

  const coordinates = req.body?.coordinates
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    res.status(400).json({ error: 'coordinates 배열(최소 2개)이 필요합니다.' })
    return
  }

  try {
    const orsResponse = await fetch(ORS_URL, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates, elevation: true }),
    })

    if (!orsResponse.ok) {
      res.status(502).json({ error: `ORS 요청 실패 (${orsResponse.status})` })
      return
    }

    const geojson = await orsResponse.json()
    const feature = geojson?.features?.[0]
    const path = feature?.geometry?.coordinates

    if (!Array.isArray(path) || path.length < 2) {
      res.status(502).json({ error: 'ORS 응답에 경로 정보가 없습니다.' })
      return
    }

    res.status(200).json({
      path,
      ascent: feature.properties?.ascent ?? null,
      descent: feature.properties?.descent ?? null,
      distanceMeters: feature.properties?.summary?.distance ?? null,
    })
  } catch (error) {
    res.status(500).json({ error: `경로 조회 중 오류: ${error.message}` })
  }
}
