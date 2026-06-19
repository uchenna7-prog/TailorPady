import { useRef, useEffect } from 'react'
import { MIcon } from '../MIcon/MIcon'
import { ChatMessage } from '../ChatMessage/ChatMessage'
import { TypingIndicator } from '../TypingIndicator/TypingIndicator'
import { haptic } from '../../utils'
import { BotIcon } from '../../../../components/BotIcon/BotIcon'
import styles from './ChatPanel.module.css'


export const SUGGESTION_CHIPS = [
  { label: 'Add order',        prompt: 'Add an order for '       },
  { label: 'Record payment',   prompt: 'just paid ₦'             },
  { label: "Who owes me?",     prompt: 'How much does  owe?'     },
  { label: 'Add task',         prompt: 'Remind me to '           },
  { label: 'Book appointment', prompt: 'Schedule a fitting for ' },
  { label: "Today's summary",  prompt: "What's happening today?" },
]

const FLOW_LABELS = {
  add_order: 'Adding order',
  gen_invoice: 'Creating invoice',
  record_payment: 'Recording payment',
  add_task: 'Adding task',
  add_appt: 'Booking appointment',
}

export function ChatPanel({
  messages,
  isTyping,
  isLoading,
  activeFlow,
  inputValue,
  setInputValue,
  onSend,
  onAction,
  onNavigate,
  onCancelFlow,
  greeting,
}) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  function handleChipTap(prompt) {
    haptic('light')
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  const showChips = !activeFlow && messages.length === 0 && !isLoading

  return (
    <div className={styles.chatPanel}>
      {activeFlow && (
        <div className={styles.chatFlowBar}>
          <MIcon name="pending" size="0.75rem" color="var(--accent)" />
          <span className={styles.chatFlowLabel}>
            {FLOW_LABELS[activeFlow.name] || 'In progress'}
          </span>
          <button
            className={styles.chatFlowCancel}
            onClick={() => { haptic('light'); onCancelFlow() }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className={styles.chatMessages}>
        {isLoading && (
          <div className={styles.chatLoadingWrap}>
            <div className={styles.loadingDots}><span /><span /><span /></div>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className={styles.chatEmpty}>
            <div className={styles.chatEmptyAvatar}>
              <BotIcon  size={"1.7rem"} color={"var(--bg)"} backgroundColor={"var(--accent)"} />
            </div>
            <p className={styles.chatEmptyGreeting}>{greeting}</p>
            <p className={styles.chatEmptySub}>I'm your shop assistant.</p>
          </div>
        )}

        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            msg={msg}
            onAction={onAction}
            onNavigate={onNavigate}
          />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInputRow}>
        {showChips && (
          <div className={styles.chipsRow}>
            {SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip.label}
                className={styles.chip}
                onClick={() => handleChipTap(chip.prompt)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.chatInputWrap}>
          <BotIcon size={"1.5rem"} color={"var(--text3)"} />
          <textarea
            ref={inputRef}
            className={styles.chatInputField}
            placeholder={activeFlow ? 'Type your answer...' : 'Message...'}
            value={inputValue}
            rows={1}
            onChange={e => {
              setInputValue(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`${styles.chatSendBtn} ${inputValue.trim() ? styles.chatSendBtnActive : ''}`}
            onClick={onSend}
            disabled={!inputValue.trim()}
          >
            <MIcon name="arrow_upward" size="0.85rem" color="var(--bg)" />
          </button>
        </div>
      </div>
    </div>
  )
}