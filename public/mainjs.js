function get(param) {
	return document.getElementById(param);
}

/*
 * 表格的hover颜色
 */
var mhover = function(option) {
	var ele = $(option.element), current = option.current;
	ele.not(':first').hover(function() {
		$(this).addClass(current)
	}, function() {
		$(this).removeClass(current);
	});
}

var mhover2 = function(option) {
	var ele = $(option.element), current = option.current, rpbg = option.rpbg;
	ele.filter(':first').find('span').hover(function() {
		$(this).addClass(rpbg);
	}, function() {
		$(this).removeClass(rpbg);
	});
	ele.not(':first').hover(function() {
		$(this).addClass(current)
	}, function() {
		$(this).removeClass(current);
	});
	ele.not('.table-first').hover(function() {
		$(this).addClass(current)
	}, function() {
		$(this).removeClass(current);
	});
}

/*
 * 浮动层显示隐藏
 */
var floo = function(option) {
	var element = $(option.element), flo = $(option.flo), cur = option.current;
	element.click(function() {
		flo.css({
			'display' : 'block'
		});
		$(this).addClass(cur);
	});
	element.hover(function() {
		$(this).addClass(cur);
	}, function() {
		$(this).removeClass(cur);
	});
	flo.hover(function() {
		$(this).css({
			'display' : 'block'
		});
	}, function() {
		$(this).css({
			'display' : 'none'
		});
	})
}

var mouseh = function(option) {
	var btn = $(option.btn), cur = option.cur, box = $(option.box), delay;
	btn.mouseenter(function() {
		delay = setTimeout(function() {
			box.fadeIn("slow");
		}, 200);
		$(option.mtext).addClass(cur);
	});
	btn.mouseleave(function() {
		clearTimeout(delay);
		box.fadeOut("slow");
		$(option.mtext).removeClass(cur);
	});

}

/*
 * 具体实现
 */
mouseh({
	btn : '#procuct-q',
	cur : 'product-qh-current',
	box : '.product-floor',
	mtext : '#product-t'
});
floo({
	element : '.product-add',
	flo : '.product-menu-floor',
	current : 'product-app-hover'
});
mhover({
	element : '.main-nav-content ul li',
	current : 'nav-hover'
});
mhover({
	element : '.c-main-center ul li',
	current : 'c-main-hover'
});
mhover({
	element : '.list-hover li',
	current : 'thover'
});
mhover2({
	element : '.list-hover2 li',
	current : 'thover',
	rpbg : 'rp-bg'
});
mhover({
	element : '.product-m li',
	current : 'current'
});

/* 搜索调用的函数 */
$.fn.searchbar = function(param) {
	var dtext, dcancel, textbar, context, focusColor, focusColor, blurColor;
	dtext = '.' + param.dtext; // 默认关键字
	dcancel = '.' + param.dcancel;
	textbar = '.' + param.textbar; // 输入文本
	focusColor = param.focusColor; // 聚焦时候的颜色
	blurColor = param.blurColor; // 失去焦点的时候的颜色

	dtext = $(dtext);
	dcancel = $(dcancel);
	textbar = $(textbar);
	textbar.bind({
		focus : function() {
			dtext.css("color", focusColor);
			dcancel.css("display", "none");
		},
		blur : function() {
			dtext.css("color", blurColor);
		},
		keyup : function() {
			context = this;
			if (this.value.length == 0) {
				dtext.css("display", "block");
			} else {
				dtext.css("display", "none");
			}
			dcancel.css("display", "block");
			dcancel.bind("click", function() {
				context.value = '';
				dtext.css("display", "block");
			});
		}
	});
	dtext.click(function() {
		textbar.focus()
	});
	return this;
};

/* weishai */
$(function() {
});

// 弹出层
function winpop() {
	var winWidth = $(document).width();
	var textWidth = $(document).width() / 2.4;
	$('.info-message li p').css({
		width : textWidth + 'px'
	});
	winWidth = winWidth * 0.9;
	var winHeight = $(".popwin").height();
	$(".popwin").css({
		width : winWidth + 'px',
		height : winHeight + 'px',
		marginLeft : '-' + winWidth / 2 + 'px',
		marginTop : '-' + winHeight / 2 + 'px',
		left : '50%',
		top : '50%'
	})
	$(window).resize(function() {
		var textWidth = $(document).width() / 2.4;
		$('.info-message li p').css({
			width : textWidth + 'px'
		});
		var winWidth = $(document).width();
		winWidth = winWidth * 0.9;
		$(".popwin").css({
			width : winWidth + 'px',
			height : winHeight + 'px',
			marginLeft : '-' + winWidth / 2 + 'px',
			marginTop : '-' + winHeight / 2 + 'px',
			left : '50%',
			top : '50%'
		})
	})
}
winpop();

// 菜单自适应

function menuAuto() {
	var mwidth = $('.content').width() - $('.product-add').width() - 15;
	$('.product-nav').css({
		width : mwidth + 'px'
	});
	$(window).resize(function() {
		var mwidth = $('.content').width() - $('.product-add').width() - 15;
		$('.product-nav').css({
			width : mwidth + 'px'
		});
	});
}
menuAuto();

// 发布公告
function newNode() {
	var productTitle = window.document.getElementsByClassName("product-qh");
	var notice = window.document.createElement("div");
	notice.style.margin = '10px 20px';
	notice.style.color = 'red';
	notice.style.fontWeight = 'bold';
	notice.innerHTML = `公告：当前RDM管理端异常上报页面及其子页面已停止维护，后续将通过bugly.oa.com提供更加优良的服务。
我们预计9月26日开始分批自动将所有业务切换到bugly站点，RDM异常上报老服务将择机下线，因此建议同学们即日起优先使用bugly站点，使用上遇到问题请通过Bugly助手进行反馈。`;
	productTitle[0].appendChild(notice);
}
newNode();

// 网站重定向
function replaceUrl() {
	if ($.query.get('productId') === '45823f63-4dab-4d7c-9bbd-90470f0ffd44') {
		window.location.href = "http://bugly.oa.com/v2/workbench/apps";
	}
}
replaceUrl();