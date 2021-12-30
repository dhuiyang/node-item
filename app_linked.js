const express = require('express')
const app = express()
const port = 3001
const LinkedList = require('./data-structures/linked');

function linkedTest() {
  const LList = new LinkedList()
  LList.append('chen')
  LList.append('curry')
  LList.append('sang')
  LList.append('zhao') // chen -> curry -> sang -> zhao
  console.log('-------------insert item------------')
  LList.insert('qian', 'chen') // 首元素后插入
  LList.insert('zhou', 'zhao') // 尾元素后插入
  LList.display() // chen -> qian -> curry -> sang -> zhao -> zhou
  console.log('-------------remove item------------')
  LList.remove('curry')
  LList.display() // chen -> qian -> sang -> zhao -> zhou
  console.log('-------------find by item------------')
  LList.findByValue('chen')
  console.log('-------------find by index------------')
  LList.findByIndex(2)
  console.log('-------------与头结点同值元素测试------------')
  LList.insert('head', 'sang')
  LList.display() // chen -> qian -> sang -> head -> zhao -> zhou
  LList.findPrev('head') // sang
  LList.remove('head')
  LList.display() // chen -> qian -> sang -> zhao -> zhou
}


app.get('/linkedTest', (req, res) => {
  res.send(linkedTest());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})