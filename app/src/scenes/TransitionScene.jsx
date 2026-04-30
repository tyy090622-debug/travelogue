import { useEffect, useState } from 'react'
import { transitionPageText } from '../data/transitionPage'
import './TransitionScene.css'

const IMG_BG = '/images/过渡页背景.png'

export default function TransitionScene({ onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (visibleCount < transitionPageText.length) {
      const timer = setTimeout(() => {
        setVisibleCount((n) => n + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (!done) {
      // 文字显示完等1.5秒，开始淡出
      const timer = setTimeout(() => {
        setFading(true)
        setTimeout(() => {
          setDone(true)
          onComplete && onComplete()
        }, 600)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [visibleCount, done, onComplete])

  return (
    <div className={`transition ${fading ? 'is-fading' : ''}`}>
      <img className="transition__bg" src={IMG_BG} alt="" />
      <div className="transition__text-area">
        {transitionPageText.map((line, i) => (
          <div
            key={i}
            className={`transition__line ${i < visibleCount ? 'is-visible' : ''}`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
