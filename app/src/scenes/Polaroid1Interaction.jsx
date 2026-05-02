import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import './Polaroid1Interaction.css'
import { getP1Places, getStickerCn } from '../data/defaultContent'

const PIE_NAMES = ['吃进去的', '带回家的', '买了但说不清为什么买的', '换来一段体验的']

const PULL_THRESHOLD = 40

function h(t, color) { return { h: true, t, c: color || null } }

function buildText(energyType, sticker, topPieIdx, topRadarIdx, stickerCn, radarPlaces) {
  const cn = sticker ? stickerCn[sticker.id] || sticker.name : '一个小东西'
  const isWatch = sticker && sticker.id === 5
  const spend = PIE_NAMES[topPieIdx] || PIE_NAMES[0]
  const loc = radarPlaces[topRadarIdx] || radarPlaces[0]

  let box1, box2, box3

  if (energyType === 'morning') {
    box1 = [
      '早上出门的时候天还没完全亮，面包店已经开门了。\n买了', h(cn), '，装进口袋，开始走。\n我觉得这个', h(cn), '看起来：',
    ]
    box2 = [
      '上午把能去的地方去了一遍，', h(spend), '花了比预想的多一点。\n路过', h(loc.place, loc.color), '的时候停了一下，', loc.text,
    ]
    box3 = isWatch
      ? ['掏出那枚怀表看了看，不知道在确认什么，它对不上这里的任何一个时区。\n傍晚，去了歌剧院。']
      : [h(cn), '还在口袋里。\n傍晚，去了歌剧院。']
  } else if (energyType === 'charging') {
    box1 = [
      '上午的事情记得不太清楚，大概买了', h(cn), '，大概走了很长一段路。\n我觉得这个', h(cn), '看起来：',
    ]
    box2 = [
      '下午才算真正醒过来。', h(spend), '花在了值得花的地方，路过', h(loc.place, loc.color), '，停下来，这次停的时间比较长。', loc.text,
    ]
    box3 = isWatch
      ? ['掏出那枚怀表，表盘还在走。在巴黎待了这几天，一直没搞清楚它对的是哪里的时间，或者它根本对不上任何地方。\n傍晚，去了歌剧院。']
      : [h(cn), '还在口袋里。\n傍晚，去了歌剧院。']
  } else if (energyType === 'night') {
    box1 = [
      '下午三点，这一天才算开始。\n我觉得这个', h(cn), '看起来：\n', h(cn), '是在某个说不清楚在哪里的地方买的，或者捡的，或者顺手拿的。',
    ]
    box2 = [
      h(spend), '，钱花出去的时候没有特别的感觉。路过', h(loc.place, loc.color), '，停了一下，周围的人都在往前走。', loc.text, '\n光线变暗之后整个人反而清醒了。',
    ]
    box3 = isWatch
      ? ['掏出那枚怀表，这个时间点它的表盘终于和某个地方的时区对上了，不知道是哪里。\n傍晚，去了歌剧院。']
      : [h(cn), '还在口袋里。\n傍晚，去了歌剧院。']
  } else {
    box1 = [
      '今天没有特别好也没有特别差，就是普通的一天。\n我觉得这个', h(cn), '看起来：',
    ]
    box2 = [
      '早上拿了', h(cn), '，下午花了一些钱在', h(spend), '上。\n路过', h(loc.place, loc.color), '的时候停了一下，想了一件和这里完全无关的事。', loc.text,
    ]
    box3 = isWatch
      ? ['掏出那枚怀表看了看。它一直在走，今天也是。\n傍晚，去了歌剧院。']
      : [h(cn), '还在口袋里。\n傍晚，去了歌剧院。']
  }

  return { box1, box2, box3 }
}

function renderSegments(segments) {
  return segments.map((seg, i) => {
    if (typeof seg === 'string') return seg
    return (
      <span key={i} className="p1-cyan" style={seg.c ? { color: seg.c } : undefined}>
        {seg.t}
      </span>
    )
  })
}

export default function Polaroid1Interaction({ onBack, onPolaroid2, chartResults, selectedStickers, polaroid1Image, ocName, contentData }) {
  const radarPlaces = getP1Places(contentData)
  const stickerCn = getStickerCn(contentData)
  const [stage, setStage] = useState('closed')
  const [pullY, setPullY] = useState(0)
  const pullAnimRef = useRef(null)
  const dragRef = useRef({ active: false, startY: 0, startPull: 0 })

  const energyType = chartResults?.energyType || 'morning'
  const topPieIdx = chartResults?.topPieIdx ?? 0
  const topRadarIdx = chartResults?.topRadarIdx ?? 0

  const sticker = useMemo(() => {
    if (!selectedStickers || selectedStickers.length === 0) return null
    const i = Math.floor(Math.random() * selectedStickers.length)
    return selectedStickers[i]
  }, [selectedStickers])

  const { box1, box2, box3 } = buildText(energyType, sticker, topPieIdx, topRadarIdx, stickerCn, radarPlaces)
  const locColor = radarPlaces[topRadarIdx]?.color || '#337987'

  // opening → open after flip animation (0.8s)
  useEffect(() => {
    if (stage === 'opening') {
      const t = setTimeout(() => setStage('open'), 800)
      return () => clearTimeout(t)
    }
  }, [stage])

  // closing → exiting after flip animation (0.6s)
  useEffect(() => {
    if (stage === 'closing') {
      const t = setTimeout(() => setStage('exiting'), 600)
      return () => clearTimeout(t)
    }
  }, [stage])

  // exiting → navigate after slide-up (0.6s)
  useEffect(() => {
    if (stage === 'exiting') {
      const t = setTimeout(() => onPolaroid2?.(), 600)
      return () => clearTimeout(t)
    }
  }, [stage, onPolaroid2])

  // spring-back for polyline
  const springBack = useCallback(() => {
    if (pullAnimRef.current) cancelAnimationFrame(pullAnimRef.current)
    const animate = () => {
      setPullY(prev => {
        const next = prev * 0.75
        if (next < 0.5) return 0
        pullAnimRef.current = requestAnimationFrame(animate)
        return next
      })
    }
    pullAnimRef.current = requestAnimationFrame(animate)
  }, [])

  const onDragStart = useCallback((e) => {
    if (stage !== 'open') return
    const y = e.touches ? e.touches[0].clientY : e.clientY
    dragRef.current = { active: true, startY: y, startPull: pullY }
  }, [stage, pullY])

  const onDragEnd = useCallback(() => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setPullY(prev => {
      if (prev > PULL_THRESHOLD) {
        setStage('closing')
        return prev
      }
      springBack()
      return prev
    })
  }, [springBack])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.active) return
      const y = e.touches ? e.touches[0].clientY : e.clientY
      const dy = y - dragRef.current.startY
      const damped = Math.max(0, Math.min(dy * 0.5, 120))
      setPullY(dragRef.current.startPull + damped)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchend', onDragEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onDragEnd)
      window.removeEventListener('touchend', onDragEnd)
    }
  }, [onDragEnd])

  useEffect(() => {
    return () => {
      if (pullAnimRef.current) cancelAnimationFrame(pullAnimRef.current)
    }
  }, [])

  const isCoverVisible = stage === 'closed' || stage === 'opening' || stage === 'closing' || stage === 'exiting'
  const coverAnimClass = stage === 'opening' ? 'p1-cover--opening' : stage === 'closing' ? 'p1-cover--closing' : ''

  const contentClass = [
    'p1-content-wrap',
    stage === 'open' ? 'p1-content-wrap--visible' : '',
    (stage === 'closing' || stage === 'exiting') ? 'p1-content-wrap--closing' : '',
  ].join(' ')

  const polylinePoints = `55,275 115,345 80,450 325,612 325,${702 + pullY}`

  return (
    <div className="interaction-page">
      <img className="int-bg" src="./images/v2_2.png" alt="" />

      {/* 手账本底 - 合上时隐藏 */}
      <img className={`p1-notebook ${(stage === 'closed' || stage === 'exiting') ? 'p1-notebook--hidden' : ''} ${stage === 'closing' ? 'p1-notebook--closing' : ''} ${stage === 'exiting' ? 'p1-notebook--instant' : ''}`} src="./images/手账本.png" alt="" />

      {/* 内容层 */}
      <div className={contentClass}>
        <div className="p1-text-box p1-text-box--1 p1-text-content">
          {renderSegments(box1)}
          <input className="p1-input" placeholder="留下想法" />
        </div>
        <div className="p1-text-box p1-text-box--2 p1-text-content">
          {renderSegments(box2)}
        </div>

        <div className="p1-dot p1-dot--1" />
        <div className="p1-dot p1-dot--2" />

        <img className="p1-clip" src="./images/金属长尾夹.png" alt="" />
        <div className="p1-polaroid-bg" style={{ backgroundImage: `url(${contentData.imgPolaroidBg})` }} />
        <div className="p1-polaroid-photo" style={{ backgroundImage: `url(${contentData.imgPolaroidBg})` }}>
          {polaroid1Image && <img src={polaroid1Image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>

        <img className="p1-pin p1-pin--tl" src="./images/红色钉子.png" alt="" />
        <img className="p1-pin p1-pin--tr" src="./images/红色钉子.png" alt="" />

        <div className="p1-note-box">
          {renderSegments(box3)}
        </div>
      </div>

      {/* 封皮 - 双面翻页 */}
      {isCoverVisible && (
        <div className={`p1-cover-stage ${coverAnimClass} ${stage === 'exiting' ? 'p1-cover-stage--exiting' : ''}`} onClick={() => { if (stage === 'closed') setStage('opening') }}>
          <div className="p1-cover">
            <div className="p1-cover-inner">
              <img className="p1-cover-face p1-cover-face--front" src="./images/本子封皮.png" alt="" />
              <img className="p1-cover-face p1-cover-face--back" src="./images/本子翻页.png" alt="" />
            </div>
          </div>
        </div>
      )}

      {/* 装饰连线 + 圆点 */}
      <svg className={`p1-connect-svg ${(stage === 'closed' || stage === 'opening' || stage === 'closing' || stage === 'exiting') ? 'p1-connect-svg--hidden' : ''} ${stage === 'exiting' ? 'p1-connect-svg--instant' : ''}`} viewBox="0 0 393 852" xmlns="http://www.w3.org/2000/svg">
        <polyline className="p1-connect-line" points={polylinePoints} />
        <circle cx="115" cy="345" r="4" className="p1-dot-loc" fill={locColor} />
        <circle cx="325" cy={612 + pullY} r="4" className="p1-dot-note" />
        {stage === 'open' && (
          <rect
            className="p1-drag-handle"
            x="280" y="600" width="80" height="180"
            fill="transparent"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
          />
        )}
      </svg>

      <div className={`p1-title ${stage === 'exiting' ? 'p1-title--exiting' : ''}`}>
        <span className="p1-title-main">旅行日志</span>
        <span className="p1-title-num">01</span>
      </div>

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="./images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
