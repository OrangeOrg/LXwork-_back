var Orange = window.NameSpace || {};

Orange.WGmap3D = function(ContainerID, parameter) {
	this.ContainerID = ContainerID;
	this.viewer = null;
	this.scene = null;

	if(typeof parameter === 'object' && typeof Cesium !== "undefined") {
		this.viewer = new Cesium.Viewer(this.ContainerID, parameter);
		this.scene = this.viewer.scene;
		this.viewer["SelectObjEvent"] = {
			currentViewer: this.viewer,
			currentHandler: undefined,
			addEventListener: function(a) { //传入回调函数a,需要带参数接收返回值
				if(typeof a === "function") {
					var that = this;
					that.currentHandler = new Cesium.ScreenSpaceEventHandler(that.currentViewer.scene.canvas);
					that.currentHandler.setInputAction(function(e) {
						var selectedEntity = that.currentViewer.selectedEntity;
						var selectedS3mObj = that.currentViewer.getSeletion();

						var backObj = selectedEntity || selectedS3mObj !== undefined ? (selectedEntity !== undefined ? selectedEntity : selectedS3mObj) : undefined;
						a(backObj);
					}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
					return true;

				} else {
					return false
				}

			},
			removeEventListener: function() {
				if(that.currentHandler !== undefined) {
					that.currentHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
				}
			}
		}
		this.viewer["getSelection"] = function() {
			var that = this;
			var layers = that.scene.layer3Ds.layers;
			var layerCount = layers.length;
			if(layerCount > 0) {
				for(var i = 0; i < layerCount; i++) {
					var ids = layers[i].getSelection();
					if(ids[0] !== undefined) {
						var Selection3D = {};
						Selection3D["layer"] = layers[i];
						Selection3D["ID"] = ids[0];
						return Selection3D;
					}
				}
				return undefined;
			} else {
				return undefined;
			}
		};

		if(this.scene.openScene === undefined) {
			this.scene["openScene"] = function(url) {
				var openPromise = this.open(url);
				openPromise.then(function(layers) {
					this.WGmap3D.scene.layer3Ds.merge(layers);
					//return this.WGmap3D.scene.layer3Ds;
				})
				return openPromise;

			}
		}

		if(this.scene.pickCamera === undefined) { //获取场景相机位置，返回相机的参数对象，配合flytoCameraObj使用
			this.scene["pickCamera"] = function() {
				var that = this;
				var cameraReturn = {};
				cameraReturn.x = this.camera.position.x;
				cameraReturn.y = this.camera.position.y;
				cameraReturn.z = this.camera.position.z;
				cameraReturn.heading = this.camera.heading;
				cameraReturn.pitch = this.camera.pitch;
				cameraReturn.roll = this.camera.roll;
				return cameraReturn
			}
		}
		if(this.scene.flytoCameraObj === undefined) {
			this.scene["flytoCameraObj"] = function(a, b) {
				var that = this;
				if(typeof a === "object") {
					this.camera.flyTo({
						destination: new Cesium.Cartesian3(a.x, a.y, a.z),
						orientation: {
							heading: a.heading,
							pitch: a.pitch,
							roll: a.roll
						},
						duration: a.time
					})
				}
			}
		}
		if(this.scene.setViewCameraObj === undefined) {
			this.scene["setViewCameraObj"] = function(a) {
				var that = this;
				this.camera.setView({
					destination: new Cesium.Cartesian3(a.x, a.y, a.z),
					orientation: {
						heading: a.heading,
						pitch: a.pitch,
						roll: a.roll
					}
				})
			}
		}

		if(this.scene.layer3Ds === undefined) {
			this.scene["layer3Ds"] = {
				layers: [],
				merge: function(layers) {
					if(layers.length > 0) {
						var appendLayers = this.appendlayerattribute(layers);
						this.layers = this.layers.concat(appendLayers)
					}

				},
				appendlayerattribute: function(layers) {
					var that = this;
					//this.layers=layers;
					layers.forEach(function(layer) {
						layer["layer3DType"] = that.getLayerType(layer);
						switch(layer["layer3DType"]) {
							case 2:
								//layer.hasLight = false;
								//layer.lodRangeScale = 0.2;
								layer["layerName"] = layer._name;
								layer["Caption"] = layer._name.split('@')[0];
								break;

							case 0:
								layer["layerName"] = layer._imageryProvider._name;
								layer["Caption"] = layer._name.split('@')[0];
								break;
							case 1:
								var layerurlsplits = layer._url.split('/');
								var layerName = layerurlsplits[layerurlsplits.length - 1];
								layer["layerName"] = layerName;
								layer["Caption"] = layerName.split('@')[0];
								break;
						}
					})
					return layers;

				},
				getLayersTreeData: function() {
					var that = this;
					if(that.layers.length > 0) {
						var treeData = [];
						var s3mlayers = {
							text: 'S3M图层',
							state: {
								checked: true,
								selectable: false
							},
							nodes: []
						};
						treeData.push(s3mlayers);

						var imageryLayers = {
							text: 'image图层',
							state: {
								checked: true,
								selectable: false
							},
							nodes: []
						}
						treeData.push(imageryLayers);
						var TerrainLayer = {
							text: '地形图层',
							state: {
								checked: true,
								selectable: false
							},
							nodes: []

						}
						treeData.push(TerrainLayer);
						that.layers.forEach(function(layer) {
							var layer3DType = layer.layer3DType;
							switch(layer3DType) {
								case 2:

									s3mlayers.nodes.push({
										text: layer.layerName,
										state: {
											checked: true,
										}
									});
									break;

								case 0:
									imageryLayers.nodes.push({
										text: layer.layerName,
										state: {
											checked: true,
										}
									});
									break;
								case 1:
									TerrainLayer.nodes.push({
										text: layer.layerName,
										state: {
											checked: true,
										}
									});
									break;
							}
						})
						return treeData;

					}

				},
				buildLayersTree: function(a, b) { //a传入containerDOMID，基于bootstrap创建,b为实例化的WGmap3D对象
					var that = this;
					var nameStr = "#" + a;
					$(nameStr).empty();
					var layetreediv = $('<div></div>'); //创建一个子div
					layetreediv.attr('id', 'layerTree'); //给子div设置id
					layetreediv.addClass('treeview'); //添加css样式

					$(nameStr).append(layetreediv);
					var layerTreeData = this.getLayersTreeData();
					if(layerTreeData) {
						$('#layerTree').treeview({
							data: layerTreeData,
							checkedIcon: "glyphicon glyphicon-check",
							backColor: "#071D32",
							color: "#fff",
							selectedColor: "#21F2F3",

							onhoverColor: "#07A3EE",
							//showBorder:false,
							multiSelect: false,
							showCheckbox: true,
							onNodeChecked: function(event, node) { //选中节点
								if(node.parentId !== undefined) {

									$("#layerTree").treeview("checkNode", [node.parentId, {
										silent: true
									}]);

									var layer = that.getLayer(node.text);
									if(layer) {
										var layerType = layer.layer3DType;
										switch(layerType) {
											case 0:
												layer.show = true;
												break;
											case 1:
												break;
											case 2:
												layer.visible = true;
												break;
										}
									}

								} else { //checked的是主节点

									var ChildNodesUncheck = getChildNodeUncheck(node);
									if(ChildNodesUncheck) {
										ChildNodesUncheck.nodes.forEach(function(node) {
											var layer = that.getLayer(node.text);
											if(layer) {
												var layerType = layer.layer3DType;
												switch(layerType) {
													case 0:
														layer.show = true;
														break;
													case 1:
														break;
													case 2:
														layer.visible = true;
														break;
												}

											}

										})
										$('#layerTree').treeview('checkNode', [ChildNodesUncheck.nodesID, {
											silent: true
										}]);

									}

								}

							},
							onNodeUnchecked: function(event, node) {
								//判断取消选中节点
								if(node.parentId !== undefined) {

									setParentNodeCheck(node);

									var layer = that.getLayer(node.text);
									if(layer) {
										var layerType = layer.layer3DType;
										switch(layerType) {
											case 0:
												layer.show = false;
												break;
											case 1:
												break;
											case 2:
												layer.visible = false;
												break;
										}
									}

								} else {
									var ChildNodeschecked = getChildNodechecked(node);
									//var ChildNodes=getChildNodeIdArr(node);
									if(ChildNodeschecked) {
										ChildNodeschecked.nodes.forEach(function(node) {
											var layer = that.getLayer(node.text);
											if(layer) {
												var layerType = layer.layer3DType;
												switch(layerType) {
													case 0:
														layer.show = false;
														break;
													case 1:
														break;
													case 2:
														layer.visible = false;
														break;
												}

											}

										})
										$('#layerTree').treeview('uncheckNode', [ChildNodeschecked.nodesID, {
											silent: true
										}]);
									}

								}

							},
							onNodeSelected: function(event, node) //节点选中事件
							{

								if(node.parentId !== undefined) {
									var layer = that.getLayer(node.text);
									if(typeof b === 'object') {
										b.viewer.flyTo(layer, {
											duration: 2
										});
									}

								}

							}

						});

					}
					// 选中父节点时，选中所有子节点
					function getChildNodeIdArr(node) {
						var ts = [];
						if(node.nodes) {
							for(x in node.nodes) {
								ts.push(node.nodes[x].nodeId);
								if(node.nodes[x].nodes) {
									var getNodeDieDai = getChildNodeIdArr(node.nodes[x]);
									for(j in getNodeDieDai) {
										ts.push(getNodeDieDai[j]);
									}
								}
							}
						} else {
							ts.push(node.nodeId);
						}
						return ts;
					}

					// 获取子节点中选中的节点
					function getChildNodechecked(node) {
						if(node.nodes) {
							var ts = {
								nodesID: [],
								nodes: []
							}; //当前节点子集中未被选中的集合
							for(x in node.nodes) {
								if(node.nodes[x].state.checked) {
									ts.nodesID.push(node.nodes[x].nodeId);
									ts.nodes.push(node.nodes[x]);
								}
								if(node.nodes[x].nodes) {
									var getNodeDieDai = node.nodes[x];
									//console.log(getNodeDieDai);
									for(j in getNodeDieDai) {
										if(getNodeDieDai.nodes[x].state.checked) {
											ts.push(getNodeDieDai[j]);
										}
									}
								}
							}
						}
						return ts;
					}
					// 获取子节点中未选中的节点
					function getChildNodeUncheck(node) {
						if(node.nodes) {
							var ts = {
								nodesID: [],
								nodes: []
							}; //当前节点子集中未被选中的集合
							for(x in node.nodes) {
								if(!node.nodes[x].state.checked) {
									ts.nodesID.push(node.nodes[x].nodeId);
									ts.nodes.push(node.nodes[x]);
								}
								if(node.nodes[x].nodes) {
									var getNodeDieDai = node.nodes[x];
									//console.log(getNodeDieDai);
									for(j in getNodeDieDai) {
										if(!getNodeDieDai.nodes[x].state.checked) {
											ts.push(getNodeDieDai[j]);
										}
									}
								}
							}
						}
						return ts;
					}

					// 选中所有子节点时，选中父节点 取消子节点时取消父节点
					function setParentNodeCheck(node) {
						var parentNode = $("#layerTree").treeview("getNode", node.parentId);
						if(parentNode.nodes) {
							var checkedCount = 0;
							for(x in parentNode.nodes) {
								if(parentNode.nodes[x].state.checked) {
									checkedCount++;
								}
							}
							if(checkedCount == parentNode.nodes.length) { //如果子节点全部被选 父全选
								//$("#tree").treeview("checkNode", parentNode.nodeId);
								//setParentNodeCheck(parentNode);
							} else if(checkedCount > 0 && checkedCount !== parentNode.nodes.length) { //如果子节点未全部被选 父未全选
								//$('#tree').treeview('checkNode', parentNode.nodeId);
								//setParentNodeCheck(parentNode);
							} else if(checkedCount === 0) //子节点全部取消，父节点也取消选中
							{
								$('#layerTree').treeview('uncheckNode', [parentNode.nodeId, {
									silent: true
								}]);
							}

						}
					}

				},
				buildCustomLayersTree: function(a, b, c) { //a传入containerDOMID，基于bootstrap创建,b为实例化的WGmap3D对象，c为treedata
					var that = this;
					var nameStr = "#" + a;
					$(nameStr).empty();
					var layetreediv = $('<div></div>'); //创建一个子div
					layetreediv.attr('id', 'layerTree'); //给子div设置id
					layetreediv.addClass('treeview'); //添加css样式

					$(nameStr).append(layetreediv);
					//var layerTreeData = this.getLayersTreeData();
					if(c) {
						$('#layerTree').treeview({
							data: c,
							checkedIcon: "glyphicon glyphicon-check",
							backColor: "#071D32",
							color: "#fff",
							selectedColor: "#21F2F3",

							onhoverColor: "#07A3EE",
							//showBorder:false,
							multiSelect: false,
							showCheckbox: true,
							onNodeChecked: function(event, node) { //选中节点
								setCheckChildNodes(node);
							},
							onNodeUnchecked: function(event, node) {
								//判断取消选中节点
								setUnCheckChildNodes(node);

							},
							onNodeSelected: function(event, node) //节点选中事件
							{

								if(node.nodes == undefined) {
									var parentNode = $("#layerTree").treeview("getNode", node.parentId);
									var layername = node.text

									var layer = that.getLayer(layername);
									if(typeof b === 'object') {
										b.viewer.flyTo(layer, {
											duration: 2
										});
									}

								}

							}

						});

					}
					var setCheckChildNodes = function(currentnode) {
						if(currentnode.nodes === undefined) {
							var parentNode = $("#layerTree").treeview("getNode", currentnode.parentId);
							var layername = currentnode.text;

							var layer = that.getLayer(layername);
							if(layer) {
								var layerType = layer.layer3DType;
								var layerTypeBIM = currentnode.text.split('@')[1];
								if(layerTypeBIM === "BIM") {
									var flattenFeature = findDatabyName(currentnode.text);
									if(flattenFeature !== undefined) {
										var position = Conver2DPointsTo3DByheight(flattenFeature.geometry.coordinates, flattenFeature.properties.BottomAttitude)
										var name = currentnode.text + randomString(5);
										if(layer.FlattenRegionName === undefined) {
											layer['FlattenRegionName'] = name
										} else {
											layer.FlattenRegionName = name
										}
										var QXModellayer = that.getLayer('龙兴智慧园区倾斜摄影');
										QXModellayer.addFlattenRegion({
											position: position,
											name: name
										})
									}

								}
								switch(layerType) {
									case 0:
										layer.show = true;
										break;
									case 1:
										break;
									case 2:
										layer.visible = true;

										break;
								}
							}

						} else {
							var uncheckedChildNodes = getChildNodeUncheck(currentnode)

							$('#layerTree').treeview('checkNode', [uncheckedChildNodes.nodesID, {
								silent: true
							}]);
							currentnode.nodes.forEach(function(childnode) {
								setCheckChildNodes(childnode);
							})
						}
					}
					var setUnCheckChildNodes = function(currentnode) {
						if(currentnode.nodes === undefined) {
							var parentNode = $("#layerTree").treeview("getNode", currentnode.parentId);
							var layername = currentnode.text;

							var layer = that.getLayer(layername);
							if(layer) {
								if(layer.FlattenRegionName !== undefined) {
									var QXModellayer = that.getLayer('龙兴智慧园区倾斜摄影');
									QXModellayer.removeFlattenRegion(layer.FlattenRegionName)
								}
								var layerType = layer.layer3DType;
								switch(layerType) {
									case 0:
										layer.show = false;
										break;
									case 1:
										break;
									case 2:
										layer.visible = false;
										break;
								}
							}

						} else {
							var checkedChildNodes = getChildNodechecked(currentnode)

							$('#layerTree').treeview('uncheckNode', [checkedChildNodes.nodesID, {
								silent: true
							}]);
							currentnode.nodes.forEach(function(childnode) {
								setUnCheckChildNodes(childnode);
							})
						}
					}
					// 选中父节点时，选中所有子节点
					function getChildNodeIdArr(node) {
						var ts = [];
						if(node.nodes) {
							for(x in node.nodes) {
								ts.push(node.nodes[x].nodeId);
								if(node.nodes[x].nodes) {
									var getNodeDieDai = getChildNodeIdArr(node.nodes[x]);
									for(j in getNodeDieDai) {
										ts.push(getNodeDieDai[j]);
									}
								}
							}
						} else {
							ts.push(node.nodeId);
						}
						return ts;
					}

					// 获取子节点中选中的节点
					function getChildNodechecked(node) {
						if(node.nodes) {
							var ts = {
								nodesID: [],
								nodes: []
							}; //当前节点子集中未被选中的集合
							for(x in node.nodes) {
								if(node.nodes[x].state.checked) {
									ts.nodesID.push(node.nodes[x].nodeId);
									ts.nodes.push(node.nodes[x]);
								}
								if(node.nodes[x].nodes) {
									var getNodeDieDai = node.nodes[x];
									//console.log(getNodeDieDai);
									for(j in getNodeDieDai.nodes) {
										if(getNodeDieDai.nodes[j].state.checked) {
											ts.nodesID.push(getNodeDieDai.nodes[j].nodeId);
											ts.nodes.push(getNodeDieDai.nodes[j]);
										}
									}
								}
							}
						}
						return ts;
					}
					// 获取子节点中未选中的节点
					function getChildNodeUncheck(node) {
						if(node.nodes) {
							var ts = {
								nodesID: [],
								nodes: []
							}; //当前节点子集中未被选中的集合
							for(x in node.nodes) {
								if(!node.nodes[x].state.checked) {
									ts.nodesID.push(node.nodes[x].nodeId);
									ts.nodes.push(node.nodes[x]);
								}
								if(node.nodes[x].nodes) {
									var getNodeDieDai = node.nodes[x];
									//console.log(getNodeDieDai);
									for(j in getNodeDieDai.nodes) {
										if(!getNodeDieDai.nodes[j].state.checked) {
											ts.nodesID.push(getNodeDieDai.nodes[j].nodeId);
											ts.nodes.push(getNodeDieDai.nodes[j]);
										}
									}
								}
							}
						}
						return ts;
					}

					// 选中所有子节点时，选中父节点 取消子节点时取消父节点
					function setParentNodeCheck(node) {
						var parentNode = $("#layerTree").treeview("getNode", node.parentId);
						if(parentNode.nodes) {
							var checkedCount = 0;
							for(x in parentNode.nodes) {
								if(parentNode.nodes[x].state.checked) {
									checkedCount++;
								}
							}
							if(checkedCount == parentNode.nodes.length) { //如果子节点全部被选 父全选
								//$("#tree").treeview("checkNode", parentNode.nodeId);
								//setParentNodeCheck(parentNode);
							} else if(checkedCount > 0 && checkedCount !== parentNode.nodes.length) { //如果子节点未全部被选 父未全选
								//$('#tree').treeview('checkNode', parentNode.nodeId);
								//setParentNodeCheck(parentNode);
							} else if(checkedCount === 0) //子节点全部取消，父节点也取消选中
							{
								$('#layerTree').treeview('uncheckNode', [parentNode.nodeId, {
									silent: true
								}]);
							}

						}
					}

				},
				getLayerType: function(layer) {
					if(typeof layer === 'object') {
						if(layer["hasLight"] !== undefined) {
							return this.layer3DType.S3M
						}
						if(layer["splitDirection"] !== undefined) {
							return this.layer3DType.IMANGERY
						}
						if(layer["hasWaterMask"] !== undefined) {
							return this.layer3DType.TERRAIN
						}

					}
				},
				layer3DType: {
					IMANGERY: 0,
					TERRAIN: 1,
					S3M: 2
				},
				getLayer: function(a) {
					for(var i = 0, len = this.layers.length; i < len; i++) {
						if(this.layers[i].layerName === a) {
							return this.layers[i];
						}
					}

				},
				addLayer3D: function(layerInfoObj, viewer) { //添加的IMANGERY和TERRAIN当前只支持iServer发布的服务,layerInfoObj{url, layerName, Type,minimumLevel,maximumLevel}
					var that = this;
					this.info = layerInfoObj;
					this.viewer = viewer;
					//type和url必须
					if(typeof this.info === 'object' && typeof this.viewer === "object") {
						switch(this.info.Type) {
							case 0:
								var layer = this.viewer.imageryLayers.addImageryProvider(new Cesium.SuperMapImageryProvider(this.info))
								if(layer) {
									layer["layer3DType"] = this.info.Type;
									if(this.info.layerName !== undefined) {

										layer["layerName"] = this.info.layerName;
										return layer;
									} else {
										layer["layerName"] = layer._imageryProvider._name;
										return layer;
									}
								}
								break;
							case 1:
								//创建地形服务提供者的实例，url为SuperMap iServer发布的TIN地形服务
								var a = new Cesium.CesiumTerrainProvider(this.info);
								if(a) {
									this.viewer.terrainProvider = a;
									var layerurlsplits = this.info.url.split('/');
									var layerName = layerurlsplits[layerurlsplits.length - 1];
									this.viewer.terrainProvider["layerName"] = layerName;
									return this.viewer.terrainProvider;
								} else {
									console.log('Check parameters')
								}

								break;
							case 2:
								if(this.info.url !== undefined) {
									var promise = this.viewer.scene.addS3MTilesLayerByScp(this.info.url, {
										name: this.info
									});
									promise.then(function(layer) {
										layer["layer3DType"] = this.info.Type;
										layer["layerName"] = layer._name;

									})
									return promise;

								} else {
									console.log('Check parameters')
								}

								break;
						}
					} else {
						console.log('Check parameters')
					}
				}

			}
		}
	}
};

//气泡
function Bubble(scene) {
	this.scene = scene;
	this.selection3D = '';
	var that = this;
	this.container = popup({
		titleBtns: [{ // 需要在title中添加button时，添加此项
				label: '显示',
				callback: function() {

					if(typeof that.selection3D === "object") {
						that.selection3D.layer.setOnlyObjsVisible([that.selection3D.ID], true)
					}

				}
			},
			{
				label: '隐藏',
				callback: function() {
					if(typeof that.selection3D === "object") {
						that.selection3D.layer.setOnlyObjsVisible([that.selection3D.ID], false)
					}

				}
			}
		],
		title: '对象属性', // 标题，没有则不填，　如果有titleBtns,默认有title

		// footer: '这是脚尾', // 尾部， 没有则不填 
		width: 350,
		height: 280,
		top: 40,
		left: 100,
		contentTable: { // 列表数据格式， name, value为必须
			name: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
			value: [2131, 234, 45, 5464, 2131, 234, 45, 5464, 2131, 234, 45, 5464, 2131, 234, 45, 5464, 2131, 234, 45, 5464]
		},
		dragable: true, // 是否拖动
		isDialog: true, // 是否有下面的对话框三角形
		className: 'bubbler' // 添加class命名空间
	})
	this.container.hide();
	this.scenePosition = new Cesium.Cartesian3();
	var that = this;
	this.scene.postRender.addEventListener(function() {
		var canvasHeight = that.scene.canvas.height;
		var windowPosition = new Cesium.Cartesian2();
		Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.scene, that.scenePosition, windowPosition);
		var bottom = (canvasHeight - windowPosition.y + 62) + 'px';
		var left = (windowPosition.x - 88) + 'px';
		that.container.setPosition({
			top: 'auto',
			bottom: bottom,
			left: left
		})
		//		that.container.change({
		//			bottom: bottom,
		//			left: left
		//		})
	});

}
//气泡内容修改另外通过获取dom对象修改
Bubble.prototype.showAt = function(position) {
	if(!position) {
		this.container.hide();
		return;
	}
	this.container.show();
	this.scenePosition = Cesium.Cartesian3.clone(position);

};