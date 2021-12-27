const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');



// app.get('/', (req, res) => {
//   res.send('hotNewList');
// });

app.use(express.static('public'))



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})