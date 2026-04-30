import './Polaroid1Interaction.css'

export default function Polaroid1Interaction({ onBack }) {
  return (
    <div className="interaction-page">
      <img className="int-bg" src="/images/v2_2.png" alt="" />
      <img className="int-table" src="/images/v2_3.png" alt="" />
      <img className="int-disperse" src="/images/物品退散-拍立得.png" alt="" />

      {/* 拍立得主体 */}
      <div className="polaroid1-int">
        <img className="polaroid1-int-img" src="/images/v2_21.png" alt="" />
        <div className="polaroid1-int-base" />
      </div>

      {/* 文字框 */}
      <div className="polaroid1-int-text-bg" />
      <div className="polaroid1-int-text">
        <span className="polaroid1-int-text-main">旅行日志</span>
        <span className="polaroid1-int-text-num">01</span>
      </div>

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="/images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
