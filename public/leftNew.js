var root = 'http://rdm.oa.com/products.html';
var theRoot = root;

var LEFTURL = {
	target : '',
	productId : ''
}
LEFTURL.target = $.query.get('target');
LEFTURL.productId = $.query.get('productId');

var feedBackiFrame = $('<iframe>', {
	id : 'feedbackIframe',
}).css({
	height: '450px',
	width: '100%',
	border: 'none',
	});

var feedBackDiv = $('<div>', {
	id : 'feedbackModal',
}).css(
		{
			height: '650px',
			width: '500px',
			position: 'fixed',
			top: '200px',
			left: '30%',
			padding: '20px',
			background: '#FFFFFF',
			'text-align': 'right',
			'box-shadow': '0 15px 30px rgba(0,0,0,0.1)',
		}
	);
var feedbackCancel = $('<button>', {
	id: 'feedback-close',
	type: 'button',
	text: 'X',
	cursor: 'pointer',
}).css({
	border: 'none',
    background: 'white',
    'font-size': '15px',
});
//feedBackDiv.append('<button id="feedback-close">X</button>');
feedBackDiv.append(feedbackCancel);
feedBackDiv.append(feedBackiFrame);
feedbackCancel.click(function(){
	feedBackDiv.hide();
});
var setCookie = function(cname, cvalue) {
	var d = new Date();
    d.setTime(d.getTime() + (7*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};
var getCookie = function(cname) {
	var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
};

(function() {
	var ulTarget = $('<ul>', {
		id : 'report-left-tab'
	});
	var indexLiTarget = $('<li>');
	var indexATarget = $('<a>', {
		id : 'l-index',
		'class' : 'link-m',
		href : '#index',
		text : '异常首页'
	});
	indexLiTarget.append(indexATarget);

	var issueLiTarget = $('<li>');
	var issueATarget = $('<a>', {
		id : 'l-problem',
		'class' : 'link-l',
		href : '#problem',
		text : '问题列表'
	});
	issueLiTarget.append(issueATarget);

	var statLiTarget = $('<li>', {
		'class' : 'dropmenu'
	});
	var statATarget = $('<a>', {
		id : 'l-stat',
		'class' : 'link-t link-t-h',
		href : '#stat',
		html : '统计中心<span class="icon-dropdown"></span>'
	});
	var statDivTarget = $('<div>', {
		'class' : 'dropbar',
		style : 'display: block'
	});
	var sub_1 = $('<a>', {
		'class' : 'item',
		to : 'stat',
		style : 'background:none;display: inline-block;',
		text : '按天统计'
	});
	var sub_2 = $('<a>', {
		class : 'item',
		to : 'hourStat',
		style : 'background:none;display: inline-block;',
		text : '小时累计统计'
	});
	var sub_5 = $('<a>', {
		'class' : 'item',
		to : 'hourStatNew',
		style : 'background:none;display: inline-block;',
		text : '小时增量统计'
	});
	var sub_3 = $('<a>', {
		'class' : 'item',
		to : 'ftStat',
		style : 'background:none;display: inline-block;',
		text : 'FT/模块统计'
	});
	var sub_4 = $('<a>', {
		'class' : 'item',
		to : 'hwStat',
		style : 'background:none;display: inline-block;',
		text : '硬件统计'
	});
	var sub_6 = $('<a>', {
		'class' : 'item',
		to : 'export',
		style : 'background:none;display: inline-block;',
		text : '跨版本统计'
	});
	var sub_7 = $('<a>', {
		'class' : 'item',
		to : 'gray',
		style : 'background:none;display: inline-block;',
		text : 'IMEI灰度统计'
	});
	if(LEFTURL.productId == "e272665c-7c44-4894-ac85-e8d04592db73" || LEFTURL.productId == "717b2ed6-d38c-4921-9adb-4bdf596538e6"){
		var sub_8 = $('<a>', {
			'class' : 'item',
			to : 'compareVersion',
			style : 'background:none;display: inline-block;',
			text : '版本对比'
		});		
	}
	statDivTarget.append(sub_1);
	statDivTarget.append(sub_2);
	statDivTarget.append(sub_5);
	statDivTarget.append(sub_3);
	statDivTarget.append(sub_4);
	statDivTarget.append(sub_6);
	statDivTarget.append(sub_7);
	if(LEFTURL.productId == "e272665c-7c44-4894-ac85-e8d04592db73" || LEFTURL.productId == "717b2ed6-d38c-4921-9adb-4bdf596538e6"){
		statDivTarget.append(sub_8);
	}
	statLiTarget.append(statATarget);
	statLiTarget.append(statDivTarget);

	var configLiTarget = $('<li>');
	var configATarget = $('<a>', {
		id : 'l-version',
		'class' : 'link-d',
		href : '#version',
		text : '配置'
	});
	configLiTarget.append(configATarget);

	var joinLiTarget = $('<li>', {
		'class' : 'l-join'
	});
	var joinATarget = $('<a>', {
		id : 'l-join',
		'class' : 'link-j',
		href : 'http://tapd.oa.com/rqd/markdown_wikis/#1010048271004922513',
		target: '_blank',
		text : 'SDK下载'
	});
	joinLiTarget.append(joinATarget);
	//FIXME .append(indexLiTarget)

	var feedbackLiTarget = $('<li>', {
		'class' : 'l-join',
	});
	var feedbackATarget = $('<a>', {
		id : 'feedback',
		'class' : 'link-j',
		'href': '',
		text : '反馈'
	});
	feedbackLiTarget.append(feedbackATarget);

	ulTarget.append(indexLiTarget).append(issueLiTarget).append(statLiTarget).append(configLiTarget).append(joinLiTarget);
	var menuleft = $('#menuleft');
	menuleft.empty().append(ulTarget);

	var level = menuleft.attr('level');
	switch (level) {
	case '1' :
		$('#l-index').addClass('link-h').attr('report-left-select', true);
		break;
	case '2' :
		$('#l-problem').addClass('link-h').attr('report-left-select', true);
		break;
	case '3' :
		$('#l-stat').addClass('link-t-h link-h').attr('report-left-select', true);
		$('.dropbar').show();
		break;
	case '4' :
		$('#l-version').addClass('link-h').attr('report-left-select', true);
		break;
	}

	active();
})();

function active() {
	var p = $('#report-left-tab');
	//FIXME $(p.children()[3]).css('border-bottom', 'none');$(p.children()[4]).hide();
	$(p.children()[4]).css('border-bottom', 'none');
//	$(p.children()[4]).hide();

	/**
	 * 左侧tab选中切换
	 */
	$('#report-left-tab li a').click(function(e) {
		var target = $(this);
		var href = target.attr('href');
		//if(target.attr('id')=="feedback"){
		//	e.preventDefault();
		//	showFeedback();
		//	return;
		//}

		if (href == '#join') {
			return false;
		}

		switch (href) {
		case '#index' :
			var url = 'index?target=new_rdm&productId=' + LEFTURL.productId;
			messageEvent.postModel("exception", url);
			window.location.href = url
			break;
		case '#problem' :
			var url = 'product?target=new_rdm&productId=' + LEFTURL.productId;
			messageEvent.postModel("exception", url);
			window.location.href = url
			break;
		case '#stat' :
			// 统计中心 展开/收起 二级菜单
			var bar = $(".dropbar");
			if (target.hasClass('link-t-h')) { // 展开
				bar.hide();
				target.removeClass('link-t-h');
			} else { // 收起
				bar.show();
				target.addClass('link-t-h');
			}
			return;
		case '#version' :
			var url = 'configIndex?target=new_rdm&productId=' + LEFTURL.productId;
			messageEvent.postModel("exception", url);
			window.location.href = 'configIndex?target=new_rdm&productId=' + LEFTURL.productId;
			break;
		default:		
			return;
		}

		var hide = $('div[report-left-target=true]');
		var unselect = $('a[report-left-select=true]');

		unselect.removeClass('link-h');
		unselect.attr('report-left-select', false);

		target.addClass('link-h');
		target.attr('report-left-select', true);

		hide.hide();
		hide.attr('report-left-target', false);
	});

	// 统计的二级菜单的跳转
	var items = $("#report-left-tab .item");
	if (items) {
		for ( var i = 0; i < items.length; i++) {
			var item = $(items[i]);
			if (item) {
				var sub = item.attr("to") + "?target=new_rdm&productId=" + LEFTURL.productId;
				sub = encodeURIComponent(sub);
				var url = root + "?productId=" + LEFTURL.productId + "&sub=" + sub + "&model=exception";
				item.attr("href", url);
			}
		}
	}

	$("#report-left-tab .item").click(function() {
		var ele = $(this);
		window.location.href = ele.attr("to") + "?target=new_rdm&productId=" + LEFTURL.productId;
		return false;
	});
};
