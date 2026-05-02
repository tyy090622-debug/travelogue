import { useState, useRef, useEffect, useCallback } from 'react'
import './Polaroid2Interaction.css'
import { getP2Options } from '../data/defaultContent'

export default function Polaroid2Interaction({ onBack, onPostcard, polaroid2Image, ocName, polaroid2Revealed, contentData }) {
  const OPTIONS_1 = getP2Options(contentData)
  // initial → text → options → after-select → detect → callout → text3
  const [phase, setPhase] = useState('initial')
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [flash, setFlash] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [detectPos, setDetectPos] = useState({ x: 110, y: 315 })
  const detectRef = useRef({ active: false, startX: 0, startY: 0, posX: 0, posY: 0 })

  const handleWhiteBoxClick = () => {
    if (phase === 'text') setPhase('options')
  }

  const handleCameraClick = () => {
    if (phase === 'initial') setPhase('text')
    else if (phase === 'text') setPhase('options')
    else if (phase === 'after-select') setPhase('detect')
    else if (phase === 'detect') setPhase('callout')
  }

  const handleOptionClick = (idx) => {
    if (phase !== 'options') return
    setSelectedOpt(idx)
    setTimeout(() => {
      setSelectedOpt(null)
      setPhase('after-select')
    }, 800)
  }

  const handleCalloutClick = () => {
    if (phase === 'callout') setPhase('text3')
  }

  const handleShutter = () => {
    if (phase !== 'text3') return
    setFlash(true)
    setTimeout(() => {
      setFlash(false)
      if (polaroid2Revealed) return
      setExiting(true)
      setTimeout(() => onPostcard?.(), 600)
    }, 400)
  }

  const onDetectDown = useCallback((e) => {
    e.stopPropagation()
    const p = e.touches ? e.touches[0] : e
    detectRef.current = { active: true, startX: p.clientX, startY: p.clientY, posX: detectPos.x, posY: detectPos.y }
  }, [detectPos])

  useEffect(() => {
    const onMove = (e) => {
      if (!detectRef.current.active) return
      const p = e.touches ? e.touches[0] : e
      setDetectPos({
        x: detectRef.current.posX + p.clientX - detectRef.current.startX,
        y: detectRef.current.posY + p.clientY - detectRef.current.startY,
      })
    }
    const onUp = () => { detectRef.current.active = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const showDetect = phase === 'detect' || phase === 'callout'
  const showText1 = phase !== 'initial' && phase !== 'text3'

  const polaroidSrc = phase === 'initial'
    ? './images/噪点底图.png'
    : phase === 'text' || phase === 'options'
      ? contentData.imgTheater1
      : contentData.imgTheater2

  return (
    <div className={`interaction-page ${exiting ? 'p2-exiting' : ''}`}>
      <img className="int-bg" src="./images/v2_2.png" alt="" />

      {/* SVG 噪点滤镜 */}
      <svg className="p2-noise-svg">
        <filter id="noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch">
            <animate attributeName="baseFrequency" values="0.75;0.8;0.7;0.75" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="seed" values="1;5;3;8;1" dur="0.6s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0.45 0" />
        </filter>
      </svg>

      {/* 场景图矩形 */}
      {phase !== 'initial' && (
        <div className="p2-scene-rect" style={{ backgroundImage: `url(${polaroidSrc})` }} />
      )}

      {/* 白色矩形 5:4 */}
      <div
        className={`p2-white-box ${(showText1 || phase === 'text3') ? 'p2-white-box--text' : ''} ${phase === 'text3' ? 'p2-white-box--tall' : ''}`}
        onClick={handleWhiteBoxClick}
      >
        {phase === 'initial' && <div className="p2-white-placeholder" />}

        {/* 文字1：叙事 */}
        {showText1 && (
          <div className="p2-text-inner">
            <div className="p2-text-title">{contentData.p2Text1Title}</div>
            <div className="p2-text-body">{contentData.p2Text1Body}</div>
            <div className="p2-text-name">{ocName || '[OC名字]'}</div>
          </div>
        )}

        {/* 文字3：填空输入 */}
        {phase === 'text3' && (
          <div className="p2-text-inner">

            <div className="p2-text-body" style={{ marginTop: 6 }}>{contentData.p2Text3Body.replace('[OC名字]', ocName || '[OC名字]')}</div>
            <div className="p2-text-name">{ocName || '[OC名字]'}{contentData.p2Text3Suffix}</div>
            <input
              className="p2-blank-input"
              placeholder="..."
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
            />
          </div>
        )}

      </div>

      {/* 黑色半透明覆盖 + 选项ABC */}
      {phase === 'options' && (
        <>
          <div className="p2-dark-overlay" />
          <div className="p2-options-panel">
            <div className="p2-options-list">
              {OPTIONS_1.map((opt, i) => (
                <div
                  key={i}
                  className={`p2-option ${selectedOpt === i ? 'p2-option--selected' : ''}`}
                  onClick={() => handleOptionClick(i)}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 相机 + 拍立得底图 */}
      <div className="p2-media-group">
        <img className="p2-camera" src="./images/相机.png" alt="" />
        <div className="p2-noise-overlay" />
        <div className="p2-polaroid-wrap" onClick={handleCameraClick}>
          <div className="p2-polaroid-bg" style={{ backgroundImage: `url(${polaroidSrc})` }} />
          <div className="p2-polaroid-photo">
            {polaroid2Image && <img src={polaroid2Image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          {phase !== 'initial' && (
            <img className="p2-polaroid-effect" src="./images/相机效果.png" alt="" />
          )}
          <div className={`p2-polaroid-noise ${phase !== 'initial' ? 'p2-polaroid-noise--fade' : ''}`} />
        </div>

        {/* 人物识别框 */}
        {showDetect && (
          <div
            className="p2-detect-box"
            style={{ left: detectPos.x, top: detectPos.y }}
            onMouseDown={onDetectDown}
            onTouchStart={onDetectDown}
          >
            <div className="p2-detect-label">image</div>
          </div>
        )}
      </div>

      {/* 蓝色呼出框 + 连线 */}
      {phase === 'callout' && (
        <>
          <svg className="p2-callout-line" viewBox="0 0 393 852">
            <polyline
              points="230,360 260,360 260,380 272,380"
              fill="none"
              stroke="#0011ff"
              strokeWidth="1"
            />
          </svg>
          <div className="p2-callout-box" onClick={handleCalloutClick}>
            <div className="p2-callout-text">{contentData.p2Text2}</div>
          </div>
        </>
      )}

      {/* 快门按钮 */}
      {phase === 'text3' && (
        <div className="p2-shutter-btn" onClick={handleShutter} />
      )}

      {/* 快门闪光 */}
      {flash && <div className="p2-shutter-flash" />}

      {/* 标题 */}
      <div className="p2-title">
        <span className="p2-title-main">旅行日志</span>
        <span className="p2-title-num">02</span>
      </div>

      {/* 返回 */}
      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="./images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
