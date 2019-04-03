const express = require('express')
const fs = require('fs')
const server = express()
const port = 3000

server.get('/', (req, res) => {
  // Read teh HTML file
  const htmlContent = fs.readFileSync('./index.html', { encoding: 'utf8'})
  // send it down to the client
  res.send(htmlContent)
})

server.listen(port, () => console.log(`Server listening on port ${port}!`))
