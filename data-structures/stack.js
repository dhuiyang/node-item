class Node {
  constructor(ele) {
    this.ele = ele;
    // 指向元素的下一个元素
    this.next = null;
  }
}

class StackBaseLinkList {
  constructor() {
    // 栈顶元素
    this.top = null;
  }

  push(value) {
    const node = new Node(value);
    if (this.top === null) {
      this.top = node;
    } else {
      node.next = this.top;
      this.top = node;
    }
  }

  pop() {
    if (this.top === null) {
      return -1;
    }
    const value = this.top.ele;
    this.top = this.top.next;
    return value;
  }
  clear() {
    this.top = null;
  }
  
  display() {
    if (this.top !== null) {
      let temp = this.top;
      while (temp !== null) {
        console.log(temp);
        temp = temp.next;
      }
    }
  }
}

  module.exports = StackBaseLinkList;