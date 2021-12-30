const express = require('express')
const app = express()
const port = 3001
const QueueBaseLinkedList = require('./data-structures/queue');
const CircularQueue = require('./data-structures/queue.test');

function creatQueue() {
  const newQueue = new QueueBaseLinkedList();
  console.log('newQueue: ', newQueue);
  newQueue.enqueue(1);
  newQueue.enqueue(2);
  newQueue.enqueue(3);
  // 获取元素
  let res = 0;
  console.log('-------获取dequeue------');
  while (res !== -1) {
    res = newQueue.dequeue();
    console.log(res);
  }
}

function circularQueue() {
  const newCircularQueue = new CircularQueue()
  // 插入元素
  newCircularQueue.enqueue(1);
  newCircularQueue.enqueue(2);
  newCircularQueue.enqueue(3);
  // 获取元素
  newCircularQueue.display();
  newCircularQueue.enqueue(1);
  newCircularQueue.display();
}

app.get('/creatQueue', (req, res) => {
  res.send(creatQueue());
});
app.get('/circularQueue', (req, res) => {
  res.send(circularQueue());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})