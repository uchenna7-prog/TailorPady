import { SectionHeader } from "../SectionHeader/SectionHeader"
import { AppointmentRow } from "../../../../components/AppointmentRow/AppointmentRow"
import styles from "./PastAppointmentsSection.module.css"


export function PastAppointmentsSection({ appointments, allOrders = [], onSeeAll, onSelectAppointment }) {
  return (
    <section className={styles.section}>
      <SectionHeader title="Recent Appointments" onSeeAll={onSeeAll} />

      <div className={styles.listSection}>
        <div className={styles.listDivider} />
        {appointments.map((appt, index) => (
          <AppointmentRow
            key={appt.id}
            appt={appt}
            isLast={index === appointments.length - 1}
            allOrders={allOrders}
            onOpen={() => onSelectAppointment?.(appt)}
          />
        ))}
      </div>
    </section>
  )
}