import { SectionHeader } from "../SectionHeader/SectionHeader"
import { AppointmentRow } from "../../../../components/AppointmentRow/AppointmentRow"
import styles from "./UpcomingAppointmentsSection.module.css"


export function UpcomingAppointmentsSection({ appointments, todayAppointments, allOrders = [], onSeeAll, onSelectAppointment }) {
  return (
    <section className={styles.section}>
      <SectionHeader title="Upcoming Appointments" onSeeAll={onSeeAll} />

      <div className={styles.listSection}>
        <div className={styles.listDivider} />
        {appointments.map((appt, index) => {
          const isToday = todayAppointments.some(a => a.id === appt.id)

          return (
            <div key={appt.id} className={styles.apptWrapper}>
              <AppointmentRow
                appt={appt}
                isLast={index === appointments.length - 1}
                allOrders={allOrders}
                onOpen={() => onSelectAppointment?.(appt)}
              />
              {isToday && <div className={styles.todayBadge}>Today</div>}
            </div>
          )
        })}
      </div>
    </section>
  )
}