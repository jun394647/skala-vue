const statusAliases = {
  온흐림: '흐림',
  튼구름: '구름 많음',
  '실 비': '가는 비',
  박무: '옅은 안개',
  연무: '안개',
}

export const friendlyStatus = (status) => statusAliases[status] ?? status
