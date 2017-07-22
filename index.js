'use strict'

const url = require('url')
const path = require('path')

const { app, BrowserWindow } = require('electron')

let win = null

app.on('ready', () => {
  win = new BrowserWindow()
  win.webContents.openDevTools()
  win.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file'
  }))
})

app.on('window-all-closed', () => {
  console.info('close app')
})

app.on('before-quit', () => {
  console.info('save to file')
})
