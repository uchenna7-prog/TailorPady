import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header    from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import InvoiceViewer from '../../components/InvoiceViewer/InvoiceViewer'
import ReceiptViewer from '../../components/ReceiptViewer/ReceiptViewer'
import { useAgent }           from '../../contexts/AgentContext'
import { useAutonomousAgent } from '../../contexts/AgentContext'
import { useOrders }          from '../../contexts/OrdersContext'
import { useInvoices }        from '../../contexts/InvoiceContext'
import { useCustomers }       from '../../contexts/CustomerContext'
import { useAuth }            from '../../contexts/AuthContext'
import styles from './Agent.module.css'

function BotIcon() {
  return <span className="mi">smart_toy</span>
}

const ICON_META = {
  invoice:  { icon: 'receipt_long',           color: 'var(--accent)'  },
  receipt:  { icon: 'payments',               color: '#22c55e'        },
  message:  { icon: 'chat_bubble',            color: '#3b82f6'        },
  reminder: { icon: 'notification_important', color: 'var(--accent)'  },
  brief:    { icon: 'summarize',              color: 'var(--text2)'   },
  flag:     { icon: 'flag',                   color: 'var(--accent)'  },
  pickup:   { icon: 'storefront',             color: '#a855f7'        },
  birthday: { icon: 'cake',                   color: '#ec4899'        },
  followup: { icon: 'person_search',          color: '#3b82f6'        },
}

const TAG_COLORS = {
  Invoice:     { bg: 'rgba(255,149,0,0.12)',   color: 'var(--accent)'  },
  Receipt:     { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e'        },
  Message:     { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6'        },
  Reminder:    { bg: 'rgba(255,149,0,0.12)',   color: 'var(--accent)'  },
  Brief:       { bg: 'rgba(120,120,128,0.15)', color: 'var(--text2)'   },
  Flag:        { bg: 'rgba(255,149,0,0.12)',   color: 'var(--accent)'  },
  'Follow-up': { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6'        },
  Birthday:    { bg: 'rgba(236,72,153,0.12)',  color: '#ec4899'        },
}

const SUGGESTION_CHIPS = [
  { label: 'Add order',        prompt: 'Add an order for '         },
  { label: 'Record payment',   prompt: 'just paid ₦'               },
  { label: "Who owes me?",     prompt: 'How much does  owe?'       },
  { label: 'Add task',         prompt: 'Remind me to '             },
  { label: 'Book appointment', prompt: 'Schedule a fitting for '   },
  { label: "Today's summary",  prompt: "What's happening today?"   },
]

function getGreeting(name) {
  const h = new Date().getHours()
  const salutation =
    h < 12 ? 'Good morning' :
    h < 17 ? 'Good afternoon' :
              'Good evening'
  return `${salutation}${name ? `, ${name}` : ''}! 👋`
}

function haptic(type = 'light') {
  if (!navigator.vibrate) return
  if (type === 'light')  navigator.vibrate(10)
  if (type === 'medium') navigator.vibrate(20)
}

function MIcon({ name, size = '1.1rem', color }) {
  return (
    <span
      className="mi"
      style={{ fontSize: size, color: color || 'inherit', lineHeight: 1, display: 'flex', alignItems: 'center' }}
    >
      {name}
    </span>
  )
}

function RichText({ text }) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))
      })}
    </>
  )
}

function TagChip({ label }) {
  const c = TAG_COLORS[label] || TAG_COLORS.Message
  return (
    <span className={styles.tag} style={{ background: c.bg, color: c.color }}>
      {label}
    </span>
  )
}

function DoneTab({ items }) {
  const [expanded, setExpanded] = useState(null)

  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="check_circle" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>Nothing done yet today</p>
      <p className={styles.emptyTabSub}>The agent will log its actions here as it works</p>
    </div>
  )

  return (
    <div className={styles.tabList}>
      {items.map(item => {
        const meta   = ICON_META[item.type] || ICON_META.brief
        const isOpen = expanded === item.id
        return (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardIconWrap}>
              <MIcon name={meta.icon} size="1.05rem" color={meta.color} />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardTime}>{item.time}</span>
              </div>
              <p className={styles.cardDesc}>{item.desc}</p>
              <button
                className={styles.whyToggle}
                onClick={() => setExpanded(isOpen ? null : item.id)}
              >
                <MIcon name={isOpen ? 'expand_less' : 'expand_more'} size="0.85rem" color="var(--text3)" />
                <span>{isOpen ? 'Hide reason' : 'Why did the agent do this?'}</span>
              </button>
              {isOpen && (
                <div className={styles.whyBox}>
                  <MIcon name="info" size="0.8rem" color="var(--text3)" />
                  <p className={styles.whyText}>{item.reason}</p>
                </div>
              )}
              <TagChip label={item.tag} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UpcomingTab({ items, onCancel }) {
  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="schedule" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>Nothing scheduled</p>
      <p className={styles.emptyTabSub}>Upcoming agent actions will appear here</p>
    </div>
  )

  return (
    <div className={styles.tabList}>
      {items.map(item => {
        const meta = ICON_META[item.type] || ICON_META.brief
        return (
          <div key={item.id} className={`${styles.card} ${styles.cardDashed}`}>
            <div className={styles.cardIconWrap}>
              <MIcon name={meta.icon} size="1.05rem" color={meta.color} />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={`${styles.cardTime} ${styles.cardTimeAccent}`}>{item.when}</span>
              </div>
              <p className={styles.cardDesc}>{item.desc}</p>
              <div className={styles.cardFooterRow}>
                <TagChip label={item.tag} />
                <button
                  className={styles.cancelBtn}
                  onClick={() => { haptic('light'); onCancel(item.id) }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DraftsTab({ items, onDiscard, allOrders, allInvoices, customers, navigate, showToast }) {
  const [expanded,      setExpanded]      = useState(null)
  const [copied,        setCopied]        = useState(null)
  const [viewerInvoice, setViewerInvoice] = useState(null)
  const [viewerReceipt, setViewerReceipt] = useState(null)

  function getOrderIdFromDraftId(draftId) {
    return draftId?.replace('draft-invoice-', '') || null
  }

  function getInvoiceIdFromDraftId(draftId) {
    return draftId?.replace('draft-receipt-', '') || null
  }

  function getInvoiceForDraft(item) {
    const orderId  = getOrderIdFromDraftId(item.id)
    if (!orderId) return null

    const existing = allInvoices.find(inv => String(inv.orderId) === String(orderId))
    if (existing) return existing

    const order = allOrders.find(o => String(o.id) === String(orderId))
    if (!order) return null

    return {
      id:             `preview-${order.id}`,
      orderId:        order.id,
      number:         'DRAFT',
      date:           new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status:         'unpaid',
      template:       'invoiceTemplate1',
      orderDesc:      order.desc,
      price:          order.price,
      qty:            order.qty,
      items:          Array.isArray(order.items) ? order.items : [],
      due:            order.due,
      notes:          order.notes || '',
      shippingFee:    order.shippingFee   ?? 0,
      discountType:   order.discountType  ?? null,
      discountValue:  order.discountValue ?? 0,
      discountAmount: order.discountAmount ?? 0,
      taxRate:        order.taxRate       ?? 0,
      taxAmount:      order.taxAmount     ?? 0,
      totalAmount:    order.totalAmount   ?? order.price ?? 0,
      brandSnapshot:  null,
    }
  }

  function getReceiptForDraft(item) {
    const invoiceId = getInvoiceIdFromDraftId(item.id)
    if (!invoiceId) return null

    const invoice = allInvoices.find(inv => String(inv.id) === String(invoiceId))
    if (!invoice) return null

    return {
      id:                   `preview-receipt-${invoice.id}`,
      paymentId:            null,
      orderId:              invoice.orderId,
      orderDesc:            invoice.orderDesc || invoice.desc,
      orderPrice:           invoice.totalAmount || invoice.price,
      items:                invoice.items || [],
      number:               'DRAFT',
      date:                 new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      template:             'receiptTemplate1',
      payments:             [],
      previousInstallments: [],
      previousPaid:         0,
      cumulativePaid:       invoice.totalAmount || invoice.price || 0,
      isFullPayment:        true,
      balance:              0,
      notes:                '',
      shippingFee:          invoice.shippingFee   ?? 0,
      discountType:         invoice.discountType  ?? null,
      discountValue:        invoice.discountValue ?? 0,
      discountAmount:       invoice.discountAmount ?? 0,
      taxRate:              invoice.taxRate        ?? 0,
      taxAmount:            invoice.taxAmount      ?? 0,
      totalAmount:          invoice.totalAmount    ?? invoice.price ?? 0,
      brandSnapshot:        invoice.brandSnapshot  || null,
    }
  }

  function getCustomerForDraft(item) {
    if (item.type === 'invoice') {
      const orderId  = getOrderIdFromDraftId(item.id)
      const order    = allOrders.find(o => String(o.id) === String(orderId))
      if (!order) return null
      return customers.find(c => String(c.id) === String(order.customerId)) || null
    }
    if (item.type === 'receipt') {
      const invoiceId = getInvoiceIdFromDraftId(item.id)
      const invoice   = allInvoices.find(inv => String(inv.id) === String(invoiceId))
      if (!invoice) return null
      return customers.find(c => String(c.id) === String(invoice.customerId)) || null
    }
    return null
  }

  function handleCopyBreakdown(item) {
    navigator.clipboard?.writeText(item.preview).catch(() => {})
    setCopied(item.id)
    haptic('light')
    setTimeout(() => setCopied(null), 2000)
  }

  function handleViewInvoice(item) {
    haptic('light')
    const invoice  = getInvoiceForDraft(item)
    const customer = getCustomerForDraft(item)
    if (!invoice || !customer) { showToast?.('Could not load invoice data'); return }
    setViewerInvoice({ invoice, customer })
  }

  function handleViewReceipt(item) {
    haptic('light')
    const receipt  = getReceiptForDraft(item)
    const customer = getCustomerForDraft(item)
    if (!receipt || !customer) { showToast?.('Could not load receipt data'); return }
    setViewerReceipt({ receipt, customer })
  }

  function handleSendBreakdown(item) {
    haptic('medium')
    navigator.clipboard?.writeText(item.preview).catch(() => {})
    showToast?.('Breakdown copied — opening customer profile')
    const customer = getCustomerForDraft(item)
    navigate(customer ? `/customers/${customer.id}` : '/customers')
  }

  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="edit_note" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>No drafts yet</p>
      <p className={styles.emptyTabSub}>Messages and documents the agent prepares will appear here</p>
    </div>
  )

  const isDocDraft = (item) => item.type === 'invoice' || item.type === 'receipt'

  return (
    <>
      {viewerInvoice && (
        <InvoiceViewer
          invoice={viewerInvoice.invoice}
          customer={viewerInvoice.customer}
          onClose={() => setViewerInvoice(null)}
          onDelete={() => {
            setViewerInvoice(null)
            showToast?.('To delete, go to the customer profile')
          }}
          showToast={showToast}
        />
      )}

      {viewerReceipt && (
        <ReceiptViewer
          receipt={viewerReceipt.receipt}
          customer={viewerReceipt.customer}
          onClose={() => setViewerReceipt(null)}
          onDelete={() => {
            setViewerReceipt(null)
            showToast?.('To delete, go to the customer profile')
          }}
          showToast={showToast}
        />
      )}

      <div className={styles.tabList}>
        <div className={styles.draftsNote}>
          <MIcon name="info" size="0.85rem" color="var(--text3)" />
          <p>The agent never sends anything. Copy a draft and send it yourself.</p>
        </div>

        {items.map(item => {
          const meta   = ICON_META[item.type] || ICON_META.message
          const isOpen = expanded === item.id

          return (
            <div
              key={item.id}
              className={styles.card}
              style={{ cursor: 'pointer' }}
              onClick={() => setExpanded(isOpen ? null : item.id)}
            >
              <div className={styles.cardIconWrap}>
                <MIcon name={meta.icon} size="1.05rem" color={meta.color} />
              </div>

              <div className={styles.cardBody} style={{ width: '100%' }}>
                <div className={styles.cardTop}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <MIcon name="expand_more" size="1rem" color="var(--text3)" />
                </div>

                <div style={{ marginTop: 4, marginBottom: isOpen ? 0 : 2 }}>
                  <TagChip label={item.tag} />
                </div>

                {isOpen && (
                  <div
                    className={styles.draftExpanded}
                    onClick={e => e.stopPropagation()}
                  >
                    <p className={styles.draftText}>{item.preview}</p>

                    {isDocDraft(item) ? (
                      <>
                        <div className={styles.draftBtns}>
                          <button
                            className={styles.copyBtn}
                            onClick={() => handleCopyBreakdown(item)}
                          >
                            <MIcon
                              name={copied === item.id ? 'check' : 'content_copy'}
                              size="0.85rem"
                              color="var(--bg)"
                            />
                            {copied === item.id ? 'Copied!' : 'Copy breakdown'}
                          </button>

                          <button
                            className={styles.viewDocBtn}
                            onClick={() =>
                              item.type === 'invoice'
                                ? handleViewInvoice(item)
                                : handleViewReceipt(item)
                            }
                          >
                            <MIcon name="open_in_new" size="0.85rem" color="var(--text1)" />
                            {item.type === 'invoice' ? 'View invoice' : 'View receipt'}
                          </button>
                        </div>

                        <div className={styles.draftBtnsSecondary}>
                          <button
                            className={styles.sendBreakdownBtn}
                            onClick={() => handleSendBreakdown(item)}
                          >
                            <MIcon name="send" size="0.8rem" color="var(--accent)" />
                            Send breakdown message
                          </button>

                          <button
                            className={styles.discardBtn}
                            onClick={() => { haptic('light'); onDiscard(item.id) }}
                          >
                            Discard
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={styles.draftBtns}>
                        <button
                          className={styles.copyBtn}
                          onClick={() => handleCopyBreakdown(item)}
                        >
                          <MIcon
                            name={copied === item.id ? 'check' : 'content_copy'}
                            size="0.85rem"
                            color="var(--bg)"
                          />
                          {copied === item.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          className={styles.discardBtn}
                          onClick={() => { haptic('light'); onDiscard(item.id) }}
                        >
                          Discard
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function TypingIndicator() {
  return (
    <div className={styles.typingWrap}>
      <div className={styles.agentAvatarSm}>
        <MIcon name="smart_toy" size="0.75rem" />
      </div>
      <div className={styles.typingBubble}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  )
}

function ChatMessage({ msg, onAction, onNavigate }) {
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

function ChatPanel({ open, onClose, messages, isTyping, isLoading, activeFlow, inputValue, setInputValue, onSend, onAction, onNavigate, onCancelFlow, greeting }) {
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
            <p className={styles.chatPanelTitle}>Agent</p>
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

function Agent({ onMenuClick }) {
  const navigate = useNavigate()

  const {
    messages,
    isTyping,
    isLoading,
    activeFlow,
    sendMessage,
    handleAction,
    cancelFlow,
  } = useAgent()

  const {
    enabled,
    doneTasks,
    upcomingTasks,
    drafts,
    cancelUpcoming,
    discardDraft,
  } = useAutonomousAgent()

  const { allOrders }   = useOrders()
  const { allInvoices } = useInvoices()
  const { customers }   = useCustomers()
  const { user }        = useAuth()

  const [tab,        setTab]        = useState('done')
  const [chatOpen,   setChatOpen]   = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [toast,      setToast]      = useState(null)
  const [greeting]                  = useState(() => {
    const firstName = user?.displayName?.split(' ')[0] || ''
    return getGreeting(firstName)
  })

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSend() {
    const v = inputValue.trim()
    if (!v) return
    haptic('light')
    setInputValue('')
    sendMessage(v)
  }

  const handleActionBtn = useCallback((action, payload) => {
    if (action === 'navigate') { navigate(payload.route); return }
    handleAction(action, payload)
  }, [handleAction, navigate])

  const TABS = [
    { key: 'done',     label: 'Done'                         },
    { key: 'upcoming', label: 'Upcoming'                     },
    { key: 'drafts',   label: 'Drafts', badge: drafts.length },
  ]

  return (
    <div className={styles.pageWrapper}>

      <Header
        type="back"
        customTitle={{ iconComponent: BotIcon, title: 'Agent' }}
        onBackClick={() => navigate('/')}
        agentActive={enabled}
        customActions={[
          {
            icon: 'chat',
            onClick: () => { haptic('light'); setChatOpen(true) },
            color: 'var(--text)',
          },
        ]}
      />

      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => { haptic('light'); setTab(t.key) }}
          >
            {t.label}
            {t.badge > 0 && (
              <span className={styles.tabBadge}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 'done'     && <DoneTab     items={doneTasks}     />}
        {tab === 'upcoming' && <UpcomingTab items={upcomingTasks} onCancel={cancelUpcoming} />}
        {tab === 'drafts'   && (
          <DraftsTab
            items={drafts}
            onDiscard={discardDraft}
            allOrders={allOrders}
            allInvoices={allInvoices}
            customers={customers}
            navigate={navigate}
            showToast={showToast}
          />
        )}
      </div>

      {toast && (
        <div className={styles.toast}>
          {toast}
        </div>
      )}

      <BottomNav />

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        isTyping={isTyping}
        isLoading={isLoading}
        activeFlow={activeFlow}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onAction={handleActionBtn}
        onNavigate={navigate}
        onCancelFlow={cancelFlow}
        greeting={greeting}
      />

    </div>
  )
}

export default Agent