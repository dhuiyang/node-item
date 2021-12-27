
var getCookie = function (cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
};

var getExceptionType = function (type) {
  switch (type) {
    case '0':
    case '1':
    case '5':
      return 'crashes';
    case '3':
      return 'blocks';
    case '2':
    case '4':
    case '6':
    case '7':
      return 'errors';
  }
}

function handleJump() {
  const currentUser = getCookie('bk_uid');
  const currentProductId = $.query.get('productId');
  const currentPlatformId = $.query.get('platformId');
  const currentMergeId = $.query.get('mergeId');
  const currentPackageId = $.query.get('packageId');
  console.log('url params:', currentPackageId, currentPlatformId, currentMergeId);

  var xhr = new XMLHttpRequest();
  var xhr2 = new XMLHttpRequest();
  // xhr.withCredentials = true;
  try {
    xhr.open('get', 'http://bugly-efftool.testsite.woa.com/systemHandle', false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status <= 300 || xhr.status === 304) {
      const response = xhr.responseText;
      if (response) {
        const whiteListArr = JSON.parse(response);
        const whiteListItem = whiteListArr?.find(item => item.ProductID === currentProductId);
        if (currentUser && whiteListItem?.Users?.includes(currentUser)) {
          console.log('该产品有用户白名单');
          window.parent.aegisInfoAll && window.parent.aegisInfoAll(currentUser, currentProductId, document.cookie);
          return;
        }
      }
    }
  } catch(error) {
    console.log('get white-list err', error);
  }

  if (currentPlatformId && currentMergeId && currentPackageId) {
    xhr2.open('get', `http://portal-http.woa.com/httpHandle?bundleID=${currentPackageId}&pid=${currentPlatformId}&issueID=${currentMergeId}`, false);
    xhr2.send(null);
    if (xhr2.status >= 200 && xhr2.status <= 300 || xhr2.status === 304) {
      const response2 = xhr2.responseText;
      console.log('getNewIssueUUID: ', response2);
      if (response2) {
        const resArr = JSON.parse(response2);
        const exceptionType = getExceptionType(resArr[2]);
        console.log('该链接会重定向到bugly.oa.com对应issue详情页！');
        window.parent.location.href = `http://bugly.oa.com/v2/crash-reporting/${exceptionType}/${resArr[0]}/${resArr[1]}/report?pid=${currentPlatformId}`;
      }
    }
  } else {
    console.log('该产品需要重定向到bugly.oa.com！');
    window.parent.location.href = 'http://bugly.oa.com/';
  }
}
handleJump();

// 发布公告
function newNode() {
  var fatherNode = window.document.getElementsByClassName("main-content");
  var notice = window.document.createElement("div");
  notice.setAttribute('style', 'font-size: 14px; margin: 0 0 20px; color: red; font-weight: bold; padding: 10px 18px; border: 1px solid #dadde2; background: #fff; line-height: 22px')
  notice.innerText = `公告：当前RDM管理端异常上报页面及其子页面已停止维护，后续将通过bugly.oa.com提供更加优良的服务。我们预计9月26日开始分批自动将所有业务切换到bugly站点，RDM异常上报老服务将择机下线，因此建议同学们即日起优先使用bugly站点，使用上遇到问题请通过Bugly助手进行反馈。`;
  var brotherNode = fatherNode[0].children[0];
  fatherNode[0].insertBefore(notice, brotherNode);
}
newNode();
