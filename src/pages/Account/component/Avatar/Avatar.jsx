import styles from "./Avatar.module.css"


export function Avatar({ name, logo, size = 72 }) {

  const initials = name
    ? name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'
  if (logo) return(
    <img 
        src={logo} 
        alt="Avatar" 
        className={styles.avatarImg} 
        style={{ width: size, height: size }} 
    />
    ) 

    return (
    <div 
        className={styles.avatarInitials} 
        style={{ width: size, height: size, fontSize: size * 0.35 }}
        >{initials}
    </div>

  )


}