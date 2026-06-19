import { RichText } from "../../../Agent/components/RichText/RichText"
import { MIcon } from "../../../Agent/components/MIcon/MIcon"
import styles from "./ChatMessage.module.css"


export function ChatMessage({ msg, onAction, onNavigate }) {
  const isAgent = msg.role === 'agent'
  return (
    <div className={`${styles.msgRow} ${isAgent ? styles.msgRowAgent : styles.msgRowUser}`}>
      {isAgent && (
        <div className={styles.agentAvatarSm}>
          <MIcon name="smart_toy" size="0.75rem" />
        </div>
      )}
      <div className={styles.msgContent}>
        <div className={`${styles.bubble} ${isAgent ? styles.bubbleAgent : styles.bubbleUser}`}>
          <RichText text={msg.text} />
        </div>
        {isAgent && msg.actions?.length > 0 && (
          <div className={styles.msgActions}>
            {msg.actions.map((action, i) => (
              <button
                key={i}
                className={`${styles.msgActionBtn} ${action.action === 'cancel' ? styles.msgActionBtnGhost : ''}`}
                onClick={() => {
                  haptic('light')
                  if (action.action === 'navigate') onNavigate(action.payload.route)
                  else onAction(action.action, action.payload)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className={`${styles.msgTime} ${isAgent ? '' : styles.msgTimeUser}`}>
          {msg.time}
        </div>
      </div>
    </div>
  )
}
