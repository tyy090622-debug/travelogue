import { useState, useEffect } from 'react'
import './Scene1.css'
import { questions } from '../data/questions'
import Question from '../components/Question'
import TransitionScene from './TransitionScene'
import Scene2 from './Scene2'

const IMG_BG = '/images/场景1底图.png'
const IMG_BOARD_1 = '/images/背板1图片.png'
const IMG_BOARD_2 = '/images/背板2图片.png'
const IMG_STICKY = '/images/便签.png'
const IMG_INDEX_PREV = '/images/索引(上一页).png'
const IMG_INDEX_NEXT = '/images/索引(下一页).png'
const IMG_STAMP = '/images/通过盖章.png'

export default function Scene1() {
  const [page, setPage] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState(
    Array(questions.length).fill(null)
  )
  const [stamped, setStamped] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [phase, setPhase] = useState('survey') // 'survey' | 'transition' | 'scene2'

  // 盖章后1秒自动进入过渡页
  useEffect(() => {
    if (stamped) {
      const timer = setTimeout(() => setPhase('transition'), 1000)
      return () => clearTimeout(timer)
    }
  }, [stamped])

  const handleSelect = (index, option) => {
    setSelectedOptions((prev) => {
      const next = [...prev]
      next[index] = next[index] === option ? null : option
      return next
    })
  }

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1))
    setStamped(false)
  }
  const handleNext = () => {
    setPage((p) => Math.min(2, p + 1))
    setStamped(false)
    setShowGuide(false)
  }

  const allAnswered = selectedOptions.every((opt) => opt !== null)

  return (
    <>
      {phase === 'transition' && <TransitionScene onComplete={() => setPhase('scene2')} />}
      {phase === 'scene2' && <Scene2 />}
      {phase === 'survey' && (
        <div className="scene1">
        <img className="scene1__bg" src={IMG_BG} alt="背景" />

      <div className="scene1__board-wrap">
        <img
          className="scene1__board"
          src={page === 1 ? IMG_BOARD_1 : IMG_BOARD_2}
          alt="背板"
        />

        <div className="scene1__board-content">

          {/* 便签（仅第1页） */}
          {page === 1 && (
            <div className="scene1__sticky-note">
              <img src={IMG_STICKY} alt="便签" />
              <div className="scene1__persona-box" />
            </div>
          )}

          {/* 索引上一页 */}
          <div className="scene1__index-prev" onClick={handlePrev}>
            <img src={IMG_INDEX_PREV} alt="索引上一页" />
          </div>

          {/* 索引下一页 */}
          <div className="scene1__index-next" onClick={handleNext}>
            <img src={IMG_INDEX_NEXT} alt="索引下一页" />
          </div>

          {/* 引导竖字 */}
          {showGuide && (
            <div className="scene1__guide">点击切换下一页</div>
          )}

          {/* 底部长方形（仅第1页） */}
          {page === 1 && (
            <div className="scene1__bottom-box">
              <div className="scene1__text-container">
                {/* 标题 */}
                <div className="scene1__text-title">
                  <span className="main-title">旅社乘客<br />调研表</span>
                  <span className="sub-text">——————</span>
                </div>
                {/* 用户输入 */}
                <div className="scene1__text-top">
                  请核对您的车票<br />
                  本次行程该如何<br />
                  称呼您？
                </div>
                {/* 题目1 */}
                <div className="scene1__text-question">
                  <Question
                    question={questions[0]}
                    selected={selectedOptions[0]}
                    onSelect={(opt) => handleSelect(0, opt)}
                  />
                </div>
                {/* 题目2 */}
                <div className="scene1__text-question">
                  <Question
                    question={questions[1]}
                    selected={selectedOptions[1]}
                    onSelect={(opt) => handleSelect(1, opt)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 第2页内容 */}
          {page === 2 && (
            <div className="scene1__bottom-box scene1__bottom-box--page2">
              <div className="scene1__text-container">
                {/* 题目3 */}
                <div className="scene1__text-question">
                  <Question
                    question={questions[2]}
                    selected={selectedOptions[2]}
                    onSelect={(opt) => handleSelect(2, opt)}
                  />
                </div>
                {/* 题目4 */}
                <div className="scene1__text-question">
                  <Question
                    question={questions[3]}
                    selected={selectedOptions[3]}
                    onSelect={(opt) => handleSelect(3, opt)}
                  />
                </div>
                {/* 题目5 */}
                <div className="scene1__text-question">
                  <Question
                    question={questions[4]}
                    selected={selectedOptions[4]}
                    onSelect={(opt) => handleSelect(4, opt)}
                  />
                </div>
                {/* 空10% / 盖章提示 */}
                <div className="scene1__text-empty">
                  {allAnswered && !stamped && (
                    <div className="scene1__stamp-hint" onClick={() => setStamped(true)}>
                      点击并申请盖章
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 盖章（背板级别，第2页右下角） */}
          {page === 2 && stamped && (
            <div className="scene1__stamp-wrap">
              <img className="scene1__stamp-img" src={IMG_STAMP} alt="盖章" />
            </div>
          )}

        </div>
      </div>
    </div>
    )}
    </>
  )
}
