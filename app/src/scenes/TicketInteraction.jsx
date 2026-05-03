import { useState, useCallback, useEffect, useRef } from 'react'
import './TicketInteraction.css'
import './interaction-base.css'
import './Scene1.css'
import { getPageCheckboxes, getPageAxes } from '../data/defaultContent'

const IMG_BG = './images/v2_2.png'
const IMG_TABLE = './images/v2_3.png'
const IMG_DISPERSE = './images/物品退散-机票.png'
const IMG_BOARD_1 = './images/背板1图片.png'
const IMG_BOARD_2 = './images/背板2图片.png'
const IMG_STICKY = './images/便签.png'
const IMG_INDEX_PREV = './images/索引(上一页).png'
const IMG_INDEX_NEXT = './images/索引(下一页).png'

const ENERGY_TYPES = {
  morning: { name: '晨光型', desc: '早晨满格，入夜后迅速归零' },
  charging: { name: '蓄力型', desc: '上午平淡，下午之后才真正醒着' },
  night: { name: '夜行型', desc: '白天是壳，深夜才是本体' },
  steady: { name: '恒温型', desc: '始终维持在一个不高不低的地方' },
}

function getEnergyType(y6, y12, y18) {
  const d1 = y12 - y6
  const d2 = y18 - y12
  if (d1 < -15 && d2 < -15) return 'morning'
  if (d1 > 15 && d2 > 15) return 'charging'
  if (Math.abs(d1) < 20 && d2 > 20) return 'night'
  return 'steady'
}

function smoothPath(pts) {
  const n = pts.length
  if (n < 2) return ''
  const s = []
  for (let i = 0; i < n; i++) {
    if (i === 0) s.push((pts[1].y - pts[0].y) / (pts[1].x - pts[0].x))
    else if (i === n - 1) s.push((pts[n-1].y - pts[n-2].y) / (pts[n-1].x - pts[n-2].x))
    else {
      const l = (pts[i].y - pts[i-1].y) / (pts[i].x - pts[i-1].x)
      const r = (pts[i+1].y - pts[i].y) / (pts[i+1].x - pts[i].x)
      s.push(l * r <= 0 ? 0 : (2 * l * r) / (l + r))
    }
  }
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i+1].x - pts[i].x
    d += ` C ${pts[i].x + dx/3} ${pts[i].y + s[i]*dx/3}, ${pts[i+1].x - dx/3} ${pts[i+1].y - s[i+1]*dx/3}, ${pts[i+1].x} ${pts[i+1].y}`
  }
  return d
}


export default function TicketInteraction({ onBack, onChartUpdate, personaImage, ocName, contentData }) {
  const [page, setPage] = useState(1)
  const [exiting, setExiting] = useState(false)
  const [checkedItems, setCheckedItems] = useState({})
  const [energy, setEnergy] = useState({ y0: 15, y6: 80, y12: 50, y18: 20, y24: 15 })
  const [dragDot, setDragDot] = useState(null)
  const energySvgRef = useRef(null)
  const [axisValues, setAxisValues] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 })
  const [axisDragging, setAxisDragging] = useState(false)
  const trackRef = useRef(null)

  const handlePrev = () => setPage(p => Math.max(1, p - 1))
  const handleNext = () => setPage(p => Math.min(4, p + 1))

  const PIE_CATEGORIES = ['吃进去的', '带回家的', '买了但说不清为什么买的', '换来一段体验的']
  const PIE_COLORS = ['#337987', '#32524B', '#739EA7', '#B8D4D8']
  const [pieValues, setPieValues] = useState([25, 25, 25, 25])
  const [dragBIdx, setDragBIdx] = useState(null)
  const pieSvgRef = useRef(null)
  const pieRef = useRef(pieValues)
  pieRef.current = pieValues

  const RADAR_AXES = [
    { big: '沉浸人文历史', small: 'Musée du Louvre' },
    { big: '橱窗走不动道', small: 'Rue du Faubourg Saint-Honoré' },
    { big: '混进去没人发现', small: "Marché d'Aligre" },
    { big: '坐在长椅上吹风', small: 'Jardin du Luxembourg' },
    { big: '进去前不知买什么', small: 'Une brocante près de Bastille' },
  ]
  const [radarValues, setRadarValues] = useState([50, 50, 50, 50, 50])
  const radarSvgRef = useRef(null)

  const handleRadarClick = (e) => {
    const svg = radarSvgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const radius = Math.min(cx, cy) * 0.8
    const x = e.clientX - rect.left - cx
    const y = e.clientY - rect.top - cy
    const dist = Math.sqrt(x * x + y * y)
    const angle = Math.atan2(y, x) * (180 / Math.PI)
    // Find nearest axis
    const axisAngles = RADAR_AXES.map((_, i) => -90 + i * 72)
    let bestI = 0
    let bestD = Infinity
    for (let i = 0; i < axisAngles.length; i++) {
      let d = Math.abs(angle - axisAngles[i])
      if (d > 180) d = 360 - d
      if (d < bestD) { bestD = d; bestI = i }
    }
    const projDist = dist * Math.cos(bestD * Math.PI / 180)
    const v = Math.round(Math.max(5, Math.min(100, (projDist / radius) * 100)))
    setRadarValues(prev => prev.map((val, i) => i === bestI ? v : val))
  }

  const toggleCheck = (opt) => {
    setCheckedItems(prev => ({ ...prev, [opt]: !prev[opt] }))
  }

  // 饼图边界拖拽
  const updatePieB = useCallback((e) => {
    if (dragBIdx === null) return
    const svg = pieSvgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    let angle = Math.atan2(clientY - rect.top - cy, clientX - rect.left - cx) * (180 / Math.PI)
    let cumPct = ((angle + 90 + 360) % 360) / 3.6
    const pv = pieRef.current
    const minGap = 5
    const lo = dragBIdx === 1 ? minGap : pv.slice(0, dragBIdx - 1).reduce((s, v) => s + v, 0) + minGap
    const hi = dragBIdx === 3 ? 100 - minGap : pv.slice(0, dragBIdx + 1).reduce((s, v) => s + v, 0) - minGap
    cumPct = Math.max(lo, Math.min(hi, cumPct))
    setPieValues(prev => {
      const n = [...prev]
      const prevCum = dragBIdx === 1 ? 0 : prev.slice(0, dragBIdx - 1).reduce((s, v) => s + v, 0)
      n[dragBIdx - 1] = Math.round(cumPct - prevCum)
      n[dragBIdx] = Math.round(prev[dragBIdx - 1] + prev[dragBIdx] - n[dragBIdx - 1])
      return n
    })
  }, [dragBIdx])

  useEffect(() => {
    if (dragBIdx === null) return
    const hm = (e) => updatePieB(e)
    const htm = (e) => updatePieB(e.touches[0])
    const hu = () => setDragBIdx(null)
    window.addEventListener('mousemove', hm)
    window.addEventListener('mouseup', hu)
    window.addEventListener('touchmove', htm, { passive: false })
    window.addEventListener('touchend', hu)
    return () => {
      window.removeEventListener('mousemove', hm)
      window.removeEventListener('mouseup', hu)
      window.removeEventListener('touchmove', htm)
      window.removeEventListener('touchend', hu)
    }
  }, [dragBIdx, updatePieB])

  // 精力曲线 SVG 拖拽
  const updateEnergyDot = useCallback((e) => {
    if (!dragDot) return
    const svg = energySvgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const svgH = 140
    const padT = 10, padB = 110
    const y = ((e.clientY - rect.top) / rect.height) * svgH
    const v = Math.round(100 - ((y - padT) / (padB - padT)) * 100)
    setEnergy(prev => ({ ...prev, [dragDot]: Math.max(5, Math.min(95, v)) }))
  }, [dragDot])

  useEffect(() => {
    if (!dragDot) return
    const handleMove = (e) => updateEnergyDot(e)
    const handleTouchMove = (e) => updateEnergyDot(e.touches[0])
    const handleUp = () => setDragDot(null)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [dragDot, updateEnergyDot])

  // 数轴拖拽
  const updateAxis = useCallback((e) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 8 - 4
    setAxisValues(prev => ({ ...prev, [page]: Math.round(Math.max(-4, Math.min(4, x))) }))
  }, [page])

  const handleTrackDown = (e) => {
    setAxisDragging(true)
    updateAxis(e)
  }

  useEffect(() => {
    if (!axisDragging) return
    const handleMove = (e) => updateAxis(e)
    const handleTouchMove = (e) => updateAxis(e.touches[0])
    const handleUp = () => setAxisDragging(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [axisDragging, updateAxis])

  const energyType = getEnergyType(energy.y6, energy.y12, energy.y18)

  useEffect(() => {
    if (onChartUpdate) {
      onChartUpdate({
        energyType,
        topPieIdx: pieValues.indexOf(Math.max(...pieValues)),
        topRadarIdx: radarValues.indexOf(Math.max(...radarValues)),
      })
    }
  }, [energyType, pieValues, radarValues, onChartUpdate])

  const checkboxes = getPageCheckboxes(contentData)
  const axes = getPageAxes(contentData)
  const curCheck = checkboxes[page] || checkboxes[1]
  const curAxis = axes[page] || axes[1]

  const AxisChart = (
    <div className="chart-axis-wrap">
      <div className="chart-axis-question">{curAxis.question}</div>
      <div className="chart-axis-body">
        <div className="chart-axis-track" ref={trackRef} onMouseDown={handleTrackDown} onTouchStart={(e) => { handleTrackDown(e.touches[0]) }}>
          <div className="chart-axis-line" />
          <div className="chart-axis-zero-mark" />
          <span className="chart-axis-zero">0</span>
          <div className="chart-axis-dot" style={{ left: `${(((axisValues[page] ?? 0) + 4) / 8) * 100}%` }} />
        </div>
        <div className="chart-axis-labels">
          <span className="chart-axis-label">{curAxis.left}</span>
          <span className="chart-axis-label">{curAxis.right}</span>
        </div>
      </div>
    </div>
  )

  const CheckChart = (
    <div className="chart-check-wrap">
      <div className="chart-check-question">{curCheck.question}</div>
      <div className="chart-check-options">
        {curCheck.options.map(opt => (
          <label key={opt} className="chart-check-item" onClick={() => toggleCheck(opt)}>
            <span className={`chart-check-box ${checkedItems[opt] ? 'chart-check-box--on' : ''}`}>
              {checkedItems[opt] && '✓'}
            </span>
            <span className="chart-check-label">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )

  const handleBack = () => {
    setExiting(true)
    setTimeout(() => onBack?.(), 350)
  }

  return (
    <div className={`interaction-page int-slide-in ${exiting ? 'int-slide-out' : ''}`}>
      <img className="int-bg" src={IMG_BG} alt="" />
      <div style={{
        position: 'absolute',
        width: '392px',
        height: '699px',
        top: '81px',
        left: 0,
        zIndex: 3,
        background: 'url(./images/v2_3.png) no-repeat center/cover',
        pointerEvents: 'none',
      }} />
      <div className="int-slide-wrap">
      <img className="int-disperse" src={IMG_DISPERSE} alt="" />

      {/* 夹板容器 */}
      <div className="scene1__board-wrap ticket-board-wrap">
        <img className="scene1__board" src={page === 1 ? IMG_BOARD_1 : IMG_BOARD_2} alt="" />
        {/* 第3页索引在board-content内 */}
        <div className="scene1__board-content">

          {/* 索引上一页 */}
          <div className="scene1__index-prev" onClick={handlePrev}>
            <img src={IMG_INDEX_PREV} alt="" />
          </div>

          {/* 索引下一页 */}
          <div className="scene1__index-next" onClick={handleNext}>
            <img src={IMG_INDEX_NEXT} alt="" />
          </div>

          {/* 便签（仅第1页） */}
          {page === 1 && (
            <div className="scene1__sticky-note">
              <img src={IMG_STICKY} alt="" />
              <div className="scene1__persona-box">
                {personaImage && <img src={personaImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            </div>
          )}

          {/* 底部长方形文本容器 */}
          <div className="scene1__bottom-box">
            <div className="scene1__text-container">
              {page === 1 && (
                <>
                  <div className="scene1__text-title">
                    <span className="main-title">Life<br />IsATrip</span>
                    <span className="sub-text">——————</span>
                  </div>
                  <div className="scene1__text-top">
                    {contentData.ticketIntro.split('\n').map((line, i) => (
                      <span key={i}>{line.replace('[OC名字]', ocName || '[OC名字]')}<br /></span>
                    ))}
                  </div>
                  {AxisChart}
                  {CheckChart}
                </>
              )}
              {page === 3 && (
                <>
                  <div className="chart-radar-wrap">
                    <div className="chart-radar-question">在旅行中，你更偏向哪一边？</div>
                    <svg
                      className="chart-radar-svg"
                      viewBox="0 0 200 200"
                      ref={radarSvgRef}
                      onClick={handleRadarClick}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        handleRadarClick(e.changedTouches[0])
                      }}
                    >
                      {[20, 40, 60, 80, 100].map(level => {
                        const pts = [0, 1, 2, 3, 4].map(i => {
                          const a = (-90 + i * 72) * Math.PI / 180
                          const d = (level / 100) * 75
                          return `${100 + d * Math.cos(a)},${100 + d * Math.sin(a)}`
                        }).join(' ')
                        return <polygon key={level} points={pts} fill="none" stroke="#D9D9D9" strokeWidth="0.4" />
                      })}
                      {[0, 1, 2, 3, 4].map(i => {
                        const a = (-90 + i * 72) * Math.PI / 180
                        const ex = 100 + 75 * Math.cos(a)
                        const ey = 100 + 75 * Math.sin(a)
                        return <line key={i} x1={100} y1={100} x2={ex} y2={ey} stroke="#D9D9D9" strokeWidth="0.4" />
                      })}
                      <polygon
                        points={radarValues.map((v, i) => {
                          const a = (-90 + i * 72) * Math.PI / 180
                          const d = (v / 100) * 75
                          return `${100 + d * Math.cos(a)},${100 + d * Math.sin(a)}`
                        }).join(' ')}
                        fill="rgba(51,121,135,0.15)"
                        stroke="#337987"
                        strokeWidth="1.2"
                      />
                      {radarValues.map((v, i) => {
                        const a = (-90 + i * 72) * Math.PI / 180
                        const d = (v / 100) * 75
                        return (
                          <circle key={i} cx={100 + d * Math.cos(a)} cy={100 + d * Math.sin(a)} r="2.5" fill="#337987" stroke="#fff" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                        )
                      })}
                      {RADAR_AXES.map((ax, i) => {
                        const a = (-90 + i * 72) * Math.PI / 180
                        const lx = 100 + 90 * Math.cos(a)
                        const ly = 100 + 90 * Math.sin(a)
                        return (
                          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="chart-radar-label">
                            <tspan x={lx} dy="-5">{ax.big}</tspan>
                            <tspan x={lx} dy="7.5" className="chart-radar-label--sub">{ax.small}</tspan>
                          </text>
                        )
                      })}
                    </svg>
                  </div>
                  {AxisChart}
                  {CheckChart}
                </>
              )}

              {page === 4 && (
                <>
                  <div className="chart-pie-wrap">
                    <div className="chart-pie-question">旅行的钱主要花在哪儿？</div>
                    <svg
                      className="chart-pie-svg"
                      viewBox="0 0 200 200"
                      ref={pieSvgRef}
                    >
                      {(() => {
                        let startAngle = -90
                        return pieValues.map((v, i) => {
                          const sliceAngle = v * 3.6
                          const endAngle = startAngle + sliceAngle
                          const r = 65
                          const x1 = 100 + r * Math.cos(startAngle * Math.PI / 180)
                          const y1 = 100 + r * Math.sin(startAngle * Math.PI / 180)
                          const x2 = 100 + r * Math.cos(endAngle * Math.PI / 180)
                          const y2 = 100 + r * Math.sin(endAngle * Math.PI / 180)
                          const large = sliceAngle > 180 ? 1 : 0
                          const d = `M 100 100 L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
                          const result = <path key={i} d={d} fill={PIE_COLORS[i]} stroke="#fff" strokeWidth="1" />
                          startAngle = endAngle
                          return result
                        })
                      })()}
                      {[1, 2, 3].map(bi => {
                        const cum = pieValues.slice(0, bi).reduce((s, v) => s + v, 0)
                        const angle = -90 + cum * 3.6
                        const r = 65
                        const hx = 100 + r * Math.cos(angle * Math.PI / 180)
                        const hy = 100 + r * Math.sin(angle * Math.PI / 180)
                        return (
                          <circle
                            key={bi}
                            cx={hx} cy={hy} r="6"
                            fill="#fff" stroke="#32524B" strokeWidth="1.5"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => { e.stopPropagation(); setDragBIdx(bi); updatePieB(e) }}
                            onTouchStart={(e) => { e.stopPropagation(); setDragBIdx(bi); updatePieB(e.touches[0]) }}
                          />
                        )
                      })}
                      {(() => {
                        let sa = -90
                        return pieValues.map((v, i) => {
                          const mid = sa + v * 1.8
                          const lr = 42
                          const lx = 100 + lr * Math.cos(mid * Math.PI / 180)
                          const ly = 100 + lr * Math.sin(mid * Math.PI / 180)
                          sa += v * 3.6
                          return v >= 8 ? (
                            <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="chart-pie-pct">{v}%</text>
                          ) : null
                        })
                      })()}
                    </svg>
                    <div className="chart-pie-legend">
                      {PIE_CATEGORIES.map((cat, i) => (
                        <div key={i} className="chart-pie-legend-item">
                          <span className="chart-pie-legend-dot" style={{ background: PIE_COLORS[i] }} />
                          <span className="chart-pie-legend-label">{cat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {AxisChart}
                  {CheckChart}
                </>
              )}

              {page === 2 && (
                <>
                  {/* 精力曲线图表 */}
                  <div className="chart-curve-wrap">
                    <svg
                      className="chart-curve-svg"
                      viewBox="0 0 190 140"
                      ref={energySvgRef}
                    >
                      {/* 水平参考线 */}
                      {[0, 25, 50, 75, 100].map(v => {
                        const sy = 110 - v
                        return (
                          <g key={v}>
                            <line x1={20} y1={sy} x2={170} y2={sy} stroke="#D9D9D9" strokeWidth="0.4" />
                            <text x={16} y={sy} textAnchor="end" className="chart-curve-y-label">{v}</text>
                          </g>
                        )
                      })}
                      {/* X轴标签 */}
                      {[{ key: 'y0', label: '0:00', x: 20 }, { key: 'y6', label: '6:00', x: 58 }, { key: 'y12', label: '12:00', x: 95 }, { key: 'y18', label: '18:00', x: 133 }, { key: 'y24', label: '24:00', x: 170 }].map(t => (
                        <text key={t.key} x={t.x} y={126} textAnchor="middle" className="chart-curve-x-label">{t.label}</text>
                      ))}
                      {/* 曲线 */}
                      {(() => {
                        const pts = [
                          { key: 'y0', x: 20, v: energy.y0 },
                          { key: 'y6', x: 58, v: energy.y6 },
                          { key: 'y12', x: 95, v: energy.y12 },
                          { key: 'y18', x: 133, v: energy.y18 },
                          { key: 'y24', x: 170, v: energy.y24 },
                        ]
                        const svgPts = pts.map(p => ({ x: p.x, y: 110 - p.v }))
                        const d = smoothPath(svgPts)
                        return <path d={d} fill="none" stroke="#337987" strokeWidth="2.5" strokeLinecap="round" />
                      })()}
                      {/* 可拖拽圆点 */}
                      {[
                        { key: 'y0', x: 20, v: energy.y0 },
                        { key: 'y6', x: 58, v: energy.y6 },
                        { key: 'y12', x: 95, v: energy.y12 },
                        { key: 'y18', x: 133, v: energy.y18 },
                        { key: 'y24', x: 170, v: energy.y24 },
                      ].map(d => (
                        <g key={d.key}>
                          <circle
                            cx={d.x} cy={110 - d.v} r={12}
                            fill="transparent"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => { e.stopPropagation(); setDragDot(d.key); updateEnergyDot(e) }}
                            onTouchStart={(e) => { e.stopPropagation(); setDragDot(d.key); updateEnergyDot(e.touches[0]) }}
                          />
                          <circle
                            cx={d.x} cy={110 - d.v} r={5}
                            fill="#337987" stroke="#fff" strokeWidth={1.5}
                            style={{ pointerEvents: 'none' }}
                          />
                        </g>
                      ))}
                    </svg>
                    <div className="chart-energy-type">
                      <span className="chart-energy-name">{ENERGY_TYPES[energyType].name}</span>
                      <span className="chart-energy-desc">{ENERGY_TYPES[energyType].desc}</span>
                    </div>
                  </div>

                  {AxisChart}
                  {CheckChart}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      </div>
      <div className="int-back" onClick={handleBack}>
        <img className="int-back-img" src={IMG_STICKY} alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
