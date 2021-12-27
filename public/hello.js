define(function (require, exports, module) {
  // require('https://cdn-go.cn/aegis/aegis-sdk/latest/aegis.min.js?_bid=3977');
  // var aegis;
  // if (window.Aegis) {
  //   aegis = new window.Aegis({
  //     id: 'lBMmvVbjFRnjvOxnnV',
  //   });
  // }
  // window.parent.aegisReport = function report(msg, detail) {
  //   if (aegis) {
  //     aegis.reportEvent({
  //       name: 'click-to-buglyoa',
  //       ext1: msg,
  //       ext2: detail,
  //     });
  //   } else {
  //     console.warn('没有引入aegis，导致无法上报');
  //   }
  // }
  //   module.exports = {
  //     showBuglyOADialog: function showBuglyOADialog(window, bundleId, appId, pid) {
  //       if (localStorage.getItem('bugly-dialog-flag')) {
  //         return;
  //       }
  //       var url;
  //       if (bundleId && appId && pid) {
  //         url = `http://bugly.oa.com/v2/new-pages/rdm/for-rdm?bundleId=${bundleId}&appId=${appId}&pid=${pid}`;
  //       } else {
  //         url = 'http://bugly.oa.com';
  //       }

  const productId = $.query.get('productId');
  console.log('输出productId：', productId);
  var box = window.document.createElement('div');
  if (productId === 'ed698884-ff6c-4920-a3ce-1212d2bf9d2d') {
    box.innerHTML = `
    <div id="bugly-dialog">
        <div class="bugly-dialog-bg"></div>
        <div class="bugly-dialog-body">
            <div class="bugly-dialog-content">尊敬的用户，非常感谢您对Bugly的支持。RQD平台即将下架，为了更好的服务大家，推荐使用新版Bugly平台。也欢迎您随时通过企业微信向【Bugly助手】反馈使用上的问题。（点击下方按钮进入bugly.oa.com平台）</div>
            <div class="bugly-dialog-button">
                <a class="bugly-dialog-goto" target="_blank" href="http://bugly.oa.com/v2/workbench/apps">前往Bugly</a>
            </div>
        </div>
        <style>
            #bugly-dialog {
              position: fixed;
              z-index: 1000;
                font-family: Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color emoji;
            }
            .bugly-dialog-bg {
                position: fixed;
                top: 0;
                left: 0;
                background-color: rgba(0, 0, 0, 0.6);
                width: 100%;
                height: 100%;
            }
            .bugly-dialog-body {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 2px;
                background-color: white;
                padding: 20px;
                width: 300px;
            }
            .bugly-dialog-content {
                color: #888888;
                font-size: 14px;
            }
            .bugly-dialog-button {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                margin-top: 20px;
                padding: 10px 10px 0;
                font-size: 16px;
            }
            .bugly-dialog-goto {
                cursor: pointer;
                color: #42A5F5;
                font-weight: bold;
                text-decoration: none;
            }
        </style>
    </div>`;
  } else {
    console.log('doNothing！！');
  }
  
  window.document.body.appendChild(box);
});