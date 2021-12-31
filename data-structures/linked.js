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

  // 反转单链表
  reverseList() {
    const root = new Node('head')
    let currentNode = this.head.next;
    while (currentNode !== null) {
      const next = currentNode.next;
      currentNode.next = root.next;
      root.next = currentNode;
      currentNode = next;
    }
    this.head = root;
  }

  // 环验证
  checkCircle() {
    let fast = this.head.next;
    let slow = this.head;
    while(fast !== null && fast.next !== null) {
      fast = fast.next.next;
      slow = slow.next;
      if(slow === fast) {
        return true;
      }
    }
    return false;
  }

  // 删除倒数第k个节点
  removeByIndexFromEnd(index) {
    //务必先判断是否是 环链表
    if (this.checkCircle()) return false;
    let pos = 1;
    // 先反转链表
    this.reverseList();
    let currentNode = this.head.next;
    while (currentNode !== null && pos < index) {
      currentNode = currentNode.next;
      pos++;
    }
    if (currentNode === null) {
      console.log('无法删除最后一个节点或者该节点不存在')
      return false;
    }
    this.remove(currentNode.element);
    // 链表反转回来
    this.reverseList()
  }

  // 求中间节点
  findMiddleNode() {
    // 快慢指针同一个起点，快指针走完刚好慢指针走到一半
    let fast = this.head;
    let slow = this.head;
    while (fast.next !== null && fast.next.next !== null) {
      fast = fast.next.next;
      slow = slow.next;
    }
    console.log(slow);
    return slow;
  }
}

module.exports = LinkedList;