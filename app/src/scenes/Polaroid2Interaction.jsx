import './Polaroid2Interaction.css'

export default function Polaroid2Interaction({ onBack }) {
  return (
    <div className="interaction-page">
      <img className="int-bg" src="/images/v2_2.png" alt="" />

      {/* 拍立得主体 */}
      <div className="polaroid2-int">
        <img className="polaroid2-int-img" src="/images/v2_25.png" alt="" />
        <div className="polaroid2-int-base" />
      </div>

      {/* 文字区域 */}
      <div className="polaroid2-int-box1" />
      <div className="polaroid2-int-box2" />
      <div className="polaroid2-int-text">旅行日志 /<span className="cyan">02</span></div>

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="/images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
