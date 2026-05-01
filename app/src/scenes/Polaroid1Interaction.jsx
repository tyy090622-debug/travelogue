import './Polaroid1Interaction.css'

export default function Polaroid1Interaction({ onBack }) {
  return (
    <div className="interaction-page">
      <img className="int-bg" src="/images/v2_2.png" alt="" />

      {/* 手账本 - 居中旋转90度 */}
      <img className="p1-notebook" src="/images/手账本.png" alt="" />

      {/* 上半部分：两个4:1文本容器 */}
      <div className="p1-text-box p1-text-box--1" />
      <div className="p1-text-box p1-text-box--2" />

      {/* 装饰圆点 */}
      <div className="p1-dot p1-dot--1" />
      <div className="p1-dot p1-dot--2" />

      {/* 金属长尾夹 */}
      <img className="p1-clip" src="/images/金属长尾夹.png" alt="" />

      {/* 下半部分：拍立得底图 */}
      <div className="p1-polaroid-wrap">
        <img className="p1-polaroid-img" src="/images/拍立得底图.png" alt="" />
      </div>

      {/* 红色钉子 */}
      <img className="p1-pin p1-pin--tl" src="/images/红色钉子.png" alt="" />
      <img className="p1-pin p1-pin--tr" src="/images/红色钉子.png" alt="" />

      {/* 右边4:5文本框 */}
      <div className="p1-note-box" />

      {/* 返回 */}
      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="/images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
