const express = require('express')
const fs = require('fs')
const puppeteer = require('puppeteer')
const utilities = require('./utilities')

const server = express()
const port = 3000

server.get('/', (req, res) => {
  // Read teh HTML file
  const htmlContent = fs.readFileSync('./index.html', { encoding: 'utf8' })
  // send it down to the client
  res.send(htmlContent)
})

server.get('/upload', (req, res) => {
  // TODO: validate excel file
  // read excel file
  // parse excel file form text to JSON objects
  const data = utilities.sheetsToArray('./data.xlsx')
  const massagedData = utilities.formatData(data)
  res.json(massagedData)
  // Generate HTML from data
  // Create PDFs from HTML
  // Add into one folder
  // ZIp folder
  // return folder as zip.






})

server.listen(port, () => console.log(`Server listening on port ${port}!`))
