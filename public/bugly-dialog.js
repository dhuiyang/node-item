define(function(require, exports, module) {
    require('https://cdn-go.cn/aegis/aegis-sdk/latest/aegis.min.js?_bid=3977');
    var aegis;
    if (window.Aegis) {
        aegis = new window.Aegis({
            id: 'lBMmvVbjFRnjvOxnnV',
        });
    }
    window.parent.aegisReport = function report (msg, detail) {
        if (aegis) {
            aegis.reportEvent({
                name: 'click-to-buglyoa',
                ext1: msg,
                ext2: detail,
            });
        } else {
            console.warn('没有引入aegis，导致无法上报');
        }
    }
    window.parent.aegisInfoAll = function report(uid, pId, cookie) {
        if (aegis) {
            aegis.infoAll({
                logName: 'jump-buglyoa-product',
                userId: uid,
                productId: pId,
                cookie: cookie,
            });
        } else {
            console.warn('没有引入aegis，导致无法上报');
        }
    }

    module.exports = {
        showBuglyOADialog: function showBuglyOADialog(window, bundleId, appId, pid) {
            if (localStorage.getItem('bugly-dialog-flag')) {
                return;
            }
            var url;
            if (bundleId && appId && pid) {
                url = `http://bugly.oa.com/v2/new-pages/rdm/for-rdm?bundleId=${bundleId}&appId=${appId}&pid=${pid}`;
            } else {
                url = 'http://bugly.oa.com';
            }
            var box = window.document.createElement('div');
            window.bugly_dialog = box;
            box.innerHTML = `
<div id="bugly-dialog">
    <div class="bugly-dialog-bg" onclick="window.bugly_dialog.remove(); window.aegisReport('cancel-bg', '${url}');"></div>
    <div class="bugly-dialog-body">
        <div class="bugly-dialog-content">尊敬的用户，非常感谢您对Bugly的支持。为了更好的服务大家，我们推出了新版Bugly平台，邀请您体验。也欢迎您随时通过企业微信向【Bugly助手】反馈使用上的问题。（点击下方按钮进入${bundleId ? ` ${bundleId} 对应的产品页面` : '新平台首页'}）</div>
        <div class="bugly-dialog-button">
            <div class="bugly-dialog-close" onclick="window.bugly_dialog.remove(); window.localStorage.setItem('bugly-dialog-flag', 'true'); window.aegisReport('cancel', '${url}');">取消</div>
            <a class="bugly-dialog-goto" target="_blank" onclick="window.bugly_dialog.remove(); window.localStorage.setItem('bugly-dialog-flag', 'true'); window.aegisReport('goto', '${url}');" href="${url}">前往体验</a>
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
        .bugly-dialog-close {
            color: gray;
            cursor: pointer;
            margin-right: 20px;
        }
        .bugly-dialog-close:hover {
            color: #42A5F5;
        }
        .bugly-dialog-goto {
            cursor: pointer;
            color: #42A5F5;
            font-weight: bold;
            text-decoration: none;
        }
    </style>
</div>`;
            window.document.body.appendChild(box);
        }
    }
});