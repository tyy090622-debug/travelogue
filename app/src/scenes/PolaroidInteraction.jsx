import './PolaroidInteraction.css'

export default function PolaroidInteraction({ onBack, onPolaroid1, onPolaroid2 }) {
  return (
    <div className="interaction-page">
      <img className="int-bg" src="/images/v2_2.png" alt="" />
      <img className="int-table" src="/images/v2_3.png" alt="" />
      <img className="int-disperse" src="/images/物品退散-拍立得.png" alt="" />

      {/* 退散背景大图（占满屏） */}
      <img className="polaroid-int-full-disperse" src="/images/物品退散-拍立得.png" alt="" />

      {/* 拍立得1 - 倾斜放置 */}
      <div className="polaroid-int-p1" onClick={onPolaroid1}>
        <div className="polaroid-int-p1-base" />
        <img className="polaroid-int-p1-img" src="/images/v2_21.png" alt="" />
      </div>

      {/* 拍立得2 - 另一处倾斜 */}
      <div className="polaroid-int-p2" onClick={onPolaroid2}>
        <div className="polaroid-int-p2-base" />
        <img className="polaroid-int-p2-img" src="/images/v2_25.png" alt="" />
      </div>

      {/* 贴纸固定位置矩形 */}
      <div className="polaroid-int-sticker-box1" />
      <div className="polaroid-int-sticker-box2" />

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="/images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
