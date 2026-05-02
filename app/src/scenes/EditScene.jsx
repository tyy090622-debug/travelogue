import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import './EditScene.css'
import CropModal from '../components/CropModal'

function Section({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="edit-section">
      <div className="edit-section-title" onClick={() => setOpen(o => !o)}>
        <span className={`edit-section-arrow ${open ? 'edit-section-arrow--open' : ''}`}>&#9654;</span>
        {title}
      </div>
      {open && <div className="edit-section-body">{children}</div>}
    </div>
  )
}

function TextField({ label, value, onChange, area }) {
  return (
    <label className="edit-field">
      <span className="edit-field-label">{label}</span>
      {area
        ? <textarea className="edit-textarea" value={value} onChange={e => onChange(e.target.value)} rows={4} />
        : <input className="edit-input" value={value} onChange={e => onChange(e.target.value)} />
      }
    </label>
  )
}

function ImgUpload({ label, value, onChange, cropW = 250, cropH = 250, resizeTo }) {
  const inputRef = useRef(null)
  const [showCrop, setShowCrop] = useState(false)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // 直接触发裁剪弹窗，把文件上传交给 CropModal
    setShowCrop(true)
    // 用 setTimeout 确保 CropModal 挂载后立即触发文件选择
    setTimeout(() => {
      // CropModal 自己有 file input，我们这里不改动它
    }, 50)
  }

  const isDataUrl = value && value.startsWith('data:')

  return (
    <label className="edit-field">
      <span className="edit-field-label">{label}</span>
      <div className="edit-img-upload" onClick={() => setShowCrop(true)}>
        <div
          className="edit-img-upload-preview"
          style={{ backgroundImage: `url(${value})` }}
        />
        <div className="edit-img-upload-hint">点击替换图片</div>
      </div>
      {isDataUrl && <div className="edit-img-upload-tag">已上传</div>}

      {showCrop && createPortal(
        <CropModal
          cropW={cropW}
          cropH={cropH}
          resizeTo={resizeTo}
          onConfirm={(dataUrl) => {
            onChange(dataUrl)
            setShowCrop(false)
          }}
          onCancel={() => setShowCrop(false)}
        />,
        document.querySelector('.edit-portal-root')
      )}
    </label>
  )
}

export default function EditScene({ onBack, contentData, onSave }) {
  const [data, setData] = useState({ ...contentData })
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    onSave?.(data)
  }

  return (
    <div className="interaction-page">
      <img className="int-bg" src="./images/v2_2.png" alt="" />

      <div className="edit-panel">
        <div className="edit-title">编辑模式</div>

        <Section title="机票文本" defaultOpen={true}>
          <TextField label="夹板引言" value={data.ticketIntro} onChange={set('ticketIntro')} area />
          <TextField label="航线" value={data.ticketRoute} onChange={set('ticketRoute')} />
          <TextField label="分隔线" value={data.ticketDivider} onChange={set('ticketDivider')} />
          <TextField label="信息行1标签" value={data.ticketRow1Label} onChange={set('ticketRow1Label')} />
          <TextField label="信息行1值" value={data.ticketRow1Value} onChange={set('ticketRow1Value')} />
          <TextField label="信息行2标签" value={data.ticketRow2Label} onChange={set('ticketRow2Label')} />
          <TextField label="信息行2值" value={data.ticketRow2Value} onChange={set('ticketRow2Value')} />
          <TextField label="信息行3标签" value={data.ticketRow3Label} onChange={set('ticketRow3Label')} />
          <TextField label="信息行3值" value={data.ticketRow3Value} onChange={set('ticketRow3Value')} />
          <TextField label="条码" value={data.ticketBarcode} onChange={set('ticketBarcode')} />
        </Section>

        <Section title="小票文本">
          <TextField label="编号" value={data.receiptNo} onChange={set('receiptNo')} />
          <TextField label="日期" value={data.receiptDate} onChange={set('receiptDate')} />
          <TextField label="编码1" value={data.receiptCode1} onChange={set('receiptCode1')} />
          <TextField label="编码2" value={data.receiptCode2} onChange={set('receiptCode2')} />
          <TextField label="底部条码" value={data.receiptBarcode} onChange={set('receiptBarcode')} />
        </Section>

        <Section title="小票·小物（8个贴纸）">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="edit-subsection">
              <div className="edit-subsection-label">贴纸{i}</div>
              <TextField label="名称" value={data[`s${i}name`]} onChange={set(`s${i}name`)} />
              <TextField label="价格 (€)" value={String(data[`s${i}price`])} onChange={(v) => set(`s${i}price`)(Number(v) || 0)} />
              <TextField label="描述（翻面文字）" value={data[`s${i}desc`]} onChange={set(`s${i}desc`)} area />
              <ImgUpload label="图片" value={data[`s${i}img`]} onChange={set(`s${i}img`)} cropW={130} cropH={130} resizeTo={{w:260, h:260}} />
            </div>
          ))}
        </Section>

        <Section title="普通题·复选框（4页）">
          {[1,2,3,4].map(i => (
            <div key={i} className="edit-subsection">
              <div className="edit-subsection-label">第{i}页</div>
              <TextField label="题目" value={data[`check${i}Q`]} onChange={set(`check${i}Q`)} />
              <TextField label="选项（每行一个）" value={data[`check${i}Opts`]} onChange={set(`check${i}Opts`)} area />
            </div>
          ))}
        </Section>

        <Section title="普通题·数轴（4页）">
          {[1,2,3,4].map(i => (
            <div key={i} className="edit-subsection">
              <div className="edit-subsection-label">第{i}页</div>
              <TextField label="题目" value={data[`axis${i}Q`]} onChange={set(`axis${i}Q`)} />
              <TextField label="左侧" value={data[`axis${i}L`]} onChange={set(`axis${i}L`)} />
              <TextField label="右侧" value={data[`axis${i}R`]} onChange={set(`axis${i}R`)} />
            </div>
          ))}
        </Section>

        <Section title="拍立得1·地点文本（5个）">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="edit-subsection">
              <div className="edit-subsection-label">地点{i}</div>
              <TextField label="名称" value={data[`p1Place${i}`]} onChange={set(`p1Place${i}`)} />
              <TextField label="文本" value={data[`p1Place${i}Text`]} onChange={set(`p1Place${i}Text`)} area />
            </div>
          ))}
        </Section>

        <Section title="拍立得2·选项">
          {[1,2,3].map(i => (
            <TextField key={i} label={`选项${i}`} value={data[`p2Opt${i}`]} onChange={set(`p2Opt${i}`)} />
          ))}
        </Section>

        <Section title="拍立得2·叙事文本">
          <TextField label="白框标题" value={data.p2Text1Title} onChange={set('p2Text1Title')} />
          <TextField label="白框正文" value={data.p2Text1Body} onChange={set('p2Text1Body')} />
          <TextField label="呼出框文本" value={data.p2Text2} onChange={set('p2Text2')} area />
          <TextField label="填空页正文" value={data.p2Text3Body} onChange={set('p2Text3Body')} area />
          <TextField label="填空后缀" value={data.p2Text3Suffix} onChange={set('p2Text3Suffix')} />
        </Section>

        <Section title="可替换图片">
          <ImgUpload label="拍立得背景" value={data.imgPolaroidBg} onChange={set('imgPolaroidBg')} cropW={189} cropH={197} />
          <ImgUpload label="巴黎剧场1" value={data.imgTheater1} onChange={set('imgTheater1')} cropW={393} cropH={400} />
          <ImgUpload label="巴黎剧场2" value={data.imgTheater2} onChange={set('imgTheater2')} cropW={393} cropH={400} />
        </Section>

        <div className="edit-save-btn" onClick={handleSave}>保存修改</div>
      </div>

      <div className="edit-portal-root" />

      <div className="int-back" onClick={onBack}>
        <img className="int-back-img" src="./images/便签.png" alt="" />
        <div className="int-back-text">返回</div>
      </div>
    </div>
  )
}
