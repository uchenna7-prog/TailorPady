import { useState, useRef } from "react"
import { getInitials } from "../../../../utils/nameUtils"
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../services/cloudinaryService"
import styles from "./EditCustomerModal.module.css"


export function EditCustomerModal({ customer, onSave, onClose }) {

  const [form, setForm] = useState({
    name:     customer.name     || '',
    phone:    customer.phone    || '',
    email:    customer.email    || '',
    address:  customer.address  || '',
    birthday: customer.birthday || '',
    sex:      customer.sex      || '',
    notes:    customer.notes    || '',
  })
  const [photoLocalSrc,  setPhotoLocalSrc]  = useState(customer.photo || null)
  const [photoFile,      setPhotoFile]      = useState(null)
  const [photoRemoved,   setPhotoRemoved]   = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoProgress,  setPhotoProgress]  = useState(0)
  const [saving,         setSaving]         = useState(false)

  const fileInputRef = useRef(null)

  const initials = getInitials(form.name) || '+'

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (photoFile && photoLocalSrc) URL.revokeObjectURL(photoLocalSrc)
    setPhotoFile(file)
    setPhotoLocalSrc(URL.createObjectURL(file))
    setPhotoRemoved(false)
  }

  function handleRemovePhoto(e) {
    e.stopPropagation()
    if (photoFile && photoLocalSrc) URL.revokeObjectURL(photoLocalSrc)
    setPhotoFile(null)
    setPhotoLocalSrc(null)
    setPhotoRemoved(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return

    setSaving(true)
    try {
      let photo         = customer.photo         ?? null
      let photoPublicId = customer.photoPublicId ?? null
      const previousPublicId = customer.photoPublicId ?? null

      if (photoFile) {
        setPhotoUploading(true)
        setPhotoProgress(0)
        const uploaded = await uploadToCloudinary(photoFile, 'customers', setPhotoProgress)
        photo         = uploaded.url
        photoPublicId = uploaded.publicId
        setPhotoUploading(false)
        setPhotoProgress(0)
        if (previousPublicId) deleteFromCloudinary(previousPublicId).catch(() => {})
      } else if (photoRemoved) {
        photo         = null
        photoPublicId = null
        if (previousPublicId) deleteFromCloudinary(previousPublicId).catch(() => {})
      }

      await onSave({ ...form, photo, photoPublicId })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalSheet}>
        <div className={styles.modalHeader}>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
          <span className={styles.modalTitle}>Edit Customer</span>
          <button
            className={styles.modalSaveBtn}
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.phone.trim()}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div className={styles.modalBody}>

          <div className={styles.photoPickerWrap}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                className={styles.photoPicker}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoLocalSrc
                  ? <img src={photoLocalSrc} alt={form.name} className={styles.photoPreview} />
                  : <span className={styles.photoInitials}>{initials}</span>
                }

                {photoUploading && (
                  <div className={styles.photoUploadOverlay}>
                    <span className={styles.photoUploadProgress}>{photoProgress}%</span>
                  </div>
                )}

                <div className={styles.camBadge}>
                  <span className="mi" style={{ fontSize: '0.85rem' }}>photo_camera</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </div>

              {photoLocalSrc && !photoUploading && (
                <button
                  type="button"
                  className={styles.photoRemoveBtn}
                  onClick={handleRemovePhoto}
                  title="Remove photo"
                >
                  <span className="mi" style={{ fontSize: '0.7rem' }}>close</span>
                </button>
              )}
            </div>
          </div>

          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Full Name *</label>
            <input className={styles.modalInput} value={form.name} onChange={set('name')} placeholder="Customer name" />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Phone Number *</label>
            <input className={styles.modalInput} value={form.phone} onChange={set('phone')} placeholder="Phone number" type="tel" />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Gender</label>
            <div className={styles.modalSexRow}>
              {['Male', 'Female'].map(option => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.modalSexChip} ${form.sex === option ? styles.modalSexChipActive : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, sex: prev.sex === option ? '' : option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Email Address</label>
            <input className={styles.modalInput} value={form.email} onChange={set('email')} placeholder="Email (optional)" type="email" />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Birthday</label>
            <input className={styles.modalInput} value={form.birthday} onChange={set('birthday')} placeholder="MM-DD" maxLength={5} />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Address</label>
            <input className={styles.modalInput} value={form.address} onChange={set('address')} placeholder="Address (optional)" />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Notes</label>
            <textarea className={`${styles.modalInput} ${styles.modalTextarea}`} value={form.notes} onChange={set('notes')} placeholder="Any additional notes…" rows={3} />
          </div>
        </div>
      </div>
    </div>
  )
}