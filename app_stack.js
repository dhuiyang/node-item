const express = require('express')
const app = express()
const port = 3001
const StackBaseLinkedList = require('./data-structures/stack');
const SampleBrowser = require('./data-structures/stack.test');

function creatStack() {
  const newStack = new StackBaseLinkedList;
  console.log('newStack: ', newStack);
  newStack.push(1);
  newStack.push(2);
  newStack.push(3);
  // 获取元素
  let res = 0;
  console.log('-------获取pop元素------');
  while (res !== -1) {
    res = newStack.pop();
    console.log(res);
  }
}

function handleBrowser() {
  const browser = new SampleBrowser();
  browser.pushNormal(1);
  browser.pushNormal(2);
  browser.pushNormal(3);
  browser.back();
  browser.back();
  browser.front();
  browser.back();
}

app.get('/creatStack', (req, res) => {
  res.send(creatStack());
});
app.get('/sampleBrowser', (req, res) => {
  res.send(handleBrowser());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})