define(function(require, exports, module) {
	var buglyDialog = require('bugly-dialog');
	var editLoading = false;//备注是否添加完了
	var editor = null;
	var qreditor = require('qreditor');
	var productIdParam = $.query.get('productId');
	var utilMod = require("util");
	var Util = new utilMod.util();
	var platformIdParam = -1;
	var isClickFlag = false;
	var isShow = false;
	var issueListJsStart = new Date().getTime();
	var issue_count_url = "list/issue!count";
	var issue_history_url = "list/issue!history"; // 获取问题列表历史查询条件的接口
	var issue_history3_url = "list/issue!history_3";
	var packageid_url = "list/issue!packages"; // 获取产品下有多少个packageId的接口
	var issue_list_url = "list/issue!list?isStatics=true&searchVo.mode=1&productId=" + productIdParam; // +
	var product_url = "list/product!products";
	var issue_detail_url = "list/issue!detail?isStatics=true&productId=" + productIdParam;
	var issue_gray_url = "list/issue!gray";
	var product_relate_url = "list/product!productRelate";
	var issue_processor_url = "list/issue!processor?isStatics=true&productId=" + productIdParam;
	var issue_remark_url = "list/issue!remark?isStatics=true&productId=" + productIdParam;

	var issueGrid = null;
	var issueStore = null;
	var pageTool = null;
	var expander = null;
	var cellEditor = null;
	var processorShow = null;
	var processorHide = null;
	var width = null;
	var dataArray = [];
	var doneArray = [];
	var check_pageCache = [];

	var searchCount = 0;
	var firstLoadStart = 0;
	var initProblemPageStart = 0;
	var isExistVersionFlag = false;

	var URL = {
		target: '',
		packParam: null,
		versionParam: null,
		versionParam2: null,
		issueIdParam: null,
		imeiParam: null,
		processorParam: null,
		contactParam: null,
		hardwareOsParam: null,
		detailParam: null,
		beginParam: null,
		endParam: null,
		ft: null,
		statusParam: null,
		osVersionParam: null,
		countryParam:null,
	};
	URL.target = $.query.get('target');
	/*
	 * 增加了workspaceid 和 workspaceName
	 */

	require('https://unpkg.com/axios/dist/axios.min.js');
	console.log('axios: ', axios);

	axios.get('http://bugly-efftool.testsite.woa.com/systemHandle').then((res) => {
		console.log('result: ', res);
	});
	// console.log('result: ', result);

	function getAppIdUrl(bundleId, platformId){
		Util.getBuglyAppId(bundleId, platformId,function(appId){
			var url = `http://bugly.oa.com/v2/new-pages/rdm/for-rdm?bundleId=${bundleId}&appId=${appId}&pid=${platformId}`;
//			console.log("getAppIdUrl:", appId, 'http://bugly.oa.com/v2/crash-reporting/dashboard/'+ appId +'?pid=' + platformId );
			buglyDialog.showBuglyOADialog(window.parent, bundleId, appId, platformId);
			if(appId){
				$('#newVersionBtn').show().attr('data-href', url).click(function(){
					$.ajax({
						url : "config/index!mmLog",
						type : "get",
						dataType : "json",
						data : {
							't':Math.random(),
							'actionId':'new_oa'
						},
						complete : function(jqXHR, textStatus, errorThrown) {
							window.parent.location.href = $('#newVersionBtn').attr('data-href');
						}
					});
				});
			} else {
				$('#newVersionBtn').hide();
			}
		});
	}

	function getWorkSpace(workSpaceId,workSpaceName){//直接挂载在window下
		window.workSpaceName = $.trim(workSpaceName);
		window.workSpaceId = $.trim(workSpaceId);
	}

	function showEditLoading(){
		// console.log($('.x-mask').size());
		$('.x-mask').css('visibility','visible').show();
		$('.x-mask-msg').show();
	}

	function hideEditLoading(){
		$('.x-mask').css('visibility','hidden').hide();
		$('.x-mask-msg').hide();
	}

	function showWorkSpace(temp){
		if( window.workSpaceName != 'null'){
			if(temp == 'show'){
				$('#setWorkSpaceName').show().html('工作区:'+ window.workSpaceName);
			} else{
				$('#setWorkSpaceName').hide();
			}
		}
		if( window.workSpaceId != ""){
			if(temp == 'show'){
				$('#setWorkSpaceId').show().html('工作区ID:'+ window.workSpaceId +　'<a id="setWorkspaceIdIcon" href="javascript:void(0);" class="icon-pen"></a>');
			} else {
				$('#setWorkSpaceId').hide();
			}
		}
	}


	$('#issue-table').delegate('.ext-a','click',function(){
		if(this.getAttribute('data-workspaceid') || this.getAttribute('data-workspacename')){
			getWorkSpace($(this).attr('data-workspaceid'),$(this).attr('data-workspacename'));
		}
	});

	$('input[name=male]').on('change',function(){
		$('#warning').text('');
		if(this.getAttribute('value') == 6){
			showWorkSpace('show');
		} else {
			showWorkSpace('hide');
		}
	});

	$('#status-form').delegate('#setWorkspaceIdIcon','click',function(){
		$('#issues-modifyStatusPop').hide();
		$('#modifyWorkspaceIdPop').show();
		$('#currWorkspaceId').html(window.workSpaceId);
		var scrollTop = $(window.parent).scrollTop();
		$('#modifyWorkspaceIdPop').css('top', scrollTop + 'px').css('margin-top', '0px');
	});

	$('#workspaceIdHelp').hover(function(){
		$('#tapdId').show();
	},function(){
		$('#tapdId').hide();
	});

	$('#modifyCancel').click(function(){
		$('#modifyWorkspaceIdPop').hide();
		$('#modifyWorkspaceIdPop').hide();
		$('.popwin-mask').hide();
	});

	$('#modifyOk').click(function(){
		var newId = $("#newWorkspaceId").val();
		if (!newId) {
			alert("请输入新的工作区id");
			return;
		}
		$.ajax({
			url: "list/issue!workspace?isStatics=true&productId=" + $.query.get('productId'),
			type: "post",
			dataType: "json",
			data: {
				"packageId": $.query.get('packageId') || $('.chzn-single').eq(0).find('span').text(),
				"platformId": $.query.get('platformId') || '1',
				"workspaceId": newId
			},
			success: function(json) {
				if (json) {
					if (json.rc != -1) { // 修改成功了
						window.workSpaceId = newId;
						window.workSpaceName = json.data;
						$('.status').attr('data-workspaceid',newId);
						$('.status').attr('data-workspacename',json.data);
						alert('修改成功');
						$('.close-btn').trigger('click');
					} else {
						$("#modifyFailTip").show();
					}
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if (textStatus === "timeout") {
					console.error("modify workspace error, textStatus: " + textStatus + "http code: " + jqXHR.status +
						"  errorThrown: " + errorThrown);
					alert("服务器繁忙，请稍后重试");
				} else if (textStatus === "error") {
					if (jqXHR.status == 504 || jqXHR.status == 408 || jqXHR.status == 503) {
						console.error("modify workspace error, textStatus: " + textStatus + "http code: " + jqXHR.status +
							"  errorThrown: " + errorThrown);
						alert("服务器繁忙，请稍后重试");
					} else {
						console.error("modify workspace error, textStatus: " + textStatus + "http code: " + jqXHR.status +
							"  errorThrown: " + errorThrown);
						alert("后台发生错误，请RTX联系RDM小秘书");
					}
				} else {
					console.error("modify workspace error, textStatus: " + textStatus + "http code: " + jqXHR.status +
						"  errorThrown: " + errorThrown);
					alert("页面出错了，请RTX联系RDM小秘书");
				}
			}
		});
	});
	//

	if (URL.target == "rdm") { // 如果是要嵌入rdm，则需要调整各种样式
		$("#body").css({
			// "width": "900px",
			"backgroundColor": "white",
			"margin": "0 auto"
		});
		$("#exceptionNav").hide(); // 隐藏侧边栏

		$("#statTab1").hide(); // 隐藏统计分析tab
		$("#statTab2").hide();

		$("#content1").removeAttr("class"); // 去掉content1上的样式
		$("#content2").removeAttr("class"); // 去掉content2上的样式

		$("#popwin2").css({
			"margin-top": "-255px"
		});

		$("#footer").hide(); // 隐藏footer
		$('#bread').hide(); // 隐藏面包屑
	} else if (URL.target == "new_rdm") {
		$("#exceptionNav").show(); // 显示侧边栏

		$("#top-nav").hide(); // 隐藏头部的导航

		var url = window.location.href;
		var subUrl = url.substring(url.lastIndexOf("/") + 1, url.length);
		messageEvent.postModel("exception", subUrl);
	}

	function getIssueOwner (records) {
		/* mock start */
		// const json = {
		// 	issueOwners: [{
		// 		issueHash: '7D29C7A5C94A46604CCB66821AEFA58E',
		// 		owners: ['lehuading', 'xxx']
		// 	}]
		// }
		/* mock end */

		const bundleId = records[0].get('packageId');
		const issueHashList = records.map(function (item) {
			return item.get('issueHash');
		});
		$.ajax({
			url: 'http://issueowner.bugly.woa.com/trpc.eff_tool.owner_info_mgr.InfoServiceHttp/ShowOwners',
			type : 'post',
			dataType : "json",
			timeout : 90000,
            contentType: 'application/json',
			data: JSON.stringify({
				bundleID: bundleId,
				issueHashList: issueHashList
			}),
			success: function (json) {
				// console.log('issueOwners', json);
				const issueHashMap = {};
				json.issueOwners.forEach(function (item) {
					issueHashMap[item.issueHash] = item.owners;
				});
				// console.log('issueHashMap', issueHashMap)
				records.forEach((item) => {
					const owners = issueHashMap[item.get('issueHash')];
					// console.log('owners', owners, item.get('issueHash'));
					if (owners) {
						item.set('owners', owners.join(', '));
					}
				})
			}
		})
	}

	var pageSize = 50;
	var recordCache = [];

	var status_btn = $('#status-btn');
	var initPanel = function() {
		Ext.Loader.setConfig({
			enabled: true
		});
		Ext.override(Ext.data.proxy.Ajax, {
			timeout: 10000000
		});

		Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel']);

		Ext.onReady(function() {
			Ext.define('Issue', {
				extend: 'Ext.data.Model',
				fields: [{
					name: 'mergeId'
				}, {
					name: 'issueHash'
				},{
					name: 'errorType'
				}, {
					name: 'version'
				}, {
					name: 'crashNum',
					type: 'int'
				}, {
					name: 'userNum',
					type: 'int'
				}, {
					name: 'imeiNum',
					type: 'int'
				}, {
					name: 'status',
				}, {
					name: 'statusName'
				}, {
					name: 'retraceStatus'
				}, {
					name: 'crashTime'
				}, {
					name: 'processor'
				}, {
					name: 'stack'
				}, {
					name: 'editorInfo'
				}, {
					name:'miniEditorInfo'
				},{
					name: 'stackForBug'
				},{
					name:'packageId'
				},{
					name:'platformId'
				}, {
					name: 'owners'
				}]
			});

			Ext.QuickTips.init();

			var httpStatus = 200;
			issueStore = Ext.create('Ext.data.Store', {
				model: 'Issue',
				autoLoad: false,
				remoteSort: true,
				pageSize: 50,
				timeout: 60000,
				proxy: {
					type: 'ajax',
					startParam: 'searchVo.offset',
					limitParam: 'searchVo.pageSize',
					extraParams: {
						test: 1
					},
					reader: {
						type: 'json',
						root: 'issues',
						totalProperty: 'count'
					},
					listeners: {
						exception: function(proxy, exception, operation) {
							httpStatus = exception.status;
						}
					}
				},
				listeners: {
					load: function (store, records, successful, eOpts) {
						// console.log('issueListNew2', records, successful);
						if (successful && records && records.length > 0) {
							getIssueOwner(records);
						}
					},
				}
			});

			expander = new Ext.grid.plugin.RowExpander({
				expandOnDblClick: false,
				expandOnEnter: false,
				rowBodyTpl: new Ext.XTemplate(
					"<div ><p class=\"problem-p-b\">备注: {miniEditorInfo}<a href=\"javascript:void(0);\" class='toEditBtn' data-rootUrl=\"crashContent?target=new_rdm&productId="+productIdParam+"&mergeId={mergeId}&packageId={packageId}&platformId={platformId}\" data-backUrl=\""+ root +"?productId="+productIdParam+"&model=exception&sub=issueDetailNew?isStatics=true&target=new_rdm&productId="+encodeURIComponent(productIdParam)+"&platformId={platformId}&packageId={packageId}&mergeId={mergeId}&buildId="+encodeURIComponent($('#pack-select').val())+"&imei="+encodeURIComponent($('#imei-input').val())+"&contact="+encodeURIComponent($('#contact-input').val())+"&detail="+encodeURIComponent($('#crash-detail-input').val())+"&os="+encodeURIComponent($('#os-input').val())+"\" mergeId=\"{mergeId}\" appId = \"{packageId}\" pid=\"{platformId}\" target=\"_blank\">查看</a></p><p>堆栈还原： <b id=\"loading-{mergeId}\" class=\"loading\">正在解析堆栈...</b></P><ul id=\"{mergeId}\" class='code-bark-list'>" + "{stack}" + "</ul></div>")
			});

			cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit: 2,
				autoCancel: false
			});

			var dataCache = [];
			delete Ext.tip.Tip.prototype.minWidth;
			issueGrid = Ext.create('Ext.grid.Panel', {
				store: issueStore,
				columns: [{
					text: "编号",
					flex: 3,
					align: 'center',
					dataIndex: 'issueHash',
					renderer: function(value, p, record, index) {
						recordCache[index] = record;
						expander.recordsExpanded = {};

						p.tdAttr = 'data-qtip="' + value + '"';

						dataArray[index] = record;
						dataCache[index] = record.data;
						return (function(record, pMethod, url) {
							var issue_detail_html = null;
							var sub = null;
							var buildId = '';
							if (version && version.indexOf('#') > 0) {
								buildId = version.split('#')[1];
							}

							switch (url.target) {
								case 'rdm':
									issue_detail_html = 'http://rdm.wsd.com/expcenter.html?v=e.excepUpload&t=' + record.data.mergeId +
										'---' + packageId + '---' + pMethod.platformId;
									break;
								case 'new_rdm':
									issue_detail_html = root + '?productId=' + productIdParam + '&model=exception&sub=';
									sub = 'issueDetailNew?isStatics=true&target=new_rdm&productId=' + productIdParam + '&platformId=' +
										pMethod.platformId + '&mergeId=' + record.data.mergeId + '&packageId=' + packageId +
										'&buildId=' + buildId + '&imei=' + imei + '&contact=' + contact + '&detail=' + crashDetail + '&os=' + os + '&osVersion=' + osVersion;
									issue_detail_html += encodeURIComponent(sub);
									// issue_detail_html = sub;
									break;
							}

							return '<img class="copy" src="images/page_copy.png" data-clipboard-text="'+value+'" style=" height: 15px;margin-right: 5px;"/>' +
								'<a href=\'' + issue_detail_html + '\' target=\'_blank\' class=\'ext-a\'>' + value + '</a>';
						})(record, pMethod, URL);
					}
				}, {
					text: "错误类型",
					flex: 3.9,
					align: 'left',
					sortable: false,
					dataIndex: 'errorType',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						return (function(record, pMethod, url) {
							var issue_detail_html = null;
							var sub = null;
							var buildId = '';
							if (version && version.indexOf('#') > 0) {
								buildId = version.split('#')[1];
							}

							switch (url.target) {
								case 'rdm':
									issue_detail_html = 'http://rdm.wsd.com/expcenter.html?v=e.excepUpload&t=' + record.data.mergeId +
										'---' + packageId + '---' + pMethod.platformId;
									break;
								case 'new_rdm':
									issue_detail_html = root + '?productId=' + productIdParam + '&model=exception&sub=';
									sub = 'issueDetailNew?isStatics=true&target=new_rdm&productId=' + productIdParam + '&platformId=' +
										pMethod.platformId + '&mergeId=' + record.data.mergeId + '&packageId=' + packageId +
										'&buildId=' + buildId + '&imei=' + imei + '&contact=' + contact + '&detail=' + crashDetail + '&os=' + os + '&osVersion=' + osVersion;
									issue_detail_html += encodeURIComponent(sub);
									// issue_detail_html = sub;
									break;
							}

							return '<a href=\'' + issue_detail_html + '\' target=\'_blank\' class=\'ext-a\'>' + value + '</a>';
						})(record, pMethod, URL);
					}
				}, {
					text: "版本",
					flex: 1.5,
					align: 'left',
					sortable: false,
					dataIndex: 'version',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						return value;
					}
				}, {
					text: "上报次数",
					flex: 1.2,
					align: 'right',
					dataIndex: 'crashNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						return accounting.formatNumber(value);
					}
				}, {
					text: "影响用户",
					flex: 1.2,
					align: 'right',
					dataIndex: 'userNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						return accounting.formatNumber(value);
					}
				}, {
					text: "影响设备",
					flex: 1.2,
					align: 'right',
					dataIndex: 'imeiNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						return accounting.formatNumber(value);
					}
				}, {
					text: "状态",
					flex: 1.3,
					align: 'center',
					dataIndex: 'statusName',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';
						window.workSpaceName = record.raw.workspaceName;
						window.workSpaceId = record.raw.workspaceId;
						return '<a href="javascript:void(0)" data-workSpaceId ="'+record.raw.workspaceId+'" data-workSpaceName="'+record.raw.workspaceName+'" class="ext-a status" onclick="showStatusWinDelay(\'' +
							record.data.mergeId+'\', \''+ record.data.statusName +'\')">' + value + '</a>';
					}
				}, {
					text: "解决备注<b class=\"icon-edit\"></b>",
					flex: 1.7,
					align: 'center',
					sortable: false,
					dataIndex: 'editorInfo',
					editor: new Ext.form.field.Text({
						id: "r-id"
					}),
					renderer: function(value, p, record, index) {
						return Util.filterHtmlImg(value,200);
						// p.tdAttr = 'data-qtip="' + $.encoder.encodeForHTMLAttribute(value) + '"';
						// if (value == 'show-loading') {
						// 	return '<b class="icon-loading"></b>';
						// }
						// return '<a class="processor-change-icon"></a>' + filterHtmlImg(value);
					}
				}, {
					text: "最后更新时间",
					flex: 2.7,
					align: 'center',
					dataIndex: 'crashTime',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						return value;
					}
				}, {
					text: "处理人<b class=\"icon-edit\"></b>",
					flex: 1.9,
					sortable: false,
					align: 'center',
					dataIndex: 'processor',
					editor: new Ext.form.field.Text({
						id: "p-id"
					}),
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if (value == 'show-loading') {
							return '<b class="icon-loading"></b>';
						}

						return '<a class="processor-change-icon"></a>' + value;
					}
				}, {
					text: '堆栈负责人',
					flex: 2,
					align: 'center',
					dataIndex: 'owners',
					renderer: function(value, p) {
						p.tdAttr = 'data-qtip="' + value + '"';
						return '<span title="' + value + '">' + value + '</span>';
					}
				}, {
					text: "预览",
					width: 40,
					sortable: false,
					xtype: 'actioncolumn',
					items: [{
						tooltip: '展开',
						iconCls: 'x-action-expand',
						handler: function(grid, rowIndex, colIndex, a) {
							for (var i = 0; i < issueStore.getCount(); i++) {
								if (i != rowIndex) {
									$('tr[data-recordindex=' + i + '] .x-action-col-icon').attr('opened', 0).removeClass(
										'x-action-close');
								}
							}
							var target = $('tr[data-recordindex=' + rowIndex + '] .x-action-col-icon');
							var backUrl = target.parent().parent().parent().find('.ext-a').eq(0).attr('href');//会跳的地址
							var oldUrl = target.parent().parent().parent().parent().find('.toEditBtn').attr("href");
							var rootUrl = target.parent().parent().parent().parent().find('.toEditBtn').attr("data-rootUrl");
							var newUrl = rootUrl + "&backUrl="+ encodeURIComponent(backUrl);
							target.parent().parent().parent().parent().find('.toEditBtn').attr("data-backUrl",backUrl);//设置回去
							if (target.attr('opened') == '1') {
								target.attr('opened', 0).removeClass('x-action-close');
							} else {
								target.attr('opened', 1).addClass('x-action-close');
							}
							$('tr[data-recordindex=' + rowIndex + '] .ext-a')[0].focus();

							var record = recordCache[rowIndex];
							if(!record) {
								record = grid.getRecord(rowIndex);
								recordCache[rowIndex] = record;
							}

							var selected = -1;
							var headId = $('tr[data-recordindex=0]').attr('data-recordid');
							headId = parseInt(headId.substring(11), 10);
							for (var p in expander.recordsExpanded) {
								if (expander.recordsExpanded[p] === true) {
									selected = parseInt(p.substring(11), 10);
									// selected = selected % 50;
									selected -= headId;
									if (selected != rowIndex) {
										expander.toggleRow(selected, recordCache[selected]);
									}
								}
							}
							expandAction(dataArray[rowIndex].data.mergeId);
							expander.toggleRow(rowIndex, record);

							fixFrame();
						}
					}]
				}],
				plugins: [expander, cellEditor],
				columnLines: true,
				selType: 'checkboxmodel',
				// disableSelection : true,
				loadMask: true,
				viewConfig: {
					enableTextSelection: true,
					listeners: {
						refresh: function(gridview) {
							fixFrame();

							$('.x-grid-cell.x-grid-td.x-grid-cell-gridcolumn-1018').hover(function() {
								$($(this).children()[0]).addClass('show-edit-icon');
							}, function() {
								$($(this).children()[0]).removeClass('show-edit-icon');
							});

							$('.x-grid-cell.x-grid-td.x-grid-cell-gridcolumn-1020').hover(function() {
								$($(this).children()[0]).addClass('show-edit-icon');
							}, function() {
								$($(this).children()[0]).removeClass('show-edit-icon');
							});
						}
					}
				},
				renderTo: 'issue-table'
			});

			var editIssueId = null;
			var nochangeMan = null;
			var notExistMan = null;
			var remarkCache = null;
			issueGrid.on({
				cellclick: {
					fn: function(grid, rowIndex, column, e) {}
				},

				celldblclick: {
					fn: function(grid, rowIndex, column, e) {
						editIssueId = e.data.mergeId;
						var eobj = (function(id) {
							for (var i in dataCache) {
								if (dataCache[i].mergeId == id) {
									return dataCache[i];
								}
							}
						})(editIssueId);
						nochangeMan = eobj.processor;

						if (column === 11 && (processorHide === null || processorHide.length === 0)) {//修改处理人

							setTimeout(function() {
								processorHide = $('#p-id-inputEl');
								TFL.userchooser.active(processorHide);
								processorShow = $('#p-id-inputElValue');
								processorShow.focus();
								processorShow.focus();

								$('#p-id-inputElValue').blur(function() {
									// console.log("blur status");
									setTimeout(function() {
										var obj = (function(id) {
											for (var i in dataCache) {
												if (dataCache[i].mergeId == id) {
													return dataCache[i];
												}
											}
										})(editIssueId);

										if (editOk) {
											var text = $('#p-id-inputElValue').val();
											if (!text || text.length === 0) {
												text = $('#p-id-inputEl').val();
											}

											if (text && text.length !== 0) {
												text = text.split('(')[0];
											} else if (notExistMan) {
												text = notExistMan;
											}

											obj.processor = 'show-loading';
											issueStore.loadData(dataCache);

											obj = (function(id) {
												for (var i in dataCache) {
													if (dataCache[i].mergeId == id) {
														return dataCache[i];
													}
												}
											})(editIssueId);

											obj.processor = text;

											if (obj.processor && obj.processor.length > 0) {
												setTimeout(function() {
													var result = modifyProcessor({
														'processor': obj.processor,
														'packageId': packageId,
														'platformId': platformIdParam,
														'issueId': obj.mergeId,
														'status': obj.status,
														'editorInfo': obj.editorInfo
													});

													if (result != 0) {
														obj.processor = nochangeMan;
													}

													setTimeout(function() {
														issueStore.loadData(dataCache);
													}, 1000);
												}, 100);
											} else {
												obj.processor = nochangeMan;
												issueStore.loadData(dataCache);
											}

										} else {
											obj.processor = nochangeMan;
											issueStore.loadData(dataCache);
										}
									}, 200);
								});

								processorShow.css('width', '90%');
								setTimeout(function() {
									$('#recent-user-panel li > a').click(function() {
										editOk = true;
									});
								}, 100);

							}, 200);

						}

						if (column === 11) {
							setTimeout(function() {
								processorShow.css('width', '90%');

								$('#recent-user-panel li > a').click(function() {
									editOk = true;
								});
							}, 200);
						}
					}
				},

				beforeedit: {
					fn: function(editor, e) {
						editOk = false;
						isFocus = true;
						notExistMan = null;

						remarkCache = dataCache[e.rowIdx].editorInfo;
					}
				},

				validateedit: {
					fn: function(editor, e) {
						// console.log(editor, e);
						if (e.colIdx === 9) {
							target = dataCache[e.rowIdx];
							if (e.value != remarkCache) {
								target.remark = 'show-loading';
								// console.log("init ==", dataCache);
								issueStore.loadData(dataCache);
								target = dataCache[e.rowIdx];
								var data = {
									'assigner': target.processor,
									'packageId': packageId,
									'platformId': pMethod.platformId,
									'issueId': target.mergeId,
									'status': target.status,
									'editorInfo': e.value
								};
								// console.log("editLoading init ===",editLoading);
								if(!editLoading){
									editLoading = true;
									// console.log("editLoading start ===",editLoading);
									// if (result != 0) {
									// 	target.editorInfo = remarkCache || '';
									// } else {
									// 	target.editorInfo = e.value;
									// }
									var oldValue =  remarkCache || '';
									var successValue = e.value;
									var targetNum = e.rowIdx;
									showEditLoading();
									var result = modifyRemark(data,dataCache,targetNum,oldValue,successValue);

								}
							}
						}
					}
				}
			});

			issueGrid.getSelectionModel().on({
				select: function(select, e, row) {//checkbox选择状态
					var curPage = issue_offset / issue_pageSize + 1;
					var inCheckArray = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

					var remarkArr = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];//备注信息的数组

					var processorArr = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];//操作人信息

					var statusArr = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];//状态信息

					var selection = issueGrid.getSelectionModel().getSelection();
					var offset = (curPage - 1) * 50;
					for (var i = 0; i < selection.length; i++) {//把获取index的方法改一下 internalId   $('tr[data-recordid="ext-record-21"]').attr('data-recordindex')
						var internalId = selection[i].internalId;
						var recordIndex = $('tr[data-recordid="'+ internalId  +'"]').attr('data-recordindex');
						inCheckArray[recordIndex - offset] = selection[i].data.mergeId;
						remarkArr[recordIndex - offset] = selection[i].data.editorInfo; //备注信息
						processorArr[recordIndex - offset] = selection[i].data.processor;//解决人的信息
						statusArr[recordIndex - offset] = selection[i].data.status;//状态信息
					}
					check_pageCache[curPage] = inCheckArray;
					window.remarkArr = remarkArr;
					window.mergeIdArr = inCheckArray;
					window.processorArr = processorArr;
					window.statusArr = statusArr;
					check_num = getCheckNum();
					status_btn.text('修改状态(' + check_num + ')');
				},

				deselect: function(select, e, row) {
					var curPage = issue_offset / issue_pageSize + 1;
					var inCheckArray = check_pageCache[curPage];

					if (inCheckArray !== undefined && inCheckArray !== null) {
						for (var j = 0; j < inCheckArray.length; j++) {
							if (e.data.mergeId == inCheckArray[j]) {
								inCheckArray[j] = -1;
								remarkArr[j] = -1;
								processorArr[j] = -1;
								statusArr[j] = -1;
								break;
							}
						}
					}
					window.remarkArr = remarkArr;
					window.processorArr = processorArr;
					window.statusArr = statusArr;
					check_num = getCheckNum();
					status_btn.text('修改状态(' + check_num + ')');
				}
			});

			var startTime;
			issueStore.on('beforeload', function(store, operation, options) {
				dataCache = [];

				var sort = store.getSorters();
				var proxy = issueStore.getProxy();
				if (sort && sort.length > 0 && proxy.extraParams.requestcount == 1) {
					proxy.extraParams.requestcount = undefined;
				}

				httpStatus = 200;
				startTime = new Date().getTime();
				// 添加sn
				var proxy = store.getProxy();
				proxy.extraParams.sn = new UUID().id;
				// 请求次数加1
				// searchCount = searchCount + 1;
				// proxy.extraParams.requestcount = searchCount;
				expander.recordsExpanded = {};
				recordCache = [];
			});

			issueStore.on('load', function(store, records, options) {
				canSearch = true;
				$('#problem-search-btn').removeClass('disable');
				$('#detail-search-btn').removeClass('disable');

				var endTime = new Date().getTime();
				var elapseTime = endTime - startTime;
				var proxy = issueStore.getProxy();
				var sn = proxy.extraParams.sn;
				var url = proxy.url + "&" + Ext.Object.toQueryString(proxy.extraParams);

				doneArray = [];
				var count = store.getTotalCount();
				pageNumSet(count);

				issueGrid.doLayout();
				fixFrame();
				$('#l-problem').focus();

				// 记录时间
				var jsExecuted = new Date().getTime();
				var jsExecuteTime = jsExecuted - endTime;
				var pageOk = -1;
				var pageLoaded = -1;
				var naviStart = -1;
				var loadEnd = -1;
				var requestWait = -1;
				if (window.performance && proxy.extraParams.requestcount == 1) { // 支持performance并且是首次查询(打开页面)
					naviStart = window.performance.timing.navigationStart;
					loadEnd = window.performance.timing.loadEventEnd;
					if (naviStart > 0) {
						pageOk = jsExecuted - naviStart;
						pageLoaded = loadEnd - naviStart;
						requestWait = startTime - naviStart;
					}
				}

				var logReporter = new RdmJsLog();

				if (httpStatus !== 0) {
					logReporter.reportLog(startTime, sn, "get", httpStatus, elapseTime, url, jsExecuteTime, pageLoaded, pageOk,
						requestWait, naviStart, loadEnd, endTime, jsExecuted, rdmPageStartTime, rdmPageEndTime, issueListJsStart,
						initProblemPageStart, firstLoadStart);
				}

				if(typeof ClipboardJS !== 'undefined') {
					let clipboard = new ClipboardJS('.copy');
					clipboard.on('success', function(e) {
						console.info('Text:', e.text);
						e.clearSelection();
					});
				}
			});
		});

		Ext.EventManager.onWindowResize(function() {
			width = $('#issue-table').width();

			issueGrid.doLayout();
		});
	};


	var modifyRemark = function(options,dataCache,targetNum,oldValue,successValue) {
		// console.log(options,dataCache,targetNum,oldValue,successValue);
		//$.ajaxSettings.async = false;
		var data = {
			'modifyDto.assigner': options.processor,
			'modifyDto.packageId': options.packageId,
			'modifyDto.platformId': options.platformId,
			'modifyDto.mergeId': options.issueId,
			'modifyDto.status': options.status,
			'modifyDto.editorInfo': options.editorInfo

		};

		var result = -1;

		var request = {
			url: issue_remark_url,
			type: 'post',
			dataType: "json",
			data: data,
			timeout: 120000,
			success: function(json) {
				result = json.rc;
				hideEditLoading();
				editLoading = false;
				if(issueStore){
					var target = dataCache[targetNum];
					target.editorInfo = successValue;
					issueStore.loadData(dataCache);
				}
			}
		};
		$.ajax(request).fail(function(jqxhr, textStatus, error) {
			hideEditLoading();
			var err = '';
			if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
				err = '服务器繁忙, 请稍后重试 !';
			} else {
				err = '系统错误, 请联系企业微信: bugly助手 !';
			}
			result = -1;
			if(issueStore){
				var target = dataCache.targetNum;
				target.editorInfo = oldValue;
				issueStore.loadData(dataCache);
			}
			editLoading = false;
		});
		//$.ajaxSettings.async = true;
		// console.log("editLoading end ==",editLoading);
		return result;
	};

	var modifyProcessor = function(options) {
		$.ajaxSettings.async = false;
		var data = {
			'modifyDto.assigner': options.processor,
			'modifyDto.packageId': options.packageId,
			'modifyDto.platformId': options.platformId,
			'modifyDto.mergeId': options.issueId,
			'modifyDto.status': options.status,
			'modifyDto.editorInfo': options.editorInfo
		};

		var result = -1;

		var request = {
			url: issue_processor_url,
			type: 'post',
			dataType: "json",
			data: data,
			timeout: 3000,
			success: function(json) {
				result = json.rc;
			}
		};

		$.ajax(request).fail(function(jqxhr, textStatus, error) {
			var err = '';
			if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
				err = '服务器繁忙, 请稍后重试 !';
			} else {
				err = '系统错误, 请联系企业微信: bugly助手 !';
			}

			result = -1;
		});
		$.ajaxSettings.async = true;

		return result;
	};

	var pageNumSet = function(count) {
		if (count != -1) {
			if (count == 1500) {
				issue_page_total.text('查询结果: 大于' + count);
			} else {
				issue_page_total.text('查询结果: ' + count);
			}
			issues_count = count;
			PMethod.prototype.changePageStyle(count);
		} else if (count == -1 && count_change === true && count_change_done === false) {
			issue_page_total.text('');
			issue_page_total.append('查询结果: <b class="icon-loading"></b>');
			PMethod.prototype.changePageStyle(count);

			var sh = setInterval(function() {
				if (problem_done === true) {
					var uuidOj = new UUID();
					var uuid = uuidOj.id;
					countChangeCache[uuid] = true;
					var data = {};
					if(isClickFlag == false){
						var crashType =  decodeURIComponent($.query.get('crashType'));
						if(crashType == "all"){
							crashType = "All";
						} else if(crashType == "normal"){
							crashType = "Crash";
						} else if(crashType == "native"){
							crashType = "Native";
						}
						var crashVersion = decodeURIComponent($.query.get('crashVersion'));
						if(crashVersion == "all"){
							crashVersion = "";
						}
						var bundleId = decodeURIComponent($.query.get('bundleId'));
						var errStr = decodeURIComponent($.query.get('errtype'));
						var begTimeStr = decodeURIComponent($.query.get('crashTime'));
						var endTimeStr = decodeURIComponent($.query.get('crashTime'));
						var osVersionStr = decodeURIComponent($.query.get('osVersion'));
						data = {
							"searchVo.packageId": bundleId,
							"searchVo.platformId": pMethod.platformId,
							"searchVo.offset": issue_offset,
							"searchVo.pageSize": issue_pageSize,
							"searchVo.version": crashVersion,
							"searchVo.osVersion": osVersionStr,
							"searchVo.ft": encodeURIComponent(ft),
							"searchVo.status": status,
							"searchVo.issueId": issueId,
							"searchVo.imei": imei,
							"searchVo.contact": contact,
							"searchVo.crashDetail": crashDetail,
							"searchVo.os": os,
							"searchVo.processor": processor,
							"searchVo.begDate": begTimeStr,
							"searchVo.endDate": endTimeStr,
							"searchVo.type": crashType,
							"searchVo.errorType": errStr,
							"searchVo.allData": all,
							"searchVo.country": getCountry(),
						};
						isClickFlag = true;
						isShow = true;
					} else {
						data = {
							"searchVo.packageId": packageId,
							"searchVo.platformId": pMethod.platformId,
							"searchVo.offset": issue_offset,
							"searchVo.pageSize": issue_pageSize,
							"searchVo.version": encodeURIComponent(version),
							"searchVo.osVersion": encodeURIComponent(osVersion),
							"searchVo.ft": encodeURIComponent(ft),
							"searchVo.status": status,
							"searchVo.issueId": issueId,
							"searchVo.imei": imei,
							"searchVo.contact": contact,
							"searchVo.crashDetail": crashDetail,
							"searchVo.os": os,
							"searchVo.processor": processor,
							"searchVo.begDate": beginTime,
							"searchVo.endDate": endTime,
							"searchVo.type": ctype,
							"searchVo.errorType": error,
							"searchVo.allData": all,
							"searchVo.country": getCountry(),
						};
					}

					data['searchVo.query'] = null;

					var request = {
						url: issue_count_url,
						type: 'post',
						dataType: "json",
						data: data,
						timeout: 120000,
						success: function(count_json) {
							if (countChangeCache[uuid] === true) {
								issue_pageCache = [];
								if (count_json.count == 1500) {
									issue_page_total.text('查询结果: 大于' + $.encoder.encodeForHTML(count_json.count));
								} else {
									issue_page_total.text('查询结果: ' + $.encoder.encodeForHTML(count_json.count));
								}
								PMethod.prototype.changePageStyle(count_json.count);
							}
						}
					};

					$.ajax(request).fail(function(jqxhr, textStatus, error) {
						var err = '';
						if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
							err = '服务器繁忙, 请稍后重试 !';
						} else {
							err = '系统错误, 请联系企业微信: bugly助手 !';
						}

						// alert(err);
					});

					clearInterval(sh);
				}
			}, 100);
		}
	};

	var needCheck = function(id) {
		var curPage = issue_offset / issue_pageSize + 1;
		var inCheckArray = check_pageCache[curPage];

		if (inCheckArray !== undefined && inCheckArray !== null) {
			for (var j = 0; j < inCheckArray.length; j++) {
				if (id == inCheckArray[j]) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * 克隆对象
	 */
	var clone = function(object) {
		if (typeof(object) != 'object')
			return object;

		if (object === null)
			return object;

		var newObj = null;

		if (typeof(object.length) == 'number' && typeof(object.splice) == 'function')
			newObj = [];
		else
			newObj = [];

		for (var i in object)
			newObj[i] = clone(object[i]);

		return newObj;
	};

	var getCheckNum = function() {
		var checkNum = 0;
		if (check_pageCache === undefined || check_pageCache === null) {
			return checkNum;
		}

		var inCheckArray = null;
		for (var i = 0; i < check_pageCache.length; i++) {
			inCheckArray = check_pageCache[i];
			if (inCheckArray !== undefined && inCheckArray !== null) {
				for (var j = 0; j < inCheckArray.length; j++) {
					if (inCheckArray[j] !== undefined && inCheckArray[j] !== null && inCheckArray[j] != -1) {
						checkNum = checkNum + 1;
					}
				}
			}
		}

		return checkNum;
	};

	/**
	 * 设置frame高度，用于嵌入rdm
	 */
	function setAuto() {
		try {
			var iframe = document.getElementById("iframec");
			var temp = $(iframe);
			temp.show();
			var tempHeight = temp.offset()['top'];
			temp.hide();
			var aHeight = tempHeight; // $(document).height();
			var bWidth = window.screen.width;

			var height = aHeight;

			if (height < 600) {
				height = 600; // frame有一个最小高度
				$("#body").height(600); // body也有一个最小高度
			}
			$('.popwin-mask').css({
				'height': height
			}); // 设置mask的高度

			height += 20;
			var width = bWidth - 100; // Math.max(aWidth, bWidth);// 取最高值;
			var hashH = width + "," + height;
			var url = "http://rdm.wsd.com/inner.html?r=" + Math.round(Math.random() * 10000); // 不同域名下，这个url要改
			iframe.contentWindow.location.replace(url + "#" + hashH);

		} catch (e) {}
	}

	var more_hide = true; // 标识值, 标识当前是否有问题列表展开了
	var more_option = $('#more-option');

	var status_select = $('#status-select'); // 状态下拉选项
	var product_select = $('#prod-select');
	var pack_select = $('#pack-select');
	var ver_select = $('#ver-select');
	var ver_select2 = $('#ver-select2');
	var ft_select = $('#ft-select');
	var type_select = $('#type-select');
	var issue_id_input = $('#issue-id-input');
	var imei_input = $('#imei-input');
	var osVersion_input = $('#osVerison-input');
	var contact_input = $('#contact-input');
	var crash_detail_input = $('#crash-detail-input');
	var remark_input = $('#remark-input');
	var country_input = $('#country-select');
	var dateRange = new pickerDateRange('dateput', {
		isTodayValid: true,
		startDateId: 'begin-time-input',
		endDateId: 'end-time-input',
		needCompare: false,
		defaultText: ' 至 ',
		target: 'datecontain',
		autoSubmit: true,
		theme: 'ta',
		calendars: 1,
		success: function(obj) {}
	});
	var dateput = $('#dateput');
	var begin_time_input = $('#begin-time-input');
	var end_time_input = $('#end-time-input');
	var os_input = $('#os-input');
	var error_input = $('#error-input');
	// var processor_input = $('#processor-input');
	var excel_btn = $('#excel-btn');

	var productId = '';
	var platformId = '';
	var packageId = '';
	var version = '';
	var excludeVersion = '';
	var osVersion= '';
	var ft = '';
	var status = '';
	var issueId = '';
	var imei = '';
	var contact = '';
	var crashDetail = '';
	var remarkVal = '';
	var os = '';
	var processor = '';
	var beginTime = '';
	var endTime = '';
	var ctype = '';
	var error = '';
	var all = 'hide';
	var country = "";
	var url = null;

	function PMethod() {
		this.productId = "";
		this.platformId = "1";
		this.packageId = "";
		this.errorType = "";
		this.pageSize = 10;
		this.updateTime = "";
		this.version = "";
		this.excludeVersion = "";
		this.osVersion = "";
		this.status = -1;
		this.ft = "";
	}

	var issue_page_total = $('#issue-page-total');
	var issue_more_input = $('#issue-more-input');
	var issue_all_page = $('#issue-all-page');
	var issue_page_1 = $('#issue-page-1');
	var issue_page_2 = $('#issue-page-2');
	var issue_page_3 = $('#issue-page-3');
	var issue_page_num = $('#issue-page-num');
	var issue_page_more = $('#issue-page-more');
	var issue_pageArray = new Array(issue_page_1, issue_page_2, issue_page_3);
	var issue_pageSize = 50;
	var issue_offset = 0;
	var issue_allPageNum = 0;
	var issue_detail_show = null;
	var issue_pageCache = [];
	var countChangeCache = [];
	var count_change = true;
	var count_change_done = false;
	var problem_done = false;

	PMethod.prototype = {
		changePageStyle: function(count) {
			issue_page_1.hide();
			issue_page_2.hide();
			issue_page_3.hide();
			issue_page_num.hide();
			issue_page_more.hide();

			var page = issue_offset / issue_pageSize + 1;

			if (count == -1 && count_change_done === false) {
				issue_allPageNum = 1000000;

				if (problem_done === true) {
					count_change_done = true;
					if(isClickFlag == false && isShow == false){
						isShow = true;
						$('#hidden-option').trigger('click');
					}
				}
			} else if (count % issue_pageSize === 0) {
				issue_allPageNum = parseInt(count / issue_pageSize, 10);
			} else if (count != -1) {
				issue_allPageNum = parseInt(count / issue_pageSize, 10) + 1;
			}

			if (issue_allPageNum == 1000000) {
				issue_page_more.show();
				issue_more_input.val(page);
				issue_all_page.text('');
			} else if (issue_allPageNum <= 3) {
				issue_page_num.show();

				for (var i = 0; i < issue_allPageNum; i++) {
					issue_pageArray[i].show();

					if ((i + 1) == page) {
						issue_page_1.removeClass('hover');
						issue_page_2.removeClass('hover');
						issue_page_3.removeClass('hover');

						issue_pageArray[i].addClass('hover');
					}
				}

				countChangeCache = [];
				count_change = false;
			} else {
				issue_page_more.show();
				issue_more_input.val(page);
				issue_all_page.text('/ ' + issue_allPageNum + ' 页');

				countChangeCache = [];
				count_change = false;
			}
		},

		history: function(json) {
			if (json !== undefined && json !== null) {
				this.productId = json.productId;
				this.packageId = json.packageId;
				this.version = json.version;
				this.pageSize = json.pageSize;
				this.errorType = json.errorType;
				this.updateTime = json.updateTime;
				this.status = json.status;
				this.platformId = json.platformId;
				this.ft = json.ft;
			}
			$("#status-select option[value='" + this.status + "']").attr('selected', true);
		},

		initProductSelect: function(json) {
			if (json != undefined && json != null) {
				$('#prod-select option').remove();

				var text = "";
				for (var i = 0; i < json.length; i++) {
					text += "<option value=\"" + htmlFilter(json[i].rdmProductId) + "~" + htmlFilter(json[i].crashPlatformId) + "\">" +
						htmlFilter(json[i].name) + "</option>";
				}

				product_select.append(text);
			}
		},

		initSelect: function(json) {
			if (json != undefined && json != null) {
				selectCache = json;

				$('#pack-select option').remove();

				var pack = null;
				var text = "";
				var versions = null;
				var fts = null;
				for (var i = 0; i < json.length; i++) {
					pack = json[i];

					text += "<option value=\"" + htmlFilter(pack.packageId) + "\">" + htmlFilter(pack.packageId) + "</option>";

					if (pack.packageId == this.packageId) {
						versions = pack.versions;
						fts = pack.fts;
					}
				}
				pack_select.append(text);
				$("#pack-select option[value='" + this.packageId + "']").attr('selected', true);
//				Util.getBuglyAppId(this.packageId, platformIdParam);
				getAppIdUrl(this.packageId, platformIdParam);
				if (!versions || !fts) {
					var id = pack_select.val();
					pMethod.packageId = id;
					for (var i = 0; i < json.length; i++) {
						pack = json[i];

						if (pack.packageId == id) {
							versions = pack.versions;
							fts = pack.fts;
						}
					}
				}

				if (versions != undefined && versions != null) {
					$('#ver-select option').remove();

					text = "<option value=''>所有版本</option>";
					for (var i = 0; i < versions.length; i++) {
						text += "<option value=\"" + htmlFilter(versions[i]) + "\">" + htmlFilter(versions[i]) + "</option>";
					}

					ver_select.append(text);

					if(ver_select2 && ver_select2.length > 0) {
						$('#ver-select2 option').remove();

						text = "<option value=''>所有版本</option>";
						for (var i = 0; i < versions.length; i++) {
							text += "<option value=\"" + htmlFilter(versions[i]) + "\">" + htmlFilter(versions[i]) + "</option>";
						}
						ver_select2.append(text);
					}
				} else {
					text = "<option value=''>所有版本</option>";
					ver_select.append(text);

					if(ver_select2 && ver_select2.length > 0) {
						ver_select2.append(text);
					}
				}

				if (fts) {
					ft_select.empty();

					text = "<option value=''>所有FT</option>";
					for (var i = 0; i < fts.length; i++) {
						text += "<option value=\"" + htmlFilter(fts[i]) + "\">" + htmlFilter(fts[i]) + "</option>";
					}
					ft_select.append(text);
				} else {
					text = "<option value=''>所有FT</option>";
					ft_select.append(text);
				}

				if (this.version != undefined && this.version != null && this.version != "") {
					isExistVersionFlag = Util.isExistVersion(this.version,versions);
					if(!isExistVersionFlag){
						this.version = " ";
					}
					$("#ver-select option[value='" + this.version + "']").attr('selected', true);
					$('#problem-search-btn').trigger('click');
				}
				if (this.ft && $.trim(this.ft) != "") {
					$("#ft-select option[value='" + this.ft + "']").attr('selected', true);
				}
			} else {
				$('#pack-select option').remove();
				$('#ver-select option').remove();

				var text = "<option >none</option>";
				pack_select.append(text);
				ver_select.append(text);
			}

			var chzn = $(".chzn-select");
			chzn.trigger("liszt:updated");
		}
	}
	var pMethod = new PMethod();
	/**
	 * 显示loading
	 */
	function showLoading() {
		var mask = $('.popwin-mask');
		$("#loading").show();
		mask.show();
	}
	/**
	 * 隐藏loading
	 */
	function hideLoading() {
		$("#loading").hide();
		$('.popwin-mask').hide();
	}

	var issuePageChange = function() {
		var curPage = issue_offset / issue_pageSize + 1;
		var proxy = issueStore.getProxy();
		if (proxy && proxy.extraParams) {
			proxy.extraParams.requestcount = undefined;
		}
		issueStore.loadPage(curPage);
	};

	issue_page_1.click(function() {
		issue_offset = 0;
		issue_page_1.addClass('hover');
		issue_page_2.removeClass('hover');
		issue_page_3.removeClass('hover');

		issuePageChange();
		return false;
	});
	issue_page_2.click(function() {
		issue_offset = issue_pageSize;
		issue_page_2.addClass('hover');
		issue_page_1.removeClass('hover');
		issue_page_3.removeClass('hover');

		issuePageChange();
		return false;
	});
	issue_page_3.click(function() {
		issue_offset = 2 * issue_pageSize;
		issue_page_3.addClass('hover');
		issue_page_2.removeClass('hover');
		issue_page_1.removeClass('hover');

		issuePageChange();
		return false;
	});

	$('#issue-list-prev').click(function() {
		var curPage = issue_offset / issue_pageSize + 1;
		if (curPage <= 1)
			return;

		issue_more_input.val(curPage - 1);
		issue_offset -= issue_pageSize;
		issuePageChange();

		return false;
	});
	$('#issue-list-next').click(function() {
		var curPage = issue_offset / issue_pageSize + 1;
		if (curPage >= issue_allPageNum)
			return;

		issue_more_input.val(curPage + 1);
		issue_offset += issue_pageSize;
		issuePageChange();

		return false;
	});

	var expandAction = function(issueId) {
		var ul = $('#' + issueId + '');

		var data = {
			'packageId': packageId,
			'platformId': platformId,
			'mergeId': issueId
		};

		if (doneArray[issueId] !== true) {
			var request = {
				url: issue_detail_url,
				type: 'get',
				dataType: "json",
				data: data,
				timeout: 40000,
				success: function(json) {
					if (json !== undefined && json !== null) {
						ul.children().remove();
						ul.append(json.stack);
						doneArray[issueId] = true;
					}

					setTimeout(function() {
						$('#loading-' + issueId).text('');
					}, 1500);
				}
			};

			$.ajax(request).fail(function(jqxhr, textStatus, error) {
				var err = '';
				if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
					err = '5.服务器繁忙, 请稍后重试 !';
				} else {
					err = '系统错误, 请联系企业微信: bugly助手 !';
				}

				// alert(err);

				doneArray[issueId] = false;

				setTimeout(function() {
					$('#loading-' + issueId).text('');
				}, 1500);
			});
		}
	};

	$('#hidden-option').click(function() {
		if (more_hide == true) {
			more_option.show(100, function() {
				fixFrame();
			});

			$(this).text('隐藏选项');
			more_hide = false;
		} else {
			more_option.hide(100, function() {
				fixFrame();
			});

			$(this).text('高级选项');
			more_hide = true;
		}
	});
	/**
	 * 弃用改函数，改用jquery encoder的相应方法
	 */
	var htmlFilter = function(content) {
		if (typeof(content) == 'string')
			return content.replace(/<.*?>/g, '');
		else
			return content;
	};

	pack_select.change(function() {
		packSelectChange();
	});

	var packSelectChange = function() {
		var value = pack_select.val();
		console.log("value",value);
//		Util.getBuglyAppId(value, platformIdParam);
		getAppIdUrl(value, platformIdParam);
		var versions = null;
		var fts = null;
		var text = null;

		for (var i = 0; i < selectCache.length; i++)
			if (selectCache[i].packageId == value) {
				if(selectCache[i].versions && selectCache[i].versions.length){
					versions = selectCache[i].versions;
					versions = Util.getFilterVersions(versions);
					fts = selectCache[i].fts;
					break;
				}
			}

		$('#ver-select option').remove();
		text = "<option value=''>所有版本</option>";

		if (versions != undefined && versions != null) {
			for (var i = 0; i < versions.length; i++) {
				text += "<option value=\"" + htmlFilter(versions[i]) + "\">" + htmlFilter(versions[i]) + "</option>";
			}
		}
		ver_select.append(text);
		ver_select.trigger("liszt:updated");

		if(ver_select2 && ver_select2.length > 0) {
			$('#ver-select2 option').remove();
			ver_select2.append(text);
			ver_select2.trigger("liszt:updated");
		}

		ft_select.empty();
		text = "<option value=''>所有FT</option>";
		if (fts) {
			for (var i = 0; i < fts.length; i++) {
				text += "<option value=\"" + htmlFilter(fts[i]) + "\">" + htmlFilter(fts[i]) + "</option>";
			}
		}
		ft_select.append(text);
		ft_select.trigger("liszt:updated");

		var request = {
			type: 'get',
			dataType: "json",
			timeout: 40000
		};

		var prId = null;
		var plId = null;
		if (productIdParam !== undefined && productIdParam !== null && productIdParam !== '') {
			prId = productIdParam;
			plId = platformIdParam;

			pMethod.productId = prId;
			pMethod.platformId = plId;
		} else {
			var pValue = product_select.val();
			var productArray = pValue.split('~');
			prId = productArray[0];
			plId = productArray[1];
		}
	};

	var canSearch = true;
	$('#problem-search-btn').click(function() {
		if (canSearch) {
			all = 'hide';
			searchList();
			check_pageCache.length = 0;
			status_btn.text('修改状态(0)');
			canSearch = false;
			$('#problem-search-btn').addClass('disable');
			$('#detail-search-btn').addClass('disable');
		}
	});

	$('#version-compare-search').click(function() {

		if(!ver_chzn.result_value() || !ver_chzn2.result_value()) {
			alert('请正确选择对比版本再查询！')
			return;
		}
		if (canSearch) {
			all = 'hide';
			searchList();
			check_pageCache.length = 0;
			status_btn.text('修改状态(0)');
			canSearch = false;
			$('#problem-search-btn').addClass('disable');
			$('#detail-search-btn').addClass('disable');
		}
	});


	dateput.change(function() {
		var value = dateput.val();

		if (value === undefined || value === null || value === '') {
			begin_time_input.val('');
			end_time_input.val('');
		}
	});


	var searchList = function() {
		var prId = null;
		if (productIdParam !== undefined && productIdParam !== null && productIdParam !== '') {
			prId = productIdParam;
		} else {
			var pValue = product_select.val();
			var productArray = pValue.split('~');
			prId = productArray[0];
		}

		packageId = pack_select.val();
		// version = ver_select.val();
		if(ver_chzn){
			version = ver_chzn.result_value();
		} else {
			version = pMethod.version;
		}
		if(ver_chzn2){
			excludeVersion = ver_chzn2.result_value();
		} else {
			excludeVersion = pMethod.excludeVersion;
		}
		updateSearchContent();

		issue_offset = 0;
		issue_pageSize = 50;

		if(excludeVersion && excludeVersion !== '') {
			issue_pageSize = 5000;
		}

		var data = {
			"searchVo.productId": prId,
			"searchVo.packageId": packageId,
			"searchVo.platformId": pMethod.platformId,
			"searchVo.version": encodeURIComponent(version),
			"searchVo.excludeVersion": encodeURIComponent(excludeVersion),
			"searchVo.osVersion": encodeURIComponent(osVersion),
			"searchVo.ft": encodeURIComponent(ft),
			"searchVo.status": status,
			"searchVo.issueId": issueId,
			"searchVo.imei": imei,
			"searchVo.contact": contact,
			"searchVo.crashDetail": crashDetail,
			"searchVo.remark": remarkVal,
			"searchVo.os": os,
			"searchVo.processor": processor,
			"searchVo.begDate": beginTime,
			"searchVo.endDate": endTime,
			"searchVo.type": ctype,
			"searchVo.errorType": error,
			"searchVo.allData": all,
			"searchVo.country": getCountry(),
		};

		var proxy = issueStore.getProxy();
		proxy.url = issue_list_url;
		proxy.extraParams = data;
		issueStore.loadPage(1);
		count_change = true;
		count_change_done = false;
		check_pageCache = [];

		/*if($.trim(imei).length > 0) {
			imei += '-imei';
		}
		if($.trim(contact).length > 0) {
			contact += '-qua';
		}*/

		if (URL.target == "new_rdm") {
			var subUrl = 'product?target=new_rdm&productId=' + productIdParam + '&pack=' + packageId + '&version=' + version + '&ft=' +
				ft + '&issue=' + issueId + '&imei=' + imei + '&processor=' + processor + '&contact=' + contact + '&hardwareOs=' +
				os + '&detail=' + crashDetail + '&begin=' + beginTime + '&end=' + endTime + '&status=' + status + "&osVersion=" + osVersion;

			messageEvent.postModel("exception", subUrl);
		}

		return false;
	};

	var fixFrame = function() {
		// 如果是新框架，则调用下面的方法
		if (URL.target == "new_rdm") {
			messageEvent.postSize();
		}
	};

	var ver_chzn = null;
	var ver_chzn2 = null;
	var prettfySelect = function() {
		status_select.chosen({
			no_results_text: "no matching."
		});
		type_select.chosen({
			no_results_text: "no matching."
		});
		getCountry() && country_input.chosen({
			no_results_text: "no matching."
		});
		product_select.chosen({
			no_results_text: "no matching."
		});
		pack_select.chosen({
			no_results_text: "no matching."
		});
		ver_chzn = ver_select.chosen({
			custom_input: true,
			no_fuzzy: false,
			no_results_text: "no matching."
		}).data('chosen');
		ver_chzn2 = ver_select2.chosen({
			custom_input: true,
			no_fuzzy: false,
			no_results_text: "no matching."
		}).data('chosen');
		ft_select.chosen({
			no_results_text: "no matching."
		});
	};

	URL.packParam = $.query.get('pack');
	URL.versionParam = $.query.get('version');
	URL.version2Param = $.query.get('excludeVersion');
	URL.issueIdParam = $.query.get('issue');
	URL.imeiParam = $.query.get('imei') + '';
	URL.processorParam = $.query.get('processor');
	URL.contactParam = $.query.get('contact') + '';
	URL.hardwareOsParam = $.query.get('hardwareOs');
	URL.detailParam = $.query.get('detail');
	URL.beginParam = $.query.get('begin');
	URL.endParam = $.query.get('end');
	URL.statusParam = $.query.get('status');
	URL.ft = $.query.get('ft');
	URL.osVersionParam = $.query.get('osVersion');
	URL.countryParam = $.query.get('country');

	var initProblemPage = function(mode) {
		if (searchCount == 0) {
			initProblemPageStart = new Date().getTime();
		} else {
			initProblemPageStart = 0;
		}
		var pdatas = null;

		$.ajaxSettings.async = false;

		var prId = null;
		var plId = null;
		if (productIdParam && productIdParam !== '') {
			prId = productIdParam;
			plId = platformIdParam;

			pMethod.productId = prId;
			pMethod.platformId = plId;
		} else {
			showLoading();

			var value = product_select.val();
			var productArray = value.split('~');
			prId = productArray[0];
			plId = productArray[1];
		}

		data = {
			"searchVo.productId": prId,
			"searchVo.platformId": plId
		}

		var request = {
			url: packageid_url,
			type: 'get',
			dataType: "json",
			data: data,
			timeout: 40000,
			success: function(json) {
				pdatas = json;
				setTimeout(function() {
					pMethod.initSelect(json, mode);
					(function(data) {
						if (data.packParam && data.packParam !== '' && data.packParam != 'true' &&
							data.packParam != true) {
							$('#pack-select option').attr('selected', false);
							$('#pack-select option[value="' + data.packParam + '"]').attr('selected', true);
							packSelectChange();

						}
						if (data.versionParam && data.versionParam !== '' &&
							data.versionParam != 'true' && data.versionParam != true) {
							if (data.versionParam.indexOf('.*') > -1) {
								// ver_chzn.set_result_value(data.versionParam);
							} else {
								$('#ver-select option').attr('selected', false);
								$('#ver-select option[value="' + data.versionParam + '"]').attr('selected', true);
							}
						}
						if (data.ft && data.ft !== '' && data.ft != 'true' && data.ft != true) {
							$('#ft-select option').attr('selected', false);
							$('#ft-select option[value="' + data.ft + '"]').attr('selected', true);
						}
						prettfySelect();
						if (data.versionParam != true && data.versionParam.indexOf('.*') > -1) {
							ver_chzn.set_result_value(data.versionParam);
						}

						if (data.version2Param ) {
							ver_chzn2.set_result_value(data.version2Param);
						}
					})(URL);
				}, 1000);
			}
		};

		$.ajax(request).fail(function(jqxhr, textStatus, error) {
			var err = '';
			if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
				err = '7.服务器繁忙, 请稍后重试 !';
			} else {
				err = '系统错误, 请联系企业微信: bugly助手 !';
			}

			alert(err);

			hideLoading();
		});

		all = 'hide';

		$.ajaxSettings.async = true;

		// 初始化所有查询条件
		issue_id_input.val('');
		imei_input.val('');
		contact_input.val('');
		crash_detail_input.val('');
		remark_input.val('');
		os_input.val('');
		dateput.val('');
		begin_time_input.val('');
		end_time_input.val('');
		osVersion_input.val('');
		$('#processor-input').val('');
		$('#processor-inputValue').val('');
		$('#country-select')[0] && $('#country-select').val('');

		var data = (function(data) {
			try {
				if (data.statusParam === 0 || (data.statusParam && data.statusParam !== '' && data.statusParam != 'true' &&
					data.statusParam !== true)) {
					$('#status-select option').attr('selected', false);
					$('#status-select option[value="' + data.statusParam + '"]').attr('selected', true);
				}
				if (data.issueIdParam !== undefined && data.issueIdParam !== null && data.issueIdParam !== '' &&
					data.issueIdParam != 'true' && data.issueIdParam != true) {
					issue_id_input.val(data.issueIdParam);
				}
				if (data.imeiParam !== undefined && data.imeiParam !== null && data.imeiParam !== '' && data.imeiParam != 'true' &&
					data.imeiParam != true) {
					imei_input.val(data.imeiParam);
				}
				if (data.processorParam !== undefined && data.processorParam !== null && data.processorParam !== '' &&
					data.processorParam != 'true' && data.processorParam != true) {
					$('#processor-input').val(data.processorParam);
					$('#processor-inputValue').val(data.processorParam);
				}
				if (data.contactParam !== undefined && data.contactParam !== null && data.contactParam !== '' &&
					data.contactParam != 'true' && data.contactParam != true) {
					contact_input.val(data.contactParam);
				}
				if (data.hardwareOsParam !== undefined && data.hardwareOsParam !== null && data.hardwareOsParam !== '' &&
					data.hardwareOsParam != 'true' && data.hardwareOsParam != true) {
					os_input.val(data.hardwareOsParam);
				}
				if (data.detailParam !== undefined && data.detailParam !== null && data.detailParam !== '' &&
					data.detailParam != 'true' && data.detailParam != true) {
					crash_detail_input.val(data.detailParam);
				}
				if (data.beginParam !== undefined && data.beginParam !== null && data.beginParam !== '' && data.beginParam != 'true' &&
					data.beginParam != true) {
					begin_time_input.val(data.beginParam);
				}
				if (data.endParam !== undefined && data.endParam !== null && data.endParam !== '' && data.endParam != 'true' &&
					data.endParam != true) {
					end_time_input.val(data.endParam);
					dateput.val(data.beginParam + ' 至 ' + data.endParam);
				}
				if (data.countryParam !== undefined && data.countryParam !== null && data.countryParam !== '' && data.countryParam != 'true' &&
					data.countryParam != true) {
					$('#country-select')[0] && $('#country-select').val(data.countryParam);
				}
			} catch (e) {}

			/*packageId = pack_select.val();
			version = ver_chzn.result_value();
			ft = ft_select.val();*/
			if (data.packParam && data.packParam !== '' && data.packParam != 'true' &&
				data.packParam != true) {
				packageId = data.packParam;
			}
			if (data.versionParam && data.versionParam !== '' &&
				data.versionParam != 'true' && data.versionParam != true) {
				version = data.versionParam;
			}
			if (data.osVersionParam && data.osVersionParam !== '' &&
				data.osVersionParam != 'true' && data.osVersionParam != true) {
				osVersion = data.osVersionParam;
			}
			if (data.countryParam && data.countryParam !== '' &&
				data.countryParam != 'true' && data.countryParam != true) {
				countryParam = data.countryParam;
			}
			if (data.ft && data.ft !== '' && data.ft != 'true' && data.ft != true) {
				ft = data.ft;
			}
			if($.trim(packageId).length === 0) {
				if($.trim(pMethod.packageId).length > 0) {
					packageId = pMethod.packageId;
					if($.trim(pMethod.version).length > 0) {
						version = pMethod.version;
					} else {
						version = '';
					}
					if($.trim(pMethod.ft).length > 0) {
						ft = pMethod.ft;
					} else {
						ft = '';
					}
				} else if(pdatas && pdatas.length > 0) {
					packageId = pdatas[0].packageId;
				}
			}
			status = status_select.val() || '';
			issueId = issue_id_input.val() || '';
			imei = imei_input.val() || '';
			contact = contact_input.val() || '';
			crashDetail = crash_detail_input.val() || '';
			os = os_input.val() || '';
			processor = $('#processor-input').val() || '';
			beginTime = begin_time_input.val() || '';
			endTime = end_time_input.val() || '';
			ctype = type_select.val() || '';
			error = error_input.val() || '';
			osVersion = osVersion_input.val() || '';
			country = $('#country-select').val() || '';
			var isSearch = $.query.get('isSearch');
			var result = {};
			if(isSearch == 1){
				var crashType =  decodeURIComponent($.query.get('crashType'));
				if(crashType == "all"){
					crashType = "All";
				} else if(crashType == "normal"){
					crashType = "Crash";
				} else if(crashType == "native"){
					crashType = "Native";
				} else if(crashType == "catched"){
					crashType = "Catched";
				} else if(crashType == "anr"){
					crashType = "ANR";
				}
				var crashVersion = decodeURIComponent($.query.get('crashVersion'));
				if(crashVersion == "all"){
					crashVersion = "";
				}
				var bundleId = decodeURIComponent($.query.get('bundleId'));
				var errStr = decodeURIComponent($.query.get('errtype'));
				var begTimeStr = decodeURIComponent($.query.get('crashTime'));
				var endTimeStr = decodeURIComponent($.query.get('crashTime'));
				var osVersionStr = decodeURIComponent($.query.get('osVersion'));
				result = {
					"searchVo.packageId": bundleId,
					"searchVo.platformId": pMethod.platformId,
					"searchVo.version": crashVersion,
					"searchVo.osVersion": osVersionStr,
					"searchVo.status": status,
					"searchVo.issueId": issueId,
					"searchVo.imei": imei,
					"searchVo.contact": contact,
					"searchVo.crashDetail": crashDetail,
					"searchVo.os": os,
					"searchVo.processor": processor,
					"searchVo.begDate": begTimeStr ,
					"searchVo.endDate": endTimeStr,
					"searchVo.ft": encodeURIComponent(ft),
					"searchVo.type": crashType,
					"searchVo.errorType": errStr ,
					"searchVo.allData": all,
					"searchVo.country": country,
					requestcount: 1
				};
				showSearchInput(bundleId,crashType, crashVersion, errStr,begTimeStr,endTimeStr, osVersionStr);
			} else {
				result = {
					"searchVo.packageId": packageId,
					"searchVo.platformId": pMethod.platformId,
					"searchVo.version": encodeURIComponent(version),
					"searchVo.osVersion": encodeURIComponent(osVersion),
					"searchVo.status": status,
					"searchVo.issueId": issueId,
					"searchVo.imei": imei,
					"searchVo.contact": contact,
					"searchVo.crashDetail": crashDetail,
					"searchVo.os": os,
					"searchVo.processor": processor,
					"searchVo.begDate": beginTime,
					"searchVo.endDate": endTime,
					"searchVo.ft": encodeURIComponent(ft),
					"searchVo.type": ctype,
					"searchVo.errorType": error,
					"searchVo.allData": all,
					"searchVo.country": country,
					requestcount: 1
				};
			}
			return result;
		})(URL);

		var execute = function() {
			//console.log("init search");
			//console.log(issueStore);
			if (issueStore) {
				var proxy = issueStore.getProxy();
				// proxy.url = url;
				proxy.url = issue_list_url;
				proxy.extraParams = data;
				if (searchCount == 0) { // 第一次进行数据拉取前，此时searchCount还是0
					firstLoadStart = new Date().getTime();
				} else {
					firstLoadStart = 0;
				}

				issueStore.loadPage(1);
				problem_done = true
				count_change = true;
				count_change_done = false;
				hideLoading();

				/*productId = prId;
				platformId = plId;
				packageId = pack_select.val();
				// version = ver_select.val();
				version = ver_chzn.result_value();
				status = status_select.val();*/

				check_pageCache = [];
				check_num = 0;
				status_btn.text('修改状态(' + check_num + ')');
				getFiles();
			} else {
				setTimeout(function(){
					execute();
				}, 100);
			}
		};
		//问题列表，非版本比较执行初始化查询
		if($('#ver-select2').length == 0) {
			execute();
		}
	};

	var updateSearchContent = function () {
		ft = ft_select.val() || '';
		status = status_select.val() || '';
		issueId = issue_id_input.val() || '';
		imei = imei_input.val() || '';
		osVersion = osVersion_input.val() || '';
		contact = contact_input.val() || '';
		crashDetail = crash_detail_input.val() || '';
		remarkVal = remark_input.val() || '';
		os = os_input.val() || '';
		processor = $('#processor-input').val() || '';
		beginTime = begin_time_input.val() || '';
		endTime = end_time_input.val() || '';
		ctype = type_select.val() || '';
		error = error_input.val() || '';
	};

	excel_btn.click(function() {
		updateSearchContent();
		window.open("list/issue!excel?isStatics=true&productId=" + productIdParam + "&searchVo.packageId=" + packageId +
			"&searchVo.platformId=" + pMethod.platformId + "&searchVo.version=" + encodeURIComponent(version) + "&searchVo.ft=" +
			encodeURIComponent(ft) + "&searchVo.status=" + status + "&searchVo.issueId=" + issueId + "&searchVo.imei=" + imei + "&searchVo.contact=" +
			contact + "&searchVo.crashDetail=" + encodeURIComponent(crashDetail) + "&searchVo.os=" + os + "&searchVo.processor=" + processor +
			"&searchVo.begDate=" + beginTime + "&searchVo.endDate=" + endTime + "&searchVo.allData=" + all + "&searchVo.type=" + ctype);
	});

	var getFiles = function() {
		require.async("http://tdl.oa.com/tfl/css/tfl-dropdown.css?v=20130620", function() {
			require.async("http://tdl.oa.com/tfl/js/tfl-core.js", function() {
				require.async("http://tdl.oa.com/tfl/js/tfl-userchooser.js?v=20130620", function() {
					require.async("http://top.oa.com/js/users.js", function() {});
				});
			});
		});
	};

	var batch_status_url = "list/issue!batchStatus?isStatics=true&productId=" + productIdParam; // 批量修改状态

	var issues_modifyStatusPop = $('#issues-modifyStatusPop');
	var issues_span = $('#issues-span');
	// var issues_assigner = $('#issues-assigner');
	var issues_assignerValue = $('#issues-assignerValue');
	var issues_remark = $('#issues-remark');
	var issues_isMail = $('#issues-isMail');
	var issues_loading = $('#issue-loading');
	var issues_popwin_mask = $('.issues-popwin-mask');
	var popwin_mask = $('.popwin-mask');
	var status_btn = $('#status-btn');

	var issues_num = $('#issues-num');

	var getCheckedIds = function() {
		var ids = '';

		if (check_pageCache === undefined || check_pageCache === null) {
			return ids;
		}

		var inCheckArray = null;
		for (var i = 0; i < check_pageCache.length; i++) {
			inCheckArray = check_pageCache[i];

			if (inCheckArray !== undefined && inCheckArray !== null) {
				for (var j = 0; j < inCheckArray.length; j++) {
					if (inCheckArray[j] !== undefined && inCheckArray[j] !== null && inCheckArray[j] != -1) {
						ids = ids + inCheckArray[j] + ";";
					}
				}
			}
		}
		return ids;
	};

	window.showStatusWinDelay = function(id, statuName) {
		setTimeout(function() {
			showStatusWin(id, statuName);
		}, 200);
	};

	var status_form = $('#status-form');
	var showStatusWin = function(id, statuName) {
		issues_span.text(id);
		issues_num.text(check_num);

		$('input[name=male]:checked').removeAttr('checked');
		$('#issues-assigner').val('');
		var remarkStr = getRemarkInfo();
		// issues_remark.val(remarkStr);
		var statusStr = getStatusInfo();
		var processorStr = getProcessorInfo();
		if(!editor){
			initEditor();
		}
		editor.setSource("");//先清空
		editor.setSource(remarkStr);
		$('#issues-assignerValue').val('');

		if(statuName == '已转bug' || statusStr == "6"){
			showWorkSpace('show');
		} else {
			showWorkSpace('hide');
		}
		switch (statuName) {
			case '未解决':
				$('input[name=male][value=1]').attr('checked', 'checked');
				break;
			case '解决中':
				$('input[name=male][value=2]').attr('checked', 'checked');
				break;
			case '已修复':
				$('input[name=male][value=3]').attr('checked', 'checked');
				break;
			case '已延期':
				$('input[name=male][value=4]').attr('checked', 'checked');
				break;
			case '已关闭':
				$('input[name=male][value=5]').attr('checked', 'checked');
				break;
			case '已转bug':
				$('input[name=male][value=6]').attr('checked', 'checked');
				break;
			default:
		}
		if(!statuName && statusStr != ""){
			$('input[name=male][value='+statusStr+']').attr('checked', 'checked');
		}
		if(processorStr != ""){
			$('#issues-assigner').val(processorStr+";");
			$('#issues-assignerValue').val(processorStr+";");
		}
		popwin_mask.show();
		issues_modifyStatusPop.show();
		initEditor();
		var scrollTop = $(window.parent).scrollTop();
		status_form.css('top', scrollTop + 'px').css('margin-top', '0px');
		$('#warning').text('');
		messageEvent.postSize();
	};

	status_btn.click(function() {
		var idList = getCheckedIds();
		// console.log(idList);
		if (idList !== null && idList !== '') {//弹窗，然后或者workspaceId
			showStatusWin(idList);
		} else {
			alert("请选择一个问题.");
		}
	});
	var modifyIng = false;
	var refreshList = function() {

		var proxy = issueStore.getProxy();

		var data = {
			"searchVo.packageId": packageId,
			"searchVo.platformId": pMethod.platformId,
			"searchVo.version": encodeURIComponent(version),
			"searchVo.osVersion": encodeURIComponent(osVersion),
			"searchVo.offset": issue_offset,
			"searchVo.pageSize": issue_pageSize,
			"searchVo.status": status,
			"searchVo.issueId": issueId,
			"searchVo.imei": imei,
			"searchVo.contact": contact,
			"searchVo.crashDetail": crashDetail,
			"searchVo.os": os,
			"searchVo.processor": processor,
			"searchVo.begDate": beginTime,
			"searchVo.endDate": endTime,
			"searchVo.ft": encodeURIComponent(ft),
			"searchVo.allData": all,
			"searchVo.country": country,
		};
		proxy.extraParams = data;
		proxy.url = issue_list_url;
		issueStore.loadPage(1);
		check_pageCache = [];
		hideLoading();

		issues_loading.hide();
		popwin_mask.hide();
		issues_modifyStatusPop.hide();
		issues_popwin_mask.hide();
	};

	$('#issues-modify').click(function() {
		if(modifyIng) {
			return;
		}

		modifyIng = true;
		$('#issues-modify').addClass('gray');
		$('#issues-close').addClass('gray');

		var status = $('input[name=male]:checked').val();
		var assigner = $('#issues-assigner').val();
		var editorInfoStr = "";
		if(editor){
			editorInfoStr = editor.getSource();
		}
		if (!status) {
			alert("请选择一个状态!");
			$('#issues-modify').removeClass('gray');
			$('#issues-close').removeClass('gray');
			modifyIng = false;
		} else if (status == '6') {//处理转tapd,js串行来转
			var selectModel = issueGrid.getSelectionModel();
			var selections = selectModel.getSelection();
			var datas = [];
			for(var i = 0; i < selections.length; i++) {
				var target = selections[i].data;
				target.stack = null;
				datas.push(target);
			}
			if(!datas || datas.length <= 0) {
				alert('请选择至少一个问题.');

				$('#issues-modify').removeClass('gray');
				$('#issues-close').removeClass('gray');
				modifyIng = false;
				return;
			}

			if (assigner && assigner.length > 0) {
				assigner = assigner.substring(0, assigner.length - 1);
			} else {
				assigner = '';
			}
			// var remark = issues_remark.val();
			var sendMail = false;
			var check = $('#issues-isMail').attr('checked');
			if(check && check == 'checked') {
				sendMail = true;
			}
			sendToTapd(datas,assigner,editorInfoStr,sendMail);
		} else {
			if(status == '3' || status == "5"){
				if(editorInfoStr == "" || editorInfoStr == undefined){
					$('#issues-modify').removeClass('gray');
					$('#issues-close').removeClass('gray');
					modifyIng = false;
					alert("已解决、已关闭状态时，备注信息不能为空");
					// $('#warning').text('已解决、已关闭状态时，解决备注信息不能为空');
					return ;
				}
				// } else {
				// 	$('#warning').text('');
				// }
			}
			if (assigner && assigner.length > 0) {
				assigner = assigner.substring(0, assigner.length - 1);
			} else {
				assigner = '';
			}
			var ids = issues_span.text();
			var remark = issues_remark.val();
			// var editorStr = $('.editorTxt').val();//编辑器的内容
			var mail = false;
			if (issues_isMail.attr('checked') == 'checked') {
				mail = true;
			}

			var data = {
				"statusDto.packageId": packageId,
				"statusDto.platformId": pMethod.platformId,
				"statusDto.mergeIds": ids,
				"statusDto.status": status,
				"statusDto.assigner": assigner,
				"statusDto.remark": remark,
				"statusDto.sendMail": mail,
				"statusDto.editorInfo": editorInfoStr
			};



			$.post(batch_status_url, data, function(json) {
				if (json !== undefined && json !== null) {
					if (json.rc === 0) {
						refreshList();
					} else if (json.rc == -2) {
						refreshList();
						alert("部分问题状态修改失败: " + json.msg);
					} else {
						alert("修改状态失败: " + json.msg);
					}

					$('#issues-modify').removeClass('gray');
					$('#issues-close').removeClass('gray');
					modifyIng = false;
					$('#status-btn').text('修改状态(0)');
				}
			}, 'json').fail(function(jqxhr, textStatus, error) {
				var err = '';
				if (jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
					err = '9.服务器繁忙, 请稍后重试 !';
				} else {
					err = '系统错误, 请联系企业微信: bugly助手 !';
				}
				alert(err);
				$('#issues-modify').removeClass('gray');
				$('#issues-close').removeClass('gray');
				modifyIng = false;
			});
		}
	});

	$('#issues-close').click(function() {
		if(modifyIng) {
			return;
		}

		popwin_mask.hide();
		issues_modifyStatusPop.hide();
	});

	/**
	 * html mask关闭按钮点击事件
	 */
	$('.close-btn').click(function() {
		if(typeof(pop) == 'undefined'){
			pop = $('#modifyWorkspaceIdPop');
		}
		if(typeof(popmask) == 'undefined'){
			popmask = $('.popwin-mask');
		}
		pop.css("display", "none");
		popmask.css("display", "none");
	});

	/**
	 * 监听屏幕"回车"事件,当回车的时候进行换页,总页数大于三页的时候使用
	 */
	var userReady = false;
	var editOk = false;
	var isFocus = false;
	$(document).keydown(function(event) {
		if (event.keyCode == 13) {
			userReady = false;
			if ($('#issue-more-input').is(':focus')) {
				var curPage = issue_more_input.val(); // .trim();
				if (curPage > issue_allPageNum) {
					curPage = issue_allPageNum;
					issue_more_input.val(curPage);
				} else if (curPage < 1) {
					curPage = 1;
					issue_more_input.val(curPage);
				}

				if (curPage != (issue_offset / issue_pageSize + 1)) {
					issue_offset = (curPage - 1) * issue_pageSize;
					issuePageChange();
				}
			}
		}
	});

	setInterval(function() {
		if (!userReady) {
			var target = $('#tat_table');
			if (target.length !== 0) {
				userReady = true;
				target.click(function() {
					editOk = true;
				});
			}
		}
	}, 100);

	$(document).click(function() {
		userReady = false;
	});

	$(document).ready(function() {
		var initReady = false;
		//	require.async("ext/ext-all.js", function() {
		require.async("ext/ext-test.min.js", function() {
			initPanel();
		});

		$.ajaxSettings.async = false;


		if (productIdParam && productIdParam !== '') {
			$('#prod-li').hide();

			var request = {
				url: product_relate_url,
				type: 'get',
				dataType: "json",
				data: {
					'productId': productIdParam
				},
				timeout: 30000,
				success: function(json) {
					if (json !== undefined && json !== null) {
						if (json[0] !== undefined && json[0] !== null) {
							var buglyAppId = $.trim(json[0].buglyAppId);
							if(buglyAppId.length > 0) {
								$('#new-data').show();
								$('#new-data-a').click(function() {
									var url = 'index?target=new_rdm&productId=' + productIdParam + '&bp=true';
									messageEvent.postModel("exception", url);
									window.location.href = url;
								});
							} else {
								$('#new-data').hide();
							}

							platformIdParam = json[0].crashPlatformId;
							var para = {
								type: "SIZE",
								data: {
									height: 1000
								}
							};
							messageEvent.postMessage(parent, para, '*');

							initReady = true;
						} else {
							window.location.href = 'configGuide?isStatics=true&target=new_rdm&productId=' + productIdParam;
						}
					} else {
						window.location.href = 'configGuide?isStatics=true&target=new_rdm&productId=' + productIdParam;
					}
				}
			};

			$.ajax(request).fail(function(jqxhr, textStatus, error) {
				var err = '';
				if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
					err = '2.服务器繁忙, 请稍后重试 !';
				} else {
					err = '系统错误, 请联系企业微信: bugly助手 !';
				}

				alert(err);
			});

			var data = {
				"searchVo.productId": productIdParam
			};

			request.url = issue_history3_url;
			request.data = data;
			request.success = function(json) {
				pMethod.history(json);
			};

			$.ajax(request).fail(function(jqxhr, textStatus, error) {
				var err = '';
				if (jqxhr.status === 0 || jqxhr.status == 408 || jqxhr.status == 503 || jqxhr.status == 504) {
					err = '服务器繁忙, 请稍后重试 !';
				} else {
					err = '系统错误, 请联系企业微信: bugly助手 !';
				}
			});
		} else {
		}

		$.ajaxSettings.async = true;

		if (initReady) {
			initProblemPage();
		}


		setInterval(function() {
			$('td[colspan].x-grid-cell-rowbody').attr('colspan', 11);
			$('#recent-user-panel').css('background-color', '#f5f5f5');
		}, 100);
	});
	function showSearchInput(bundleId, crashType, crashVersion, errStr, begTimeStr, endTimeStr, osVersionStr){
		$('#pack-select').val(bundleId);
		$('#ver-select').val(crashVersion);
		$('#type-select').val(crashType);
		$('#error-input').val(errStr);
		$('#begin-time-input').val(begTimeStr);
		$('#end-time-input').val(endTimeStr);
		$('#osVerison-input').val(osVersionStr);
		$('#dateput').val(begTimeStr + ' 至 ' + endTimeStr);
	}


	//把备注信息返回
	function getRemarkInfo(){
		var str = [];
		var info = "";
		if(window.remarkArr && window.remarkArr.length){
			var arr = window.remarkArr;
			for(var i = 0; i < arr.length; i++){
				if(arr[i] != -1){
					str.push(arr[i]);
				}
			}
		}
		if(str.length == 1){
			info = str[0];
		}
		return info;
		// return $.encoder.encodeForHTML(info);
	}

	//把解决人的信息返回
	function getProcessorInfo(){
		var str = [];
		var info = "";
		if(window.processorArr && window.processorArr.length){
			var arr = window.processorArr;
			for(var i = 0; i < arr.length; i++){
				if(arr[i] != -1){
					str.push(arr[i]);
				}
			}
		}
		if(str.length == 1){
			info = str[0];
		}
		return info;
		// return $.encoder.encodeForHTML(info);
	}

	//把问题状态返回
	function getStatusInfo(){
		var str = [];
		var info = "";
		if(window.statusArr && window.statusArr.length){
			var arr = window.statusArr;
			for(var i = 0; i < arr.length; i++){
				if(arr[i] != -1){
					str.push(arr[i]);
				}
			}
		}
		if(str.length == 1){
			info = str[0];
		}
		return info;
		// return $.encoder.encodeForHTML(info);
	}


	//处理tapd串行转
	var logMsg = "";
	var toTapdArr = [];
	var num = 0;
	var successMergeIdArr = [];
	var errorMergeIdArr = [];
	function sendToTapd(datas,assigner,remark,sendMail){//datas:数组
		if(datas.length){
			toTapdArr.length = 0;
			num = 0;
			logMsg = "";
			errorMergeIdArr.length = 0;
			successMergeIdArr.length = 0;
			$.each(datas,function(i,n){
				var temp = {
					productId: productIdParam,
					packageId: packageId,
					platformId: pMethod.platformId,
					details: $.toJSON([datas[i]]),
					processor: assigner,
					remark: remark,
					sendMail: sendMail
				};
				toTapdArr.push(temp);
			});
		}
		if(toTapdArr.length){
			num++;
			toTapdAction(toTapdArr[0]);//开始转tapd
		}
	}
	function toTapdAction(obj){
		if(obj){
			$.ajax({
				url: 'list/issue!batchTapd',
				type: 'post',
				dataType: "json",
				data: obj,
				timeout: 30000,
				complete: function(XMLHttpRequest, textStatus) {
					num++;
					if(XMLHttpRequest.status == 200){//成功的时候
						successMergeIdArr.push(obj['details']['mergeId']);
					} else {//失败了
						errorMergeIdArr.push(obj['details']['mergeId']);
					}
					if(num <= toTapdArr.length){
						toTapdAction(toTapdArr[num - 1]);
					} else {//完成所有请求
						$('#issues-modify').removeClass('gray');
						$('#issues-close').removeClass('gray');
						modifyIng = false;
						var message = "";
						if(errorMergeIdArr.length){
							message = "以下问题id转tapd失败：\n" + errorMergeIdArr.join() + '\n' + '稍后可以再次试试哦！';
							alert(message);
						} else {
							alert("转tapd成功了哦！");
						}
						refreshList();
					}
				}
			});
		}
	}

	$('.toEditBtn').die().live('click',function(){
		var mergeId = $(this).attr('mergeId');
		var packageId = $(this).attr('appId');
		var platformId = $(this).attr('pid');
		var backUrl = $(this).attr('data-backUrl');
		var sub = "crashContent?target=new_rdm&productId="+productIdParam+"&mergeId="+mergeId + "&packageId="+packageId+"&platformId="+platformId+"&backUrl=" + encodeURIComponent(backUrl);
		messageEvent.postModel("exception", sub);
		window.location.href = sub;
	});



	function initEditor(){
		var dom = $(".editorTxt");
		if(!editor){
			editor = dom.qrEditor({
				menu: "full", // 默认配置
				emotPath:"images/editor/editor/smiley/",
				imgUploadUrl:"upload/img!imgUpload",
				attachUploadUrl:"upload/attach!attachUpload",
				onShowDialog:function(jDialogDom, jMenuDom){
					var modCmd = jMenuDom.attr('data-cmd');
					var boxWidth = jDialogDom.find('.t_e_pop').width();
					if(modCmd == "img" || modCmd == "quote" || modCmd == "pasteword" || modCmd == "attach" || modCmd == "video" || modCmd == "code"){
						jDialogDom.css({
							'left':'50%',
							'margin-left': -(boxWidth/2) + 'px'
						});
					} else {
						jDialogDom.css({
							'margin-left': 0
						})
					}
				}
			});
		}
	}

	function getCountry(){
		return $('#country-select')[0] ? $('#country-select').val() : '';
	}

	function showCountry(){
		if(productIdParam === 'fe984efb-4334-4f25-8d2f-a9ebd71fee7c'){
			$('.country-choise').show();
		} else {
			$('.country-choise').remove();
		}
	}
	showCountry();
	let crossIssueProductIds =[
		'e518452f-0f66-4ef5-8054-44b1e53526b3',
		'1d20ea08-1e1c-4d2d-920b-f9e7cb8f8f27',
		'73d7a7fb-10d0-4589-a2ce-d5a61883aa75',
		'199d1c92-1bc7-413b-8866-86bd561c4638',
		'58206703-1ecb-4fba-88b4-d6abc56db921',
		'e272665c-7c44-4894-ac85-e8d04592db73',
		'8ca63999-944b-4628-abfa-e7572ed15146',
		'1e2c8e55-58b0-41c0-a189-83496199af72'
	];
	if( crossIssueProductIds.indexOf(productIdParam) !== -1 ) {
		$('#crash-version-compare').show();
		$('#crash-version-compare').click(function() {
			//var productId = $.query.get('productId');
			let url = "versionIssues?target=new_rdm&productId=" + productIdParam;
			messageEvent.postModel("exception", url);
			window.location.href = url
		});
	}

});