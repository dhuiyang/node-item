define(function(require, exports, module) {
	var buglyDialog = require('bugly-dialog');
	var indexMethod = require("index");
	var queryBean = {
		productId: ""
	};
	queryBean.productId = $.query.get('productId');

	//判断是否有灰度
	if(queryBean.productId){
//        $.ajax({
//            url : "list/product!isGrayBuglyOa",
//            type : "get",
//            dataType : "json",
//            data : {
//                productId : queryBean.productId,
//                time:Math.random()
//            },
//            complete:function(XMLHttpRequest, textStatus){ //XMLHttpRequest.responseText
//                if(XMLHttpRequest.status == 200 && textStatus == "success"){//带上version
//                    if(XMLHttpRequest.responseText == "1"){//灰度
//                    	$('#newVersionBtn').show();
//                    }
//                }
//            }
//        });
		buglyDialog.showBuglyOADialog(window.parent);
    	$('#newVersionBtn').click(function(){
    		$.ajax({
    			url : "config/index!mmLog",
    			type : "get",
    			dataType : "json",
    			data : {
    				't':Math.random(),
    				'actionId':'new_oa'
    			},
    			complete : function(jqXHR, textStatus, errorThrown) {
    				window.parent.location.href = 'http://bugly.oa.com/';
    			}
    		});
    	});
	}
	
	var request = {
		url : "list/product!productRelate",
		type : 'get',
		dataType : "json",
		async: false,
		data : {
			'productId' : queryBean.productId
		},
		timeout : 30000,
		success : function(json) {
			if (json !== undefined && json !== null) {
				if (json[0] !== undefined && json[0] !== null) {
					var buglyAppId = $.trim(json[0].buglyAppId);
					if(buglyAppId.length > 0) {
						$('#new-data').show();
						$('#new-data-a').click(function() {
							var url = 'index?target=new_rdm&productId=' + productId + '&bp=true';
							messageEvent.postModel("exception", url);
							window.location.href = url;
						});
					} else {
						$('#new-data').hide();
					}
				} else {
					window.location.href = 'configGuide?isStatics=true&target=new_rdm&productId=' + queryBean.productId;
				}
			} else {
				window.location.href = 'configGuide?isStatics=true&target=new_rdm&productId=' + queryBean.productId;
			}
		}
	};

	$.ajax(request).fail(function(jqxhr, textStatus, error) {
	});

	$('#crashConfig').click(function() {
		var url = 'indexCrashConfig?target=new_rdm&productId=' + queryBean.productId;
		messageEvent.postModel("exception", url);
		window.location.href = url;
	});
	
	$('#vipConfig').click(function() {
		var url = 'indexVipConfig?target=new_rdm&productId=' + queryBean.productId;
		messageEvent.postModel("exception", url);
		window.location.href = url;
	});
	
	var resize = function() {
		messageEvent.postSize();
		
		setTimeout(resize, 200);
	};
	resize();
	
	var indexMain = new indexMethod.Main();
	indexMain.init({
		productId: queryBean.productId
	});

	if (queryBean.productId === '93a3f283-99e5-43bb-afb4-35cacc750a0a') {
		// window.location.replace("http://bugly.oa.com/v2/workbench/apps");
		window.location.href = "http://bugly.oa.com/v2/workbench/apps"
	} else {
		console.log('doNothing！！');
	}

});