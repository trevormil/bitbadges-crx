import React from 'react'
import ReactDOM from 'react-dom/client'
import { Popup } from './Popup'

import '../styles/globals.css'
import '../styles/index.css'
import '../styles/antd-override-styles.css'

BigInt.prototype.toJSON = function () {
  return this.toString()
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)
