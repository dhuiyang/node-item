const StackBaseLinkList = require('./stack');

// 简单实现浏览器前进和后退功能
class SampleBrowser {
  constructor() {
    this.stackA = new StackBaseLinkList();
    this.stackB = new StackBaseLinkList();
  }
  pushNormal(name) {
    this.stackA.push(name);
    this.stackB.clear();
  }

  front() {
    const value = this.stackB.pop();
    if (value !== -1) {
      this.stackA.push(value);
      this.displayAllStack()
    } else {
      console.log('无法后退');
    }
  }

  back() {
    const value = this.stackA.pop();
    if (value !== -1) {
      this.stackB.push(value);
      this.displayAllStack()
    } else {
      console.log('无法后退');
    }
  }

  displayAllStack() {
    console.log('---后退页面---');
    this.stackB.display();
    console.log('---浏览页面---');
    this.stackA.display();
  }

}
module.exports = SampleBrowser;