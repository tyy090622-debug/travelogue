import { useState } from 'react'
import './Scene2.css'
import { ticketText, receiptText } from '../data/scene2Content'

// 交互页组件
import TicketInteraction from './TicketInteraction'
import ReceiptInteraction from './ReceiptInteraction'
import PolaroidInteraction from './PolaroidInteraction'
import Polaroid1Interaction from './Polaroid1Interaction'
import Polaroid2Interaction from './Polaroid2Interaction'

export default function Scene2() {
  // phase: 'board' | 'ticket-int' | 'receipt-int' | 'polaroid-int' | 'polaroid1-int' | 'polaroid2-int' | 'paper-int'
  const [phase, setPhase] = useState('board')
  // 小票选中的贴纸（提升状态，两边共享）
  const [selectedStickers, setSelectedStickers] = useState([])

  const goTo = (p) => setPhase(p)
  const goBack = () => setPhase('board')

  // 渲染对应交互页
  if (phase === 'ticket-int') return <TicketInteraction onBack={goBack} />
  if (phase === 'receipt-int') return (
    <ReceiptInteraction
      onBack={goBack}
      selected={selectedStickers}
      onSelectStickers={setSelectedStickers}
    />
  )
  if (phase === 'polaroid-int') return <PolaroidInteraction onBack={goBack} onPolaroid1={() => goTo('polaroid1-int')} onPolaroid2={() => goTo('polaroid2-int')} />
  if (phase === 'polaroid1-int') return <Polaroid1Interaction onBack={() => goTo('polaroid-int')} />
  if (phase === 'polaroid2-int') return <Polaroid2Interaction onBack={() => goTo('polaroid-int')} />

  const receiptTotal = selectedStickers.reduce((acc, s) => acc + s.price, 0)

  return (
    <div className="scene2">
      <div className="scene2__canvas">

        {/* 背景图 */}
        <div className="scene2__bg" />

        {/* 桌布 */}
        <div className="scene2__tablecloth" />

        {/* ========== 机票 ========== */}
        <div className="scene2__ticket-wrap" onClick={() => goTo('ticket-int')}>
          <div className="scene2__ticket-bg" />
          <div className="ticket-text">
            <span className="ticket-route-text">{ticketText.left.route}</span>
            <span className="ticket-divider-text">{ticketText.left.divider}</span>
            <span className="ticket-info-text">
              {ticketText.left.row1Label}
              {' '}{ticketText.left.row1Value}
            </span>
            <span className="ticket-info-text">
              {ticketText.left.row2Label}{' '}{ticketText.left.row2Value}
            </span>
            <span className="ticket-info-text">
              {ticketText.left.row3Label}{' '}{ticketText.left.row3Value}
            </span>
          </div>
          <div className="ticket-barcode">{ticketText.right}</div>
        </div>

        {/* ========== 小票 ========== */}
        <div className="scene2__receipt" onClick={() => goTo('receipt-int')}>
          <div className="scene2__receipt-bg" />
          <div className="receipt-barcode">{receiptText.bottom}</div>
          <div className="receipt-header-text">
            <div className="receipt-title">{receiptText.header}</div>
            <div className="receipt-sub">{receiptText.subheader}</div>
            <div className="receipt-sep">----------------------------</div>
            <div className="receipt-no">{receiptText.no}</div>
            <div className="receipt-sep">----------------------------</div>
          </div>
          {/* 动态商品列表 */}
          <div className="receipt-table">
            {selectedStickers.map(s => (
              <div key={s.id} className="receipt-item-row">
                <span className="receipt-item-name">{s.name}</span>
                <span className="receipt-item-price">{s.price.toFixed(2)}</span>
              </div>
            ))}
            {selectedStickers.length > 0 && (
              <>
                <div className="receipt-sep2">-------------------------</div>
                <div className="receipt-total">合计：{receiptTotal.toFixed(2)}€</div>
              </>
            )}
          </div>
          <div className="receipt-date">
            {receiptText.date}
            <br />
            {receiptText.code1}
            <br />
            {receiptText.code2}
          </div>
        </div>

        {/* ========== 拍立得1 ========== */}
        <div className="scene2__polaroid-1" onClick={() => goTo('polaroid-int')}>
          <div className="polaroid-1-base" />
          <div className="polaroid-1-frame" />
        </div>

        {/* ========== 拍立得2 ========== */}
        <div className="scene2__polaroid-2" onClick={() => goTo('polaroid-int')}>
          <div className="polaroid-2-base" />
          <div className="polaroid-2-frame" />
        </div>

        {/* ========== 铅笔 ========== */}
        <div className="scene2__pencil" />

      </div>
    </div>
  )
}
