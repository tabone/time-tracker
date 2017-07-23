'use strict'

const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, Tray } = require('electron')

/**
 * Main Browser Window.
 * @type {Object}
 */
let win = null

/**
 * App tray
 * @type {Object}
 */
let tray = null

app.on('ready', () => {
  // Initialize main Browser Window.
  win = new BrowserWindow()

  // Hide main Browser Window instead of closing it when user tries to close it.
  win.on('close', ev => {
    ev.preventDefault()
    win.hide()
  })

  // Load HTML File.
  win.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file'
  }))

  win.webContents.openDevTools()

  // Intialize tray instance.
  tray = new Tray('icon.png')

  // Create the context menu of the Tray instance.
  const contextMenu = Menu.buildFromTemplate([
    // Menu item to show the main Browser Window.
    { label: 'Open', type: 'normal', click: () => win.show() },
    // Menu Item to exit the app.
    { label: 'Quit', type: 'normal', click: () => app.exit(0) }
  ])

  // Setup tray.
  tray.setToolTip('Time Tracker')
  tray.setContextMenu(contextMenu)
})
