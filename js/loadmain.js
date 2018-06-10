var WGmap3D;
var initparameter = {
	infoBox: false
}

var tooltip;
var handlerPoint;
var handlerPolygon;
var handlerDis;
var handlerArea;
var handlerHeight;

var leftClick_handler;
var photoSphereMakerCollection = [];
var sceneBubble;
var isaddFlattenRegions = false;
//页面加载入口
function onload() {

	WGmap3D = new Orange.WGmap3D('cesiumContainer', initparameter);
	$('#loadingbar').hide();
	if(!WGmap3D.scene.pickPositionSupported) {
		alert('不支持深度拾取,量算功能无法使用(无法进行鼠标交互绘制)！');
	}
	var infoboxContainer = document.getElementById("bubble");
	WGmap3D.viewer.customInfobox = infoboxContainer;

	var promise = WGmap3D.scene.openScene(dataConfig.sceneUrl);
	promise.then(function(layers) {

		WGmap3D.scene.flytoCameraObj(dataConfig.cameraobj)
		//WGmap3D.scene.layer3Ds.buildLayersTree("treeContiner", WGmap3D);
		WGmap3D.scene.layer3Ds.buildCustomLayersTree("treeContiner",WGmap3D,CustomTreedata)

		var layersTreeData = WGmap3D.scene.layer3Ds.getLayersTreeData();
		var s3mlayersName = [];
		layersTreeData[0].nodes.forEach(function(node) {
			s3mlayersName.push(node.text);
		})
		addlayerSelect('queryByCirclelayerSelect', s3mlayersName);
		addlayerSelect('queryByPolygonlayerSelect', s3mlayersName);

		//添加街景maker
		addphotoSphereMaker();
		
		matchlayerTreeSet("点云", false);
		matchlayerTreeSet("BIM", false);
		
	})
	//初始化气泡
	sceneBubble = new Bubble(WGmap3D.scene);

	leftClick_handler = new Cesium.ScreenSpaceEventHandler(WGmap3D.scene.canvas);

	tooltip = createTooltip(document.body);

	handlerPoint = new Cesium.DrawHandler(WGmap3D.viewer, Cesium.DrawMode.Point);
	handlerPoint.activeEvt.addEventListener(function(isActive) {
		if(isActive == true) {
			WGmap3D.viewer.enableCursorStyle = false;
			WGmap3D.viewer._element.style.cursor = '';
			$('body').removeClass('drawCur').addClass('drawCur');
		} else {
			WGmap3D.viewer.enableCursorStyle = true;
			$('body').removeClass('drawCur');
		}
	});
	handlerPoint.movingEvt.addEventListener(function(windowPosition) {
		tooltip.showAt(windowPosition, '点击绘制一个点');
	});
	handlerPoint.drawEvt.addEventListener(function(result) {
		tooltip.setVisible(false);
		//console.log(result)

		var cartographic = Cesium.Cartographic.fromCartesian(result.object.position);
		//console.log(cartographic)
		var longitude = Cesium.Math.toDegrees(cartographic.longitude);
		var latitude = Cesium.Math.toDegrees(cartographic.latitude);
		var height = cartographic.height;
		if(height < 0) {
			height = 0;
		}
		var centerPoint = {
			x: longitude,
			y: latitude,
			z: height
		}
		var R = $('#circleR').val();
		var backPoint = calculateCircle(centerPoint, R);
		addPolygon(backPoint.point3Ds);
		var fieldName = $('#queryByCirclelayerSelect').selectpicker('val');

		if(fieldName !== '') {
			var querylayer = WGmap3D.scene.layers.find(fieldName);
			if(querylayer !== undefined) {
				queryByPolygon(backPoint.point2Ds, querylayer);
			}

		}

		//		queryByPolygon(backPoint.point2Ds, '建筑');
	});
	handlerPolygon = new Cesium.DrawHandler(WGmap3D.viewer, Cesium.DrawMode.Polygon);

	handlerPolygon.activeEvt.addEventListener(function(isActive) {
		if(isActive == true) {
			WGmap3D.viewer.enableCursorStyle = false;
			WGmap3D.viewer._element.style.cursor = '';
			$('body').removeClass('drawCur').addClass('drawCur');
		} else {
			WGmap3D.viewer.enableCursorStyle = true;
			$('body').removeClass('drawCur');
		}
	});
	handlerPolygon.movingEvt.addEventListener(function(windowPosition) {
		if(windowPosition.x < 210 && windowPosition.y < 120) {
			tooltip.setVisible(false);
			return;
		}
		if(handlerPolygon.isDrawing) {
			tooltip.showAt(windowPosition, '点击确定查询区域中间点,右键单击结束绘制');
		} else {
			tooltip.showAt(windowPosition, '点击绘制查询区域第一个点');
		}
	});
	handlerPolygon.drawEvt.addEventListener(function(result) {
		tooltip.setVisible(false);
		handlerPolygon.polygon.show = true;
		handlerPolygon.polyline.show = true;
		var geometry = CesiumToSuperMap.convertPolygon(Cesium, SuperMap, result.object);
		var geopint2Ds = geometry.components[0].components;
		var point2Ds = []
		for(var i = 0, len = geopint2Ds.length; i < len; i++) {
			point2Ds.push({
				"x": geopint2Ds[i].x,
				"y": geopint2Ds[i].y
			})
		}

		var fieldName = $('#queryByPolygonlayerSelect').selectpicker('val');

		if(fieldName !== '') {
			var querylayer = WGmap3D.scene.layers.find(fieldName);
			if(querylayer !== undefined) {
				queryByPolygon(point2Ds, querylayer);
			}

		}

	});

	/*量算*/
	//初始化测量距离
	handlerDis = new Cesium.MeasureHandler(WGmap3D.viewer, Cesium.MeasureMode.Distance, 0);
	//注册测距功能事件
	handlerDis.measureEvt.addEventListener(function(result) {
		var distance = parseFloat(result.distance) > 1000 ? (parseFloat(result.distance) / 1000).toFixed(2) + 'km' : parseFloat(result.distance).toFixed(2) + 'm';
		handlerDis.disLabel.text = '距离:' + distance;

	});
	handlerDis.activeEvt.addEventListener(function(isActive) {
		if(isActive == true) {
			WGmap3D.viewer.enableCursorStyle = false;
			WGmap3D.viewer._element.style.cursor = '';
			$('body').removeClass('measureCur').addClass('measureCur');
		} else {
			WGmap3D.viewer.enableCursorStyle = true;
			$('body').removeClass('measureCur');
		}
	});

	//初始化测量面积
	handlerArea = new Cesium.MeasureHandler(WGmap3D.viewer, Cesium.MeasureMode.Area, 0);
	handlerArea.measureEvt.addEventListener(function(result) {
		var area = parseFloat(result.area) > 1000000 ? (parseFloat(result.area) / 1000000).toFixed(2) + 'km²' : parseFloat(result.area).toFixed(2) + '㎡'
		handlerArea.areaLabel.text = '面积:' + area;
	});
	handlerArea.activeEvt.addEventListener(function(isActive) {
		if(isActive == true) {
			WGmap3D.viewer.enableCursorStyle = false;
			WGmap3D.viewer._element.style.cursor = '';
			$('body').removeClass('measureCur').addClass('measureCur');
		} else {
			WGmap3D.viewer.enableCursorStyle = true;
			$('body').removeClass('measureCur');
		}
	});
	//初始化测量高度
	handlerHeight = new Cesium.MeasureHandler(WGmap3D.viewer, Cesium.MeasureMode.DVH);
	handlerHeight.measureEvt.addEventListener(function(result) {
		var distance = parseFloat(result.distance) > 1000 ? (parseFloat(result.distance) / 1000).toFixed(2) + 'km' : parseFloat(result.distance) + 'm';
		var vHeight = parseFloat(result.verticalHeight) > 1000 ? (parseFloat(result.verticalHeight) / 1000).toFixed(2) + 'km' : parseFloat(result.verticalHeight) + 'm';
		var hDistance = parseFloat(result.horizontalDistance) > 1000 ? (parseFloat(result.horizontalDistance) / 1000).toFixed(2) + 'km' : parseFloat(result.horizontalDistance) + 'm';
		handlerHeight.disLabel.text = '空间距离:' + distance;
		handlerHeight.vLabel.text = '垂直高度:' + vHeight;
		handlerHeight.hLabel.text = '水平距离:' + hDistance;
	});
	handlerHeight.activeEvt.addEventListener(function(isActive) {
		if(isActive == true) {
			WGmap3D.viewer.enableCursorStyle = false;
			WGmap3D.viewer._element.style.cursor = '';
			$('body').removeClass('measureCur').addClass('measureCur');
		} else {
			WGmap3D.viewer.enableCursorStyle = true;
			$('body').removeClass('measureCur');
		}
	});

}
$('#MeasureDis').click(function() {
	//clearAll();
	deactiveAll();
	handlerDis && handlerDis.activate();
});

$('#MeasureArea').click(function() {
	//clearAll();
	deactiveAll();
	handlerArea && handlerArea.activate();
});
$('#MeasureHeigh').click(function() {
	//clearAll();
	deactiveAll();
	handlerHeight && handlerHeight.activate();
});
$('#Clear').click(function() {
	clearAll();
});

function clearAll() {
	if(window.queryPolygon !== undefined) {
		WGmap3D.viewer.entities.remove(window.queryPolygon);
	}
	if(window.LocationEntity !== undefined) {
		WGmap3D.viewer.entities.remove(window.LocationEntity);
	}
	handlerPolygon.clear();
	handlerPoint.clear();
	handlerDis && handlerDis.clear();
	handlerArea && handlerArea.clear();
	handlerHeight && handlerHeight.clear();
	if(tooltip !== undefined) {
		tooltip.setVisible(false);
	}
	if(window.StartmakerEntity !== undefined && window.StartmakerEntity !== '') {
		WGmap3D.viewer.entities.remove(window.StartmakerEntity);
		window.StartmakerEntity = '';
	}
	if(window.EndmakerEntity !== undefined && window.EndmakerEntity !== '') {
		WGmap3D.viewer.entities.remove(window.EndmakerEntity);
		window.EndmakerEntity = '';
	}
	if(window.networkResultLine !== undefined && window.networkResultLine !== '') {
		WGmap3D.viewer.entities.remove(window.networkResultLine);
		window.networkResultLine = '';
	}
	deactiveAll() ;

}

function deactiveAll() {

	addMaker(false);
	queryattributesClick(false);
	photoSphereMakerSelect(false);

	handlerPoint && handlerPoint.deactivate();
	handlerPolygon && handlerPolygon.deactivate();
	handlerDis && handlerDis.deactivate();
	handlerArea && handlerArea.deactivate();
	handlerHeight && handlerHeight.deactivate();
}
/*量算结束*/

$("#drawCenterPoint").click(function() {

	var R = $('#circleR').val();
	var fieldName = $('#queryByCirclelayerSelect').selectpicker('val');
	if(R !== "" && fieldName !== "") {
		clearAll();

		deactiveAll();
		handlerPoint.activate();
		closePanel('#queryByCircle');
	}

})
$("#drawPolygon").click(function() {
	var fieldName = $('#queryByPolygonlayerSelect').selectpicker('val');
	if(fieldName !== "") {
		clearAll();

		deactiveAll();
		handlerPolygon.activate();

		closePanel('#queryByPolygon');
	}

})
//飞行选择
$('#startFly').click(function() {
	sceneFlyClick();
})
//
$("#addMakerBtn").click(function() {
	$("#MakerInfo").prop("onclick", null).off("click");
})
$("#queryBysqlLikeBtn").click(function() {
	clearAll();

	deactiveAll();
	addMaker(false);
	getFeatureBysqlLike();
	closePanel('#queryBysql');
})
//关闭drapdown面板
function closePanel(a) {
	//var $this = $(a);
	var $parent = $(a);

	$parent.removeClass('open').trigger($.Event('hidden.bs.dropdown'))
}
//关闭查询结果面板
function closeResultPanel(a) {
	$(a).hide();
}
/*空间查询图层select列表写入，当前只指定s3m图层*/
//传入select的id和需要写入的值数组
var addlayerSelect = function(a, b) {
	if(a && b) {
		var innerHtmlStr = "";
		for(var i = 0, len = b.length; i < len; i++) {
			innerHtmlStr += "<option>" + b[i] + "</option>"
		}
		$("#" + a).html(innerHtmlStr);
		$("#" + a).selectpicker('refresh');

	}
}
var updataqueryInfoPanel = function(a, b, c) {
	if(a.length > 0) {
		var updatainnerHtml = "";
		for(var i = 0, len = a.length; i < len; i++) {
			updatainnerHtml += '<a href="#" class="list-group-item"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span>' + a[i].fieldValues[a[i].fieldNames.indexOf(b)] + '</a>'
		}

		$("#queryResultslist").html(updatainnerHtml);
		$('#queryResults').show();

		$('.list-group-item').click(function() {
			var listValue = $(this).text();
			var selectFeature = findResultFeature(listValue);
			console.log(selectFeature);
			if(selectFeature !== undefined) {
				var xmin = selectFeature.fieldValues[selectFeature.fieldNames.indexOf("SMSDRIW")];
				var ymin = selectFeature.fieldValues[selectFeature.fieldNames.indexOf("SMSDRIS")];
				var xmax = selectFeature.fieldValues[selectFeature.fieldNames.indexOf("SMSDRIE")];
				var ymax = selectFeature.fieldValues[selectFeature.fieldNames.indexOf("SMSDRIN")];
				var bottom = selectFeature.fieldValues[selectFeature.fieldNames.indexOf("BOTTOMATTITUDE")];
				var h = selectFeature.fieldValues[selectFeature.fieldNames.indexOf("HEIGHT")];
				if(window.LocationEntity !== undefined) {
					WGmap3D.viewer.entities.remove(window.LocationEntity);
				}
				var LocationEntity = WGmap3D.viewer.entities.add({
					name: 'LocationEntity',
					rectangle: {
						coordinates: Cesium.Rectangle.fromDegrees(parseFloat(xmin), parseFloat(ymin), parseFloat(xmax), parseFloat(ymax)),
						material: Cesium.Color.BLUE.withAlpha(0.5),
						extrudedHeight: parseFloat(bottom) + parseFloat(h) + c,
						height: parseFloat(bottom) + c,
						outline: true,
						outlineColor: Cesium.Color.BLACK
					}
				})
				window.LocationEntity = LocationEntity;
				WGmap3D.viewer.flyTo(LocationEntity, {
					duration: 2
				})
			}

		})
	}
}
//根据查询结果列表值查找结果中的对象
var findResultFeature = function(listValue) {
	for(var i = 0, len = window.ResultFeatures.length; i < len; i++) {
		if(window.ResultFeatures[i].fieldValues.indexOf(listValue) > -1) {
			return window.ResultFeatures[i];
		}
	}
}
//添加兴趣点标注
var addMaker = function(value) {
	//clearAll();

	var inputfn = leftClick_handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	if(inputfn !== undefined) {
		leftClick_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	if(value === true) {
		WGmap3D.viewer.enableCursorStyle = false;
		WGmap3D.viewer._element.style.cursor = '';
		$('body').removeClass('drawCur').addClass('drawCur');

		leftClick_handler.setInputAction(function(e) {
			var position = WGmap3D.scene.pickPosition(e.position);

			//将笛卡尔坐标转化为经纬度坐标
			var cartographic = Cesium.Cartographic.fromCartesian(position);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var height = cartographic.height;

			var makerEntity = WGmap3D.viewer.entities.add({
				position: position,
				billboard: {
					image: './images/location4.png', // default: undefined
					pixelOffset: new Cesium.Cartesian2(0, -30),
					scale: 0.5
				},
				label: {
					text: '标注',
					font: '24px sans-serif',
					horizontalOrigin: 1,
					outlineColor: new Cesium.Color(0, 0, 0, 1),
					outlineWidth: 2,
					pixelOffset: new Cesium.Cartesian2(30, -30),
					style: Cesium.LabelStyle.FILL
				}
			});
			window.makerEntity = makerEntity;
			$('#MakerInfo').modal('show')

		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	} else {
		WGmap3D.viewer.enableCursorStyle = true;
		$('body').removeClass('drawCur');
		var inputfn = leftClick_handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
		if(inputfn !== undefined) {
			leftClick_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		}

	}

}
//查询属性操作
var queryattributesClick = function(value) {
	//clearAll();

	var inputfn = leftClick_handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
	if(inputfn !== undefined) {
		leftClick_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	if(value === true) {
		addMaker(false);
		photoSphereMakerSelect(false);
		WGmap3D.viewer.enableCursorStyle = false;
		WGmap3D.viewer._element.style.cursor = '';
		$('body').removeClass('queryattributesCur').addClass('queryattributesCur');
		leftClick_handler.setInputAction(function(e) {

			var position = WGmap3D.scene.pickPosition(e.position);

			var selection3D = WGmap3D.viewer.getSelection();
			if(selection3D !== undefined) {
				getFeatureBysql(selection3D, position)

			} else {
				sceneBubble.container.hide();
			}

		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	} else {
		sceneBubble.container.hide();
		WGmap3D.viewer.enableCursorStyle = true;
		$('body').removeClass('queryattributesCur');
		var inputfn = leftClick_handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		if(inputfn !== undefined) {
			leftClick_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		}

	}

}

$("#SureaddMaker").click(function() {
	if(window.makerEntity !== undefined) {
		window.makerEntity.label.text = $("#MakerName").val();
		$("#MakerName").val("");
		$("#MakerInfo").val();
		$("#MakerInfo").val("");
		$('#MakerInfo').modal('hide');
		addMaker(false);

	}

})
$("#CanceladdMaker").click(function() {
	if(window.makerEntity !== undefined) {
		WGmap3D.viewer.entities.remove(window.makerEntity)
		addMaker(false);
	}

})

var calculateCircle = function(point, R) {

	var returnObj = {
		point3Ds: [],
		point2Ds: []
	}
	for(var i = 0; i < 100; i++) {
		var lonlat = SuperMap.Util.destinationVincenty(new SuperMap.LonLat(point.x, point.y), 360 / 100 * i, R);

		returnObj.point3Ds.push(lonlat.lon);
		returnObj.point3Ds.push(lonlat.lat);

		returnObj.point3Ds.push(point.z);
		returnObj.point2Ds.push({
			"x": lonlat.lon,
			"y": lonlat.lat
		})
		//returnObj.point2Ds.push(new SuperMap.Geometry.Point(lonlat.lon, lonlat.lat));

	}

	return returnObj;
}
var addPolygon = function(point3Ds) {
	window.queryPolygon = WGmap3D.viewer.entities.add({
		name: 'Green extruded polygon',
		polygon: {
			hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(point3Ds),
			extrudedHeight: point3Ds[2] + 20,
			height:point3Ds[2],
			outline: true,
			outlineColor: Cesium.Color.WHITE,
			material: Cesium.Color.WHITE.withAlpha(0.5)
		}
	});

}

//空间查询
function queryByPolygon(a, b) { //a查询面，b为查询图层
	var baseheight = b.height;
	var layerName = b.layerName;
	if(layerName.indexOf('@') > -1) {
		var dataInfo = layerName.split('@');
		var dataSetName = dataInfo[0];
		var dataSourceName = dataInfo[1];

		var dataUrl = dataConfig.dataServers.baseMOdeldataServer.url;

	} else {
		var dataInfo = dataConfig.dataServers.TiltmodeldataServer[layerName];
		if(dataInfo !== undefined) {
			var dataSetName = dataInfo.dataSetName;
			var dataSourceName = dataInfo.dataSourceName;
			var dataUrl = dataInfo.url;
		}
	}
	var queryObj = {
		"getFeatureMode": "SPATIAL",
		"spatialQueryMode": "INTERSECT",
		"datasetNames": [dataSourceName + ":" + dataSetName],
		"geometry": {
			id: 0,
			parts: [1],
			points: a,
			type: "REGION"
		}
	};

	var queryObjJson = JSON.stringify(queryObj);

	$.ajax({
		type: "post",
		url: dataUrl,
		data: queryObjJson,
		success: function(result) {
			var resultobj = JSON.parse(result);

			window.ResultFeatures = resultobj.features;

			updataqueryInfoPanel(resultobj.features, "SMID", baseheight);

		},
		error: function(msg) {
			console.log(msg);
		}
	})
}

//sql模糊查询
function getFeatureBysqlLike() {

	var fieldName = $('#fieldSelect').selectpicker('val');
	var QueryFilter = $('#QueryFilter').val();
	if(fieldName != "" && QueryFilter != "") {
		var queryObj = {
			"getFeatureMode": "SQL",
			"datasetNames": [dataConfig.dataServers.dataSourceName + ":建筑"],
			"queryParameter": {

				attributeFilter: fieldName + " like " + "'%" + QueryFilter + "%'"
			}
		};

		var queryObjJson = JSON.stringify(queryObj);

		$.ajax({
			type: "post",
			url: dataUrl,
			data: queryObjJson,
			success: function(result) {
				var resultobj = JSON.parse(result);

				window.ResultFeatures = resultobj.features;

				updataqueryInfoPanel(resultobj.features, fieldName);

			},
			error: function(msg) {
				console.log(msg);
			}
		})
	}

}

//点击sql查询
function getFeatureBysql(selection, position) {

	/********通过图层名@判断数据类型，有@为桌面切的场景缓存，无@认为是倾斜模型，倾斜模型单体化查询需要重新制定查询条件**********/
	var layerName = selection.layer.layerName;
	if(layerName.indexOf('@') > -1) {
		var dataInfo = layerName.split('@');
		var dataSetName = dataInfo[0];
		var dataSourceName = dataInfo[1];

		var dataUrl = dataConfig.dataServers.baseMOdeldataServer.url;

		var queryObj = {
			"getFeatureMode": "ID",
			"datasetNames": [dataSourceName + ":" + dataSetName],
			"ids": [selection.ID]
		};

		var queryObjJson = JSON.stringify(queryObj);

		$.ajax({
			type: "post",
			url: dataUrl,
			data: queryObjJson,
			success: function(result) {
				var resultobj = JSON.parse(result);

				var backfeature = resultobj.features[0];

				sceneBubble.showAt(position);
				sceneBubble.container.change({
					contentTable: {
						name: backfeature.fieldNames,
						value: backfeature.fieldValues,
						width: 350,
						height: 280
					}
				})
				sceneBubble.selection3D = selection;

			},
			error: function(msg) {
				console.log(msg);
				sceneBubble.containe.hide();
			}
		})

	} else {
		var dataInfo = dataConfig.dataServers.TiltmodeldataServer[layerName];
		if(dataInfo !== undefined) {
			var dataSetName = dataInfo.dataSetName;
			var dataSourceName = dataInfo.dataSourceName;
			var dataUrl = dataInfo.url;
		}

		var queryObj = {
			"getFeatureMode": "ID",
			"datasetNames": [dataSourceName + ":" + dataSetName],
			"ids": [selection.ID]
		};

		var queryObjJson = JSON.stringify(queryObj);

		$.ajax({
			type: "post",
			url: dataUrl,
			data: queryObjJson,
			success: function(result) {
				var resultobj = JSON.parse(result);

				var backfeature = resultobj.features[0];

				var projectId = backfeature.fieldValues[backfeature.fieldNames.indexOf('PROJECTID')];
				//var projectId = '64a5dab0-ffec-45fb-a047-ab2ae801046d';
				if(projectId !== undefined && projectId.length > 0) {
					var innerhtmStr = '<iframe src=' + dataConfig.BIMinfourl + projectId + ' width="320px" height="380px"  marginwidth="0" marginheight="0" frameborder="0" allowtransparency="false"></iframe>';

					sceneBubble.container.change({
						width: 350,
						height: 400
					});
					sceneBubble.container.changeContenthtml(innerhtmStr);
				} else {
					sceneBubble.container.change({
						contentTable: {
							name: backfeature.fieldNames,
							value: backfeature.fieldValues,
							width: 350,
							height: 280
						}
					})

				}

				sceneBubble.showAt(position);
				sceneBubble.selection3D = selection;

			},
			error: function(msg) {
				console.log(msg);
				sceneBubble.containe.hide();
			}
		})

	}

}

//添加街景Maker
var addphotoSphereMaker = function() {
	for(var i = 0, len = photoSpherePoints.length; i < len; i++) {
		var photoSpherePoint = photoSpherePoints[i];
		var imageFileName = photoSpherePoint.properties.IMGNUM;
		while(imageFileName.length < 5) {
			imageFileName = '0' + imageFileName;
		}
		imageFileName = 'G' + imageFileName + '.jpg';
		var photoSphereUrl = photoSphereBaseurl + imageFileName;

		var photoSpheremakerEntity = WGmap3D.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(photoSpherePoint.geometry.coordinates[0], photoSpherePoint.geometry.coordinates[1], photoSpherePoint.properties.Z),
			billboard: {
				image: './images/sxtimg.png',
				pixelOffset: new Cesium.Cartesian2(0, -30),
				scale: 0.15,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 400)
			},
			show: false,

			description: photoSphereUrl + '?' + photoSpherePoint.properties.description
		});
		photoSphereMakerCollection.push(photoSpheremakerEntity);

	}
}

//切换到街景，显示街景图标
var photoSphereBtn_Click = function() {
	photoSphereMakerCollection.forEach(function(Entity) {
		Entity.show === false ? (
			Entity.show = true,
			photoSphereMakerSelect(true)
		) : (
			Entity.show = false,
			photoSphereMakerSelect(false)
		);

	})
}

//街景Maker点击弹出对应全景图片
var photoSphereMakerSelect = function(value) {
	//clearAll();

	var inputfn = leftClick_handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
	if(inputfn !== undefined) {
		leftClick_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	if(value === true) {
		addMaker(false);
		WGmap3D.viewer.enableCursorStyle = false;
		WGmap3D.viewer._element.style.cursor = '';
		$('body').removeClass('photosphereCur').addClass('photosphereCur');
		leftClick_handler.setInputAction(function(e) {
			var selectedEntity = WGmap3D.viewer.selectedEntity;
			if(selectedEntity != undefined) {
				var Entiytype = selectedEntity.description._value.split('?')[1];
				var photoSphereimageUrl = selectedEntity.description._value.split('?')[0];
				if(Entiytype === 'photoSphere') {
					if(Window.lastSelectedEntiy !== undefined) {
						Window.lastSelectedEntiy.billboard.color = undefined;
					}
					selectedEntity.billboard.color = Cesium.Color.AQUA.withAlpha(0.8);
					Window.lastSelectedEntiy = selectedEntity;

					intphotoSphere(photoSphereimageUrl);

				}
			} else {
				if(Window.lastSelectedEntiy !== undefined) {
					Window.lastSelectedEntiy.billboard.color = undefined;
					Window.lastSelectedEntiy = undefined;
				}
			}

		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	} else {

		WGmap3D.viewer.enableCursorStyle = true;
		$('body').removeClass('photosphereCur');
		var inputfn = leftClick_handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		if(inputfn !== undefined) {
			leftClick_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		}
		if(Window.lastSelectedEntiy !== undefined) {
			Window.lastSelectedEntiy.billboard.color = undefined;
			Window.lastSelectedEntiy = undefined;
		}

	}
}
//街景初始化
var intphotoSphere = function(imgeUrl) {
	$('#photospherePanel').show();
	var div = document.getElementById('photosphereContainer');
	var PSV = new PhotoSphereViewer({

		// Panorama, given in base 64
		panorama: imgeUrl,

		// Container
		container: div,

		// Deactivate the animation
		time_anim: false,

		// Display the navigation bar
		navbar: true,

	});

}

var matchlayerTreeSet = function(value, type) {
	var allnode = $('#layerTree').treeview("getEnabled");
	if(type === false) {
		allnode.forEach(function(node) {
			node.text.indexOf(value) > -1 ? ($('#layerTree').treeview('uncheckNode', [node, {
				silent: false
			}])) : false
		})
	} else if(type === true) {
		allnode.forEach(function(node) {
			node.text.indexOf(value) > -1 ? ($('#layerTree').treeview('checkNode', [node, {
				silent: false
			}])) : false
		})
	}

}
var BIMBtn_Click = function() {
	if(isaddFlattenRegions === false) {
		QXFlattenRegions(true);
		isaddFlattenRegions = true;

	} else {
		QXFlattenRegions(false);
		isaddFlattenRegions = false;
	}
}

var PointCloudBtn_Click = function() {

	var layer = WGmap3D.scene.layers.find('龙兴智慧园区点云');
	if(layer.visible === true) {
		matchlayerTreeSet("点云", false);
	} else {
		matchlayerTreeSet("点云", true);
	}
}
var QXFlattenRegions = function(value) {
	var layer = WGmap3D.scene.layers.find('龙兴智慧园区倾斜摄影');
	if(value === true) {
		FlattenRegiondata.forEach(function(feature) {
			var points = feature.geometry.coordinates;
			var name = feature.properties.NAME;
			layer.addFlattenRegion({
				position: points,
				name: name
			})
		})
		matchlayerTreeSet("BIM", true);

	} else if(value === false) {
		layer.removeAllFlattenRegion();
		matchlayerTreeSet("BIM", false);
	}

}

var findDatabyName=function(name)
{
	var features=FlattenRegiondata.features
	for(var i=0,len=features.length;i<len;i++)
	{
		if(features[i].properties.bimname===name)
		{
			return features[i]
		}
	}
	return undefined
}

var Conver2DPointsTo3DByheight=function(point2Ds,height)
{
	var point3Ds=[];
	point2Ds.forEach(function(point){
		point3Ds.push(point[0]);
		point3Ds.push(point[1]);
		point3Ds.push(height);
	})
	return point3Ds
}
function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}