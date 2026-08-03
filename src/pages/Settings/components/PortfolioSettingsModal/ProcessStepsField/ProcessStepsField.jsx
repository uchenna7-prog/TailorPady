import { MAX_PROCESS_STEPS, PROCESS_STEP_TITLE_MAX, PROCESS_STEP_DESC_MAX } from '../datas'
import styles from './ProcessStepsField.module.css'

export function ProcessStepsField({ value, onChange }) {
  const steps = Array.isArray(value) && value.length > 0 ? value : [{ title: '', description: '' }]

  function updateStep(index, key, val) {
    const next = steps.map((s, i) => i === index ? { ...s, [key]: val } : s)
    onChange(next)
  }

  function addStep() {
    if (steps.length >= MAX_PROCESS_STEPS) return
    onChange([...steps, { title: '', description: '' }])
  }

  function removeStep(index) {
    onChange(steps.filter((_, i) => i !== index))
  }

  function moveStep(index, dir) {
    const target = index + dir
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className={styles.wrap}>
      {steps.map((step, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.stepNumber}>{i + 1}</span>
            <div className={styles.cardActions}>
              <button type="button" className={styles.iconBtn} disabled={i === 0} onClick={() => moveStep(i, -1)}>
                <span className="mi" style={{ fontSize: '1rem' }}>arrow_upward</span>
              </button>
              <button type="button" className={styles.iconBtn} disabled={i === steps.length - 1} onClick={() => moveStep(i, 1)}>
                <span className="mi" style={{ fontSize: '1rem' }}>arrow_downward</span>
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                disabled={steps.length === 1}
                onClick={() => removeStep(i)}
              >
                <span className="mi" style={{ fontSize: '1rem' }}>close</span>
              </button>
            </div>
          </div>
          <input
            type="text"
            className={styles.titleInput}
            placeholder="e.g. Consultation"
            value={step.title}
            maxLength={PROCESS_STEP_TITLE_MAX}
            onChange={e => updateStep(i, 'title', e.target.value)}
            className={styles.input}
          />
          <textarea
            className={styles.descInput}
            placeholder="e.g. We discuss your style, fabric, and timeline."
            value={step.description}
            maxLength={PROCESS_STEP_DESC_MAX}
            rows={2}
            onChange={e => updateStep(i, 'description', e.target.value)}
            className={styles.textarea}
          />
        </div>
      ))}

      {steps.length < MAX_PROCESS_STEPS && (
        <button type="button" className={styles.addBtn} onClick={addStep}>
          <span className="mi">add</span>
          Add Step
        </button>
      )}
    </div>
  )
}
