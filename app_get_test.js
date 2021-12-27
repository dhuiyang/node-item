const express = require('express')
const app = express()
const port = 3001
const axios = require('axios');

let hotNewList = []; 

app.get('/', (req, res) => {
  res.send(hotNewList);
});
async function handleData(){
  const result = await axios('https://jsonmock.hackerrank.com/api/article_users?page=2');
  // console.log('hotNewList: ', result.data.data);
  hotNewList = result.data.data;
}
handleData()

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})