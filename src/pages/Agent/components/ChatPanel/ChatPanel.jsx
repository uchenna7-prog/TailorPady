import { useRef,useEffect } from 'react'
import { MIcon } from '../MIcon/MIcon'
import {ChatMessage} from '../ChatMessage/ChatMessage'
import {TypingIndicator} from '../TypingIndicator/TypingIndicator'
import { SUGGESTION_CHIPS } from '../../datas'
import styles from './ChatPanel.module.css'

export function ChatPanel({
  open,
  onClose,
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
  const inputRef       = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, open])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  function handleChipTap(prompt) {
    haptic('light')
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  const FLOW_LABELS = {
    add_order:      'Adding order',
    gen_invoice:    'Creating invoice',
    record_payment: 'Recording payment',
    add_task:       'Adding task',
    add_appt:       'Booking appointment',
  }

  const showChips = !activeFlow && messages.length === 0 && !isLoading

  return (
    <>
      {open && <div className={styles.chatBackdrop} onClick={onClose} />}

      <div className={`${styles.chatPanel} ${open ? styles.chatPanelOpen : ''}`}>
        <div className={styles.chatPanelHeader}>
          <div>
            <p className={styles.chatPanelTitle}>Assistant</p>
            <p className={styles.chatPanelSub}>Ask anything about your business</p>
          </div>
          <button className={styles.chatCloseBtn} onClick={onClose}>
            <MIcon name="close" size="1.1rem" color="var(--text2)" />
          </button>
        </div>

        {activeFlow && (
          <div className={styles.chatFlowBar}>
            <MIcon name="pending" size="0.75rem" color="var(--accent)" />
            <span className={styles.chatFlowLabel}>
              {FLOW_LABELS[activeFlow.name] || 'In progress'}
            </span>
            <button className={styles.chatFlowCancel} onClick={() => { haptic('light'); onCancelFlow() }}>
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
                <MIcon name="smart_toy" size="1.4rem" color="var(--bg)" />
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
            <MIcon name="smart_toy" size="0.9rem" color="var(--text3)" />
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
    </>
  )
}