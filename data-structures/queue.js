class Node {
  constructor(ele) {
    this.ele = ele;
    this.next = null;
  }
}

class QueueBaseLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  enqueue(value) {
    if (this.head === null) {
      this.head = new Node(value);
      this.tail = this.head;
    } else {
      this.tail.next = new Node(value);
      this.tail = this.tail.next;
    }
  }

  dequeue() {
    if (this.head !== null) {
      const value = this.head.ele;
      this.head = this.head.next;
      return value;
    } else {
      return -1;
    }
  }
}

module.exports = QueueBaseLinkedList;
