const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');
const cheerio = require('cheerio');
const superagent = require('superagent');

let hotNewList = []; 

app.get('/', (req, res) => {
  res.send(hotNewList);
});

function getHotNews(res) {
  let hotNews = [];
  const $ = cheerio.load(res);
  $('div#pane-news ul li a').each((i, elem) => {
    // console.log(i, $(elem).text());
    // console.log('-->', $(elem).attr('href'));
    let obj = {
      title: $(elem).text(),
      link: $(elem).attr('href'),
    };
    hotNews.push(obj);
  })
  return hotNews;
}

superagent.get('http://news.baidu.com/').end((err, res) => {
  if(err) {
    console.log('报错了', err);
    return;
  }
  hotNewList = getHotNews(res.text);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})