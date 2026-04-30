import './PaperInteraction.css'
import './interaction-base.css'

export default function PaperInteraction({ onBack }) {
  return (
    <div className="interaction-page">
      <img className="int-bg" src="/images/v2_2.png" alt="" />
      <img className="int-table" src="/images/v2_3.png" alt="" />
      <img className="int-disperse" src="/images/物品退散-纸片.png" alt="" />
      <img
        className="int-white-paper"
        src="/images/白纸.png"
        alt=""
        style={{ position: 'absolute', top: '156px', left: '1px', width: '320px', height: '569px', zIndex: 10,display: 'block' }}
      />

      <div className="paper-int-content">
        <img className="paper-int-img" src="/images/v2_27.png" alt="" />
        <div className="paper-int-text">这是一个示例文本123abc</div>
      </div>

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="/images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
