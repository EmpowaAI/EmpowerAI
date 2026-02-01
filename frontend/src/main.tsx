import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

console.log('React app starting...')

const rootElement = document.getElementById("root")

if (!rootElement) {
  console.error('Root element not found!')
  document.body.innerHTML = '<h1 style="padding: 2rem; color: red;">Error: Root element not found</h1>'
} else {
  console.log('Root element found, rendering app...')
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
    console.log('App rendered successfully')
  } catch (error) {
    console.error('Error rendering app:', error)
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: white;">
        <h1 style="color: red; font-size: 2rem;">Error rendering app</h1>
        <p style="color: #666; margin-top: 1rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre style="background: #f5f5f5; padding: 1rem; margin-top: 1rem; text-align: left; overflow: auto;">
          ${error instanceof Error ? error.stack : String(error)}
        </pre>
      </div>
    `
  }
}
