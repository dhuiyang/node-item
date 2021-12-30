/**
 * 1）单链表的插入、删除、查找操作；
 * 2）链表中存储的是int类型的数据；
 */
class Node {
  constructor(element) {
    this.element = element
    this.next = null
  }
}
// 根据value查找节点
class LinkedList {
  // 初始时带头节点
  constructor() {
    this.head = new Node('head');
  }

  findByValue(item) {
    let currentNode = this.head.next;
    while(currentNode !== null && currentNode.element !== item) {
      currentNode = currentNode.next;
    }
    console.log(currentNode);
    return currentNode === null ? -1 : currentNode;
  }

  findByIndex(index) {
    let currentNode = this.head.next;
    let pos = 0;
    while(currentNode !== null && pos !== index) {
      currentNode = currentNode.next;
      pos++;
    }
    console.log(currentNode);
    return currentNode === null ? -1 : currentNode;
  }
  
  append(newElement) {
    let currentNode = this.head;
    const newNode = new Node(newElement);
    while(currentNode.next) {
      currentNode = currentNode.next;
    }
    currentNode.next = newNode;
  }

  // 指定元素后面插入节点
  insert(newElement, element) {
    const currentNode = this.findByValue(element);
    if (currentNode === -1) {
      console.log('未找到插入位置');
      return;
    }
    const newNode = new Node(newElement);
    newNode.next = currentNode.next;
    currentNode.next = newNode;
  }

  // 查找前一个
  findPrev(item) {
    let currentNode = this.head;
    while(currentNode.next !== null && currentNode.next.element !== item) {
      currentNode = currentNode.next;
    }
    return currentNode.next === null ? -1 : currentNode;
  }

  remove(item) {
    let prevNode = this.findPrev(item);
    while (prevNode === -1) {
      console.log('未找到元素');
      return;
    }
    prevNode.next = prevNode.next.next;
  }

  // 遍历所有节点
  display() {
    let currentNode = this.head.next; // 忽略头指针的值
    while(currentNode !== null) {
      console.log(currentNode.element);
      currentNode = currentNode.next;
    }
  }
}

module.exports = LinkedList;