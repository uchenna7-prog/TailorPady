import { MAX_FAQS, FAQ_QUESTION_MAX, FAQ_ANSWER_MAX } from '../datas'
import styles from './FaqField.module.css'

export function FaqField({ value, onChange }) {
  const faqs = Array.isArray(value) && value.length > 0 ? value : [{ question: '', answer: '' }]

  function updateFaq(index, key, val) {
    const next = faqs.map((f, i) => i === index ? { ...f, [key]: val } : f)
    onChange(next)
  }

  function addFaq() {
    if (faqs.length >= MAX_FAQS) return
    onChange([...faqs, { question: '', answer: '' }])
  }

  function removeFaq(index) {
    onChange(faqs.filter((_, i) => i !== index))
  }

  return (
    <div className={styles.wrap}>
      {faqs.map((faq, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.faqNumber}>Q{i + 1}</span>
            <button
              type="button"
              className={styles.removeBtn}
              disabled={faqs.length === 1}
              onClick={() => removeFaq(i)}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>close</span>
            </button>
          </div>
          <input
            type="text"
            className={styles.questionInput}
            placeholder="e.g. Can I bring my own fabric?"
            value={faq.question}
            maxLength={FAQ_QUESTION_MAX}
            onChange={e => updateFaq(i, 'question', e.target.value)}
            className={styles.input}
          />
          <textarea
            className={styles.answerInput}
            placeholder="e.g. Yes, you're welcome to bring your own fabric or we can help you source one."
            value={faq.answer}
            maxLength={FAQ_ANSWER_MAX}
            rows={3}
            onChange={e => updateFaq(i, 'answer', e.target.value)}
            className={styles.textarea}
          />
        </div>
      ))}

      {faqs.length < MAX_FAQS && (
        <button type="button" className={styles.addBtn} onClick={addFaq}>
          <span className="mi">add</span>
          Add Question
        </button>
      )}
    </div>
  )
}
