import './Question.css'

const IMG_RED_CIRCLE = '/images/红勾.png'

export default function Question({ question, selected, onSelect }) {
  const labels = ['A', 'B', 'C']

  return (
    <div className="question">
      <div className="question__text">{question.text}</div>
      <div className="question__options">
        {[0, 1, 2].map((i) => (
          <div
            key={labels[i]}
            className={`question__option ${selected === labels[i] ? 'is-selected' : ''}`}
            onClick={() => onSelect && onSelect(labels[i])}
          >
            {selected === labels[i] && (
              <img className="question__circle" src={IMG_RED_CIRCLE} alt="" />
            )}
            <span className="question__label">{labels[i]}.</span>
            <span className="question__option-text">{question.options[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
