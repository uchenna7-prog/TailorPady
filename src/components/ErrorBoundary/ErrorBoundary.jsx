import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    if (this.props.onReset) this.props.onReset()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback(this.handleReset)

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text)',
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Something went wrong loading this.</p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--bg)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
