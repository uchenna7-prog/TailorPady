import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { useAgent } from '../../contexts/AgentContext'
import { useAutonomousAgent } from '../../contexts/AutonomousAgentContext'
import { useAuth } from '../../contexts/AuthContext'
import { ChatPanel } from './components/ChatPanel/ChatPanel'
import { getGreeting, haptic } from './utils'
import { AgentTitleIcon } from './components/AgentTitleIcon/AgentTitleIcon'
import styles from './AgentChat.module.css'

function AgentChat() {
  const navigate = useNavigate()

  const { messages, isTyping, isLoading, activeFlow, sendMessage, handleAction, cancelFlow } = useAgent()
  const { enabled } = useAutonomousAgent()
  const { user }    = useAuth()

  const [inputValue, setInputValue] = useState('')
  const [greeting]                  = useState(() => {
    const firstName = user?.displayName?.split(' ')[0] || ''
    return getGreeting(firstName)
  })

  function handleSend() {
    const v = inputValue.trim()
    if (!v) return
    haptic('light')
    setInputValue('')
    sendMessage(v)
  }

  function routeAction(action, payload) {
    if (action === 'navigate') { navigate(payload.route); return }
    handleAction(action, payload)
  }

  return (
    <div className={styles.pageWrapper}>
      <Header
        type="back"
        customTitle={{ iconComponent: AgentTitleIcon, title: 'Pady' }}
        onBackClick={() => navigate('/agent')}
        agentActive={enabled}
      />
      <ChatPanel
        messages={messages}
        isTyping={isTyping}
        isLoading={isLoading}
        activeFlow={activeFlow}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onAction={routeAction}
        onNavigate={navigate}
        onCancelFlow={cancelFlow}
        greeting={greeting}
      />
    </div>
  )
}

export default AgentChat
