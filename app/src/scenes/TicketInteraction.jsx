import { useState } from 'react'
import './TicketInteraction.css'
import './interaction-base.css'
import './Scene1.css'

const IMG_BG = '/images/v2_2.png'
const IMG_TABLE = '/images/v2_3.png'
const IMG_DISPERSE = '/images/物品退散-机票.png'
const IMG_TICKET = '/images/v2_5.png'
const IMG_BOARD_1 = '/images/背板1图片.png'
const IMG_BOARD_2 = '/images/背板2图片.png'
const IMG_STICKY = '/images/便签.png'
const IMG_INDEX_PREV = '/images/索引(上一页).png'
const IMG_INDEX_NEXT = '/images/索引(下一页).png'

export default function TicketInteraction({ onBack }) {
  const [page, setPage] = useState(1)

  const handlePrev = () => setPage(p => Math.max(1, p - 1))
  const handleNext = () => setPage(p => Math.min(2, p + 1))

  return (
    <div className="interaction-page">
      <img className="int-bg" src={IMG_BG} alt="" />
      <img className="int-table" src={IMG_TABLE} alt="" />
      <img className="int-disperse" src={IMG_DISPERSE} alt="" />

      {/* 机票本体 */}
      <div className="ticket-int-content">
        <img className="ticket-int-img" src={IMG_TICKET} alt="" />
        <div className="ticket-int-text">
          <div className="ticket-int-title">北京——巴黎</div>
          <div className="ticket-int-divider">————————————</div>
          <div className="ticket-int-info">航班号    日期      座位号</div>
          <div className="ticket-int-value">2026      03/22    30</div>
          <div className="ticket-int-row">登机时间  17:00</div>
          <div className="ticket-int-row ticket-int-row--gate">登机口  BC44</div>
        </div>
        <div className="ticket-int-barcode">2348RBSH→FUG</div>
      </div>

      {/* 夹板容器 */}
      <div className="scene1__board-wrap ticket-board-wrap">
        <img className="scene1__board" src={page === 1 ? IMG_BOARD_1 : IMG_BOARD_2} alt="" />
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
              <div className="scene1__persona-box" />
            </div>
          )}

          {/* 底部长方形文本容器 */}
          <div className="scene1__bottom-box">
            <div className="scene1__text-container">
              {page === 1 && (
                <>
                  <div className="scene1__text-title">
                    <span className="main-title">旅社乘客<br />调研表</span>
                    <span className="sub-text">——————</span>
                  </div>
                  <div className="scene1__text-top">
                    请核对您的车票<br />
                    本次行程该如何<br />
                    称呼您？
                  </div>
                  <div className="scene1__text-empty" />
                </>
              )}
              {page === 2 && (
                <div className="scene1__text-empty" />
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src={IMG_STICKY} alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
