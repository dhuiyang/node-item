define(function(require, exports, module) {
	var packSelect = $('#pack-select');

	var indexModel = {
		myData: null,
		userId: null,
		packageIdList: null,
		statList: null,
		packList: null,
		handleStat: null,
		handleStore: null,
		handlePanel: null,
		handleData: [],
		vipConfigs: null,
		vipStore: null,
		vipPanel: null,
		vipData: null,
		vipCrashInfos: null,
		queryBean: {
			productId: ""
		}
	};

	var initVipPanel = function() {
		if(!indexModel.vipData) {
			return;
		}

		Ext.onReady(function() {
			Ext.QuickTips.init();
			indexModel.vipStore = eht.createVipStore();

			delete Ext.tip.Tip.prototype.minWidth;
			indexModel.vipPanel = Ext.create('Ext.grid.Panel', {
				border: false,
				hideHeaders: true,
				store: Ext.data.StoreManager.lookup('vipStore'),
				viewConfig: {
					enableTextSelection: true,
					listeners: {
						refresh: function(gridview) {
							messageEvent.postSize();
						}
					}
				},
				columns: [{
					text: '',
					flex: 1,
					align: 'center',
					dataIndex: 'zero',
					renderer: function(value, p, record, index) {
						return eht.showVipColumn(value, p);
					}
				}, {
					text: '',
					flex: 1,
					align: 'center',
					dataIndex: 'one',
					renderer: function(value, p, record, index) {
						return eht.showVipColumn(value, p);
					}
				}, {
					text: '',
					flex: 1,
					align: 'center',
					dataIndex: 'two',
					renderer: function(value, p, record, index) {
						return eht.showVipColumn(value, p);
					}
				}, {
					text: '',
					flex: 1,
					align: 'center',
					dataIndex: 'three',
					renderer: function(value, p, record, index) {
						return eht.showVipColumn(value, p);
					}
				}, {
					text: '',
					flex: 1,
					align: 'center',
					dataIndex: 'four',
					renderer: function(value, p, record, index) {
						return eht.showVipColumn(value, p);
					}
				}],
				renderTo: 'statVipTable'
			});
		});

		var sh = setInterval(function() {
			if (indexModel.vipPanel) {
				clearInterval(sh);
				indexModel.vipPanel.doLayout();
			}
		}, 100);
	};

	var initHandlePanel = function() {
		if (!indexModel.handleData) {
			return;
		}

		Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.ux.data.PagingMemoryProxy']);

		Ext.onReady(function() {
			Ext.QuickTips.init();
			indexModel.handleStore = eht.createHandleStore();

			delete Ext.tip.Tip.prototype.minWidth;
			indexModel.handlePanel = Ext.create('Ext.grid.Panel', {
				border: false,
				store: Ext.data.StoreManager.lookup('handleStore'),
				viewConfig: {
					enableTextSelection: true,
					listeners: {
						refresh: function(gridview) {
							messageEvent.postSize();
						}
					}
				},
				columns: [{
					text: '团队成员',
					flex: 1,
					align: 'left',
					dataIndex: 'processor',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=0&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;


						if(value == indexModel.userId) {
						//	console.info(record);
							indexModel.myData = record;
							return '<a href=' + url + ' target="_blank" style="color: red;">我</a>';
						} else {
							return '<a href=' + url + ' target="_blank">' + value + '</a>';
						}
					}
				}, {
					text: '未解决',
					flex: 1,
					align: 'right',
					dataIndex: 'unsolvedNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if(value == '0') {
							return value;
						}

						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=1&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;
						return '<a href=' + url + ' target="_blank">' + accounting.formatNumber(value) + '</a>';
					}
				}, {
					text: '解决中',
					flex: 1,
					align: 'right',
					dataIndex: 'solvingNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if(value == '0') {
							return value;
						}

						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=2&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;
						return '<a href=' + url + ' target="_blank">' + accounting.formatNumber(value) + '</a>';
					}
				}, {
					text: '已解决',
					flex: 1,
					align: 'right',
					dataIndex: 'resolvedNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if(value == '0') {
							return value;
						}

						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=3&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;
						return '<a href=' + url + ' target="_blank">' + accounting.formatNumber(value) + '</a>';
					}
				}, {
					text: '已延期',
					flex: 1,
					align: 'right',
					dataIndex: 'delayNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if(value == '0') {
							return value;
						}

						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=4&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;
						return '<a href=' + url + ' target="_blank">' + accounting.formatNumber(value) + '</a>';
					}
				}, {
					text: '已关闭',
					flex: 1,
					align: 'right',
					dataIndex: 'closeNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if(value == '0') {
							return value;
						}

						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=5&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;
						return '<a href=' + url + ' target="_blank">' + accounting.formatNumber(value) + '</a>';
					}
				}, {
					text: '已转BUG',
					flex: 1,
					align: 'right',
					dataIndex: 'bugNum',
					renderer: function(value, p, record, index) {
						p.tdAttr = 'data-qtip="' + value + '"';

						if(value == '0') {
							return value;
						}
						
						var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
						var sub = 'product?target=new_rdm&productId=' + indexModel.queryBean.productId +
							'&status=6&pack=' + record.data.packageId + '&processor=' + record.data.processor;
						url += encodeURIComponent(sub);
						//url = sub;
						return '<a href=' + url + ' target="_blank">' + accounting.formatNumber(value) + '</a>';
					}
				}],
				renderTo: 'statHandleTable'
			});

		});

		Ext.EventManager.onWindowResize(function() {
			indexModel.handlePanel.doLayout();
			if(indexModel.vipPanel) {
				indexModel.vipPanel.doLayout();
			}
		});

		var sh = setInterval(function() {
			if(indexModel.handlePanel) {
				clearInterval(sh);
				indexModel.handleStore.remove(indexModel.myData);
				indexModel.handleStore.insert(0, indexModel.myData.data);
				indexModel.handlePanel.doLayout();
			}
		}, 100);
	};

	function Exhibition() {};
	Exhibition.prototype = {
		showDynamic: function(source) {
			if (source) {
				var data = source.dynamics;

				if (data && data.length > 0) {
					var text = "";
					for (var i = 0; i < data.length; i++) {
						if (data[i].showContent) {
							text += data[i].showContent;
						}
					}
					text += '……';
					$('#dynamic').append(text);
				}
			}
		},

		showVipColumn: function(value, p) {
			if (value && value.name && value.item >= 0) {
				p.tdAttr = 'data-qtip="今日：' + value.todayNum + '<br />历史：' + value.allNum + '"';

				var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
				var sub = 'vipCrash?target=new_rdm&productId=' + indexModel.queryBean.productId +
					'&name=' + value.name + '&item=' + value.item;
				url += encodeURIComponent(sub);
			//	url = sub;

				var text1 = null;
				if (value.todayNum == '0') {
					text1 = ' ' + value.todayNum;
				} else {
					text1 = ' <a href=' + url + '&type=1' + ' target="_blank">' + value.todayNum + '</a>';
				}
				
				var text2 = null;
				if (value.allNum == '0') {
					text2 = ' (' + value.allNum + ')';
				} else {
					text2 = ' (<a href=' + url + ' target="_blank">' + value.allNum + '</a>)';
				}

				return value.name + text1 + text2;
			} else {
				return '';
			}
		},

		versionStat: function(info) {
			if (info) {
				indexModel.packageIdList = info.packageIdList;
				indexModel.statList = info.statList;

				if (indexModel.statList && indexModel.statList.length > 0) {
					var vs = $('#version-stat');
					$('#version-stat .main-problem').remove();

					var target = $('<div>', {
						'class': 'main-problem'
					});
					var ulTarget = $('<ul>');

					var tipsId = 0;
					for (var i = indexModel.statList.length - 1; i >= 0; i--) {
						var allStat = indexModel.statList[i].allStat.currentPeriod;
						var preAllStat = indexModel.statList[i].allStat.previousPeriod;
						var asStat = indexModel.statList[i].asStat.currentPeriod;
						var preAsStat = indexModel.statList[i].asStat.previousPeriod;
						if (allStat && allStat.length > 0) {
							for (var j = 0; j < allStat.length; j++) {
								var liTarget = null;

								if (j === allStat.length - 1) {
									liTarget = $('<li>');
								} else {
									liTarget = $('<li>', {
										'class': 'right-border'
									});
								}

								var asStatTarget = null;
								var preAsStatTarget = null;
								for(var k = 0; k < asStat.length; k++) {
									if(asStat[k].productVersion == allStat[j].version && asStat[k].buildId == allStat[j].buildId) {
										asStatTarget = asStat[k];
										preAsStatTarget = preAsStat[k];
									}
								}
								
								var item = allStat[j].indexItem;
								var num = 0;
								var preNum = 0;
								var asNum = 0;
								var preAsNum = 0;
								var itemText = null;
								var itemText2 = null;
								switch (item) {
									case 0:
										num = parseFloat(allStat[j].crashNum, 10);
										preNum = parseFloat(preAllStat[j].crashNum, 10);
										
										if(asStatTarget) {
											asNum = parseFloat(asStatTarget.accessPeople, 10);
										}
										if(preAsStatTarget) {
											preAsNum = parseFloat(preAsStatTarget.accessPeople, 10);
										}
										itemText= 'crash次数';
										itemText2 = '联网用户数';
										break;
									case 1:
										num = parseFloat(allStat[j].crashNum, 10);
										preNum = parseFloat(preAllStat[j].crashNum, 10);
										if(asStatTarget) {
											asNum = parseFloat(asStatTarget.accessImei, 10);
										}
										if(preAsStatTarget) {
											preAsNum = parseFloat(preAsStatTarget.accessImei, 10);
										}
										itemText= 'crash次数';
										itemText2 = '联网设备数';
										break;
									case 2:
										num = parseFloat(allStat[j].affectPeople, 10);
										preNum = parseFloat(preAllStat[j].affectPeople, 10);
										if(asStatTarget) {
											asNum = parseFloat(asStatTarget.accessPeople, 10);
										}
										if(preAsStatTarget) {
											preAsNum = parseFloat(preAsStatTarget.accessPeople, 10);
										}
										itemText= '影响人数';
										itemText2 = '联网用户数';
										break;
									case 3:
										num = parseFloat(allStat[j].affectImei, 10);
										preNum = parseFloat(preAllStat[j].affectImei, 10);
										if(asStatTarget) {
											asNum = parseFloat(asStatTarget.accessImei, 10);
										}
										if(preAsStatTarget) {
											preAsNum = parseFloat(preAsStatTarget.accessImei, 10);
										}
										itemText= '影响设备数';
										itemText2 = '联网设备数';
										break;
								}

								var rate = num / asNum * 100;
								var preRate = preNum / preAsNum * 100;
								var changeRate = (rate - preRate) / preRate;
								var direction = 'down';
								var symbol = '-';
								if (changeRate > 0.009 && changeRate !== Infinity && changeRate !== -Infinity) {
									direction = 'up';
									symbol = '+';
								}
								changeRate = Math.abs(changeRate);
								changeRate = changeRate.toFixed(2);
								rate = rate.toFixed(2);

								if(!asNum || asNum === 0) {
									rate = '-';
								}
								if(!preAsNum || preAsNum === 0 || !preRate || preRate === 0 || 
										changeRate === Infinity || changeRate === -Infinity) {
									changeRate = '-';
								}

								var url = root + '?productId=' + indexModel.queryBean.productId + '&model=exception&sub=';
								var sub = 'stat?target=new_rdm&productId=' + indexModel.queryBean.productId + 
									'&version=' + allStat[j].version + '&pack=' + allStat[j].packageId;
								url += encodeURIComponent(sub);
						//		url = sub;

								var verText = allStat[j].version;
								if(allStat[j].buildId && allStat[j].buildId != '-1') {
									verText += '#' + allStat[j].buildId;
								}
								var text = verText + '<a href="' + url + '" target="_blank" tip="#tip-' + tipsId + '">(' + rate +
									'%)</a><span class="' + direction + '">' + symbol + changeRate + '%</span>';
								var tipsTarget = $('<div>', {
									id: 'tip-' + tipsId,
									'class': 'tips', 
									html: '<span class="tips-title">Bundle ID：</span>' + allStat[j].packageId + 
										'<br /><span class="tips-title">纬度：</span>' + itemText + '/' + itemText2 + '<br/><span class="tips-title">' + 
										itemText + '：</span>' + accounting.formatNumber(num) + 
										'<br/><span class="tips-title">' + itemText2 + '：</span>' + accounting.formatNumber(asNum)
								});
								++tipsId;
								liTarget.append(text).append(tipsTarget);

								ulTarget.append(liTarget);
							}
						}
					}
					
					target.append(ulTarget);
					vs.prepend(target);

					$('#version-stat li').hover(function() {
						var id = $(this).find('a').attr('tip');
						$(id).show();
					}, function() {
						var id = $(this).find('a').attr('tip');
						$(id).hide();
					});
				}
			}
		},

		vipStat: function(info) {
			if (info) {
				indexModel.vipConfigs = info.vipConfigs;
				if (indexModel.vipConfigs && indexModel.vipConfigs.length > 0) {
					$('#vip-loading').show();
					
					var request = {
						url: 'index/page!vip',
						type: 'get',
						dataType: 'json',
						data: {
							productId: indexModel.queryBean.productId
						},
						success: function(json) {
							$('#vip-loading').hide();
							indexModel.vipCrashInfos = json;
							indexModel.vipData = eht.convertVipData();
							initVipPanel();
						},
						error: function(jqXHR, textStatus, errorThrown) {
							$('#vip-loading').hide();
						}
					};

					$.ajax(request);
				}
			}
		},

		convertVipData: function() {
			var detailData = [];

			var length = indexModel.vipConfigs.length;
			var rows = 0;
			if(length % 5 === 0) {
				rows = parseInt(length / 5, 10);
			} else {
				rows = parseInt(length / 5, 10) + 1;
			}
			for(var j = 0; j < rows; j++) {
				detailData.push({});
			}

			if(indexModel.vipConfigs && indexModel.vipConfigs.length > 0) {
				var crashInfos = indexModel.vipCrashInfos;

				for(var i = 0; i < length; i++) {
					var targetRow = 0;
					if((i + 1) % 5 === 0) {
						targetRow = parseInt((i + 1) / 5, 10);
					} else {
						targetRow = parseInt((i + 1) / 5, 10) + 1
					}

					var position = i % 5;
					var field = null;

					switch(position) {
						case 0:
							field = "zero";
							break;
						case 1:
							field = "one";
							break;
						case 2:
							field = "two";
							break;
						case 3:
							field = "three";
							break;
						case 4:
							field = "four";
							break;
					}
				
					var name = indexModel.vipConfigs[i].name;
					var allNum = 0;
					var todayNum = 0;
					if(crashInfos && crashInfos.length > 0) {
						for(var k = 0; k < crashInfos.length; k++) {
							if(crashInfos[k].name == name) {
								allNum = accounting.formatNumber(crashInfos[k].allNum);
								todayNum = accounting.formatNumber(crashInfos[k].todayNum);
							}
						}
					}

					var obj = detailData[targetRow - 1];
					var valObj = {
						name: name,
						todayNum: todayNum, 
						allNum: allNum, 
						item: indexModel.vipConfigs[i].item
					}
					obj[field] = valObj;
				}
			}

			return detailData;
		},

		createVipStore: function() {
			var detailStore = Ext.create('Ext.data.Store', {
				storeId: 'vipStore',
				fields: ['zero', 'one', 'two', 'three', 'four'],
				remoteSort: true,
				data: {
					'items': indexModel.vipData
				},
				proxy: {
					type: 'memory',
					reader: {
						type: 'json',
						root: 'items'
					}
				},
			});

			return detailStore;
		},

		handleStat: function(info) {
			if (info) {
				indexModel.userId = info.userId;
				indexModel.packList = info.packList;
				indexModel.handleStat = info.handleStat;

				if (indexModel.packList && indexModel.packList.length > 0) {
					packSelect.children().remove();

					for (var i = 0; i < indexModel.packList.length; i++) {
						var target = indexModel.packList[i];
						var option = $('<option>', {
							text: target.packageId
						});
						packSelect.append(option);
					}
				}

				packSelect.chosen();

				indexModel.handleData = this.convertHandleData();
				initHandlePanel();
			}
		},

		convertHandleData: function() {
			var packageId = packSelect.val();
			var detailData = [];

			if (indexModel.handleStat && indexModel.handleStat.length > 0) {
				for (var i = 0; i < indexModel.handleStat.length; i++) {
					var target = indexModel.handleStat[i];
					if (target && target.length > 0) {
						if (target[0] && target[0].packageId == packageId) {
							detailData = target;
							break;
						}
					}
				}
			}

			return detailData;
		},

		createHandleStore: function() {
			var detailStore = Ext.create('Ext.data.Store', {
				storeId: 'handleStore',
				fields: ['processor', 'unsolvedNum', 'solvingNum', 'resolvedNum', 'delayNum', 'closeNum', 'bugNum', 'packageId', 'platformId'],
				remoteSort: true,
				data: {
					'items': indexModel.handleData
				},
				proxy: {
					type: 'memory',
					reader: {
						type: 'json',
						root: 'items'
					}
				},
				sorters: {
					property: 'resolvedNum',
					direction: 'DESC'
				},
			});

			return detailStore;
		}
	}

	packSelect.change(function() {
		indexModel.handleData = eht.convertHandleData();

		indexModel.handleStore.loadData(indexModel.handleData); 
		setTimeout(function() {
			indexModel.handlePanel.doLayout();
		}, 100);
	});

	function Main() {};
	Main.prototype = {
		init: function(queryBean) {
			indexModel.queryBean = queryBean;

			if (!queryBean || !queryBean.productId || queryBean.productId.length === 0) {
				return;
			}

			var request = {
				url: 'index/page!info?isStatics=true',
				type: 'get',
				dataType: 'json',
				data: {
					productId: queryBean.productId
				},
				success: function(json) {
					eht.versionStat(json);
					eht.handleStat(json);
					eht.vipStat(json);
					eht.showDynamic(json);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (textStatus === "timeout") {
					//	alert("服务器繁忙，请稍后重试");
					} else if (textStatus === "error") {
						if (jqXHR.status == 504 || jqXHR.status == 408 || jqXHR.status == 503) {
						//	alert("服务器繁忙，请稍后重试");
						} else if (jqXHR.status == 404) {

						} else {
						//	alert("后台发生错误，请RTX联系RDM小秘书");
						}
					} else {
					//	alert("页面出错了，请RTX联系RDM小秘书");
					}
				}
			};

			$.ajax(request);
		}
	};

	var eht = new Exhibition();
	module.exports = {
		Main: Main
	};
});

