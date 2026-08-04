import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import App from '@/App.jsx'
import '@/index.css'

Amplify.configure(outputs)

// SCRY is designed as a dark cosmic app. Do not depend on the device's
// light/dark preference, because light mode makes the dark UI look like an
// empty frame with low-contrast text.
const applyTheme = () => {
  document.documentElement.classList.add('dark');
};
applyTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
