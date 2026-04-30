import { useState, useRef, useMemo } from 'react'
import './ReceiptInteraction.css'

const STICKER_DATA = [
  { id: 1, name: 'Croissant au beurre 黄油可颂',      price: 2.80, description: '街角面包店的纸袋，油渍把店名晕开了一半' },
  { id: 2, name: 'Ticket Métro — Ligne 4 地铁票',   price: 2.15, description: 'Métro线路图印在背面，折过一次，不知道为什么没扔' },
  { id: 3, name: "L'Étranger — édition de poche 局外人", price: 7.50, description: '前任读者在第47页折了角，不知道他们读到那里的时候在想什么' },
  { id: 4, name: 'Échantillon parfum — sans nom 香水小样', price: 0.00, description: '没有标签，味道介于某种花和某种木头之间，带回去之后大概也不会买' },
  { id: 5, name: 'Montre de poche, chaîne manquante 怀表 断链', price: 12.00, description: '表盘还在走，但对不上任何时区' },
  { id: 6, name: 'Pansements adhésifs × 6 创可贴',   price: 3.40, description: '买了一整盒，用了一片' },
  { id: 7, name: 'Eau minérale + article inconnu 矿泉水 + 不明物品', price: 4.20, description: '水，和一个翻译软件也没认出来的东西' },
  { id: 8, name: 'Bougie votive — marché paroissial 教堂义卖蜡烛', price: 3.00, description: '从某个教堂门口的义卖摊买的，还没点过，不知道带回去之后会不会点。' },
]

function generateStickers(count) {
  const safeZonesPercentage = [
    [5,  7,   1,  3],   // 1. 左上
    [35, 37,  3,  5],   // 2. 中上
    [64, 66,  1,  3],   // 3. 右上
    [3,  5,  19, 21],   // 4. 中偏左上
    [33, 35, 21, 23],   // 5. 正中间
    [62, 64, 19, 21],   // 6. 中偏右上
    [5,  10, 40, 42],   // 7. 左侧偏下
    [5,  10, 60, 62],   // 8. 左下角底部
  ]

  const shuffledZones = safeZonesPercentage.sort(() => Math.random() - 0.5)
  const results = []
  const loopCount = Math.min(count, safeZonesPercentage.length)

  for (let i = 0; i < loopCount; i++) {
    const zone = shuffledZones[i]
    const randomX = zone[0] + Math.random() * (zone[1] - zone[0])
    const randomY = zone[2] + Math.random() * (zone[3] - zone[2])
    const rotate = (Math.random() - 0.5) * 40

    results.push({
      id: STICKER_DATA[i].id,
      data: STICKER_DATA[i],
      x: randomX,
      y: randomY,
      size: 72,
      rotate,
    })
  }

  return results
}

export default function ReceiptInteraction({ onBack, selected, onSelectStickers }) {
  // 每次挂载生成新 key，重新生成贴纸位置，触发动画
  const [mountKey] = useState(() => Math.random())
  const [flipped, setFlipped] = useState([])
  const lastClickTime = useRef(0)
  const clickTimer = useRef(null)

  const stickersPos = useMemo(() => generateStickers(STICKER_DATA.length), [mountKey])
  const total = selected.reduce((acc, s) => acc + s.price, 0)

  const handleClick = (pos, e) => {
    e.stopPropagation()
    const now = Date.now()
    const diff = now - lastClickTime.current

    if (diff < 250 && lastClickTime.current > 0) {
      lastClickTime.current = 0
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      setFlipped(prev =>
        prev.includes(pos.id)
          ? prev.filter(id => id !== pos.id)
          : [...prev, pos.id]
      )
    } else {
      clearTimeout(clickTimer.current)
      clickTimer.current = setTimeout(() => {
        lastClickTime.current = 0
        clickTimer.current = null
        onSelectStickers(prev =>
          prev.find(s => s.id === pos.id)
            ? prev.filter(s => s.id !== pos.id)
            : [...prev, pos.data]
        )
      }, 250)
      lastClickTime.current = now
    }
  }

  return (
    <div className="interaction-page">
      <img className="int-bg" src="/images/v2_2.png" alt="" />
      <img className="int-table" src="/images/v2_3.png" alt="" />
      <img className="int-disperse" src="/images/物品退散-小票.png" alt="" />

      {/* 贴纸散落区 */}
      <div
        className="sticker-area"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 14 }}
      >
        {stickersPos.map((pos) => {
          const isFlipped = flipped.includes(pos.id)
          const isSelected = selected.find(s => s.id === pos.id)
          return (
            <div
              key={pos.id}
              className={`sticker-card${isFlipped ? ' flipped' : ''}${isSelected ? ' selected' : ''}`}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                '--rotate': `${pos.rotate}deg`,
              }}
              onClick={(e) => handleClick(pos, e)}
            >
              <img
                className="sticker-front"
                src={`/images/贴纸${pos.id}.png`}
                alt={pos.data.name}
              />
              <div className="sticker-back">{pos.data.description}</div>
            </div>
          )
        })}
      </div>

      {/* 小票容器 */}
      <div className="receipt-int-wrap">
        <img className="receipt-int-img" src="/images/v2_14.png" alt="" />
        <div className="receipt-int-header">
          <div className="receipt-int-title">收银单</div>
          <div className="receipt-int-sub">·invoice·</div>
          <div className="receipt-int-sep">----------------------------</div>
          <div className="receipt-int-no">NO.1</div>
          <div className="receipt-int-sep">----------------------------</div>
        </div>
        <div className="receipt-int-table">
          {selected.map(s => (
            <div key={s.id} className="receipt-int-item-row">
              <span className="receipt-int-item">{s.name}</span>
              <span className="receipt-int-price">{s.price.toFixed(2)}</span>
            </div>
          ))}
          {selected.length > 0 && <div className="receipt-int-sep2">-------------------------</div>}
          {selected.length > 0 && <div className="receipt-int-total">合计：{total.toFixed(2)}€</div>}
        </div>
        <div className="receipt-int-footer">
          <div className="receipt-int-date">2026/03/22</div>
          <div className="receipt-int-code">B006309023</div>
          <div className="receipt-int-code">SRPQ00440315skyc</div>
        </div>
        <div className="receipt-int-barcode">EXAMPLE</div>
      </div>

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="/images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
