import React, { Component, StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

function MissingAuthConfig() {
  return (
    <div className="auth-shell">
      <h1>Auth0 configuration missing</h1>
      <p>
        Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env, then restart
        the dev server.
      </p>
    </div>
  )
}

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-shell">
          <h1>App failed to load</h1>
          <p>{this.state.message}</p>
          <p>Hard refresh and restart dev server, then try again.</p>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      {domain && clientId ? (
        <Auth0Provider
          domain={domain}
          clientId={clientId}
          authorizationParams={{
            redirect_uri: window.location.origin
          }}
        >
          <App />
        </Auth0Provider>
      ) : (
        <MissingAuthConfig />
      )}
    </RootErrorBoundary>
  </StrictMode>,
)