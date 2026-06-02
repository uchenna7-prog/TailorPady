import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import {
  subscribeToAppointments,
  addAppointment as addAppointmentToDb,
  updateAppointment as updateAppointmentInDb,
  deleteAppointment as deleteAppointmentFromDb,
} from '../services/appointmentService'


function parseApptDate(appt) {
  if (!appt.date) return null
  const str = appt.time ? `${appt.date}T${appt.time}` : `${appt.date}T00:00`
  return new Date(str)
}

function isMissed(appt) {
  if (appt.status === 'done' || appt.status === 'cancelled') return false
  const date = parseApptDate(appt)
  if (!date) return false
  return date < new Date()
}

function isUpcoming(appt) {
  if (appt.status === 'done' || appt.status === 'cancelled') return false
  const date = parseApptDate(appt)
  if (!date) return false
  return date >= new Date()
}

function isTodayAppt(appt) {
  const date = parseApptDate(appt)
  if (!date) return false
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth()    === now.getMonth()    &&
    date.getDate()     === now.getDate()
  )
}

function isThisWeek(appt) {
  const date = parseApptDate(appt)
  if (!date) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setDate(now.getDate() + 7)
  return date >= now && date <= end
}


const AppointmentContext = createContext({
  allAppointments:  [],
  upcoming:         [],
  todayAppointments:[],
  missed:           [],
  recent:           [],
  missedCount:      0,
  upcomingThisWeek: 0,
  loading:          true,
  error:            null,
})

export function AppointmentProvider({ children }) {
  const { user } = useAuth()
  const [allAppointments, setAllAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setAllAppointments([])
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToAppointments(
      user.uid,
      (data) => { setAllAppointments(data); setLoading(false) },
      (err)  => { setError(err); setLoading(false) }
    )

    return unsubscribe
  }, [user])

  const addAppointment = useCallback(async (apptData) => {
    if (!user) return
    try {
      return await addAppointmentToDb(user.uid, apptData)
    } catch (err) {
      setError(err.message)
    }
  }, [user])

  const updateAppointment = useCallback(async (id, updates) => {
    if (!user) return
    try {
      await updateAppointmentInDb(user.uid, String(id), updates)
    } catch (err) {
      setError(err.message)
    }
  }, [user])

  const deleteAppointment = useCallback(async (id) => {
    if (!user) return
    try {
      await deleteAppointmentFromDb(user.uid, String(id))
    } catch (err) {
      setError(err.message)
    }
  }, [user])

  const getAppointment = useCallback((id) => {
    return allAppointments.find(a => String(a.id) === String(id)) ?? null
  }, [allAppointments])


  const upcoming = allAppointments
    .filter(isUpcoming)
    .sort((a, b) => (parseApptDate(a) ?? new Date(0)) - (parseApptDate(b) ?? new Date(0)))

  const todayAppointments = allAppointments
    .filter(isTodayAppt)
    .sort((a, b) => (parseApptDate(a) ?? new Date(0)) - (parseApptDate(b) ?? new Date(0)))

  const missed          = allAppointments.filter(isMissed)
  const missedCount     = missed.length
  const upcomingThisWeek = allAppointments.filter(a => isUpcoming(a) && isThisWeek(a)).length

  const recent = allAppointments
    .filter(a => {
      const date = parseApptDate(a)
      return a.status === 'done' || (date && date < new Date())
    })
    .sort((a, b) => (parseApptDate(b) ?? new Date(0)) - (parseApptDate(a) ?? new Date(0)))

  return (
    <AppointmentContext.Provider
      value={{
        allAppointments,
        upcoming,
        todayAppointments,
        missed,
        recent,
        missedCount,
        upcomingThisWeek,
        loading,
        error,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  )
}

export function useAppointments() {
  return useContext(AppointmentContext)
}