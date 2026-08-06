import { TOUR_CATALOG } from '../../../../datas/tourCatalog'
import styles from './TourPickerSheet.module.css'

export function TourPickerSheet({ open, hasCompletedTour, onSelect, onClose }) {
  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <h2 className={styles.title}>Take a tour</h2>
        <p className={styles.subtitle}>Choose what you'd like a walkthrough of.</p>

        <div className={styles.list}>
          {TOUR_CATALOG.map((tour) => {
            const completed = hasCompletedTour(tour.id)
            return (
              <button
                key={tour.id}
                type="button"
                className={styles.item}
                onClick={() => onSelect(tour.id)}
              >
                <span className={styles.iconWrap}>
                  <span className="mi">{tour.icon}</span>
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemLabel}>{tour.label}</span>
                  <span className={styles.itemDescription}>{tour.description}</span>
                </span>
                {completed ? (
                  <span className={`mi ${styles.completedIcon}`}>check_circle</span>
                ) : (
                  <span className={`mi ${styles.chevron}`}>chevron_right</span>
                )}
              </button>
            )
          })}
        </div>

        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
