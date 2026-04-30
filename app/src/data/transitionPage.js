// 过滤掉以 // 开头的注释行
const raw = `
72小时后。
[目的地名称]，街角的一家咖啡馆。
`

export const transitionPageText = raw
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('//'))
