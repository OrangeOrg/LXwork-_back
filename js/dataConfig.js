var dataConfig = {
	sceneUrl: 'http://localhost:8090/iserver/services/3D-lx/rest/realspace',
	cameraobj: {
		heading: 1.096033315825772,
		pitch: -0.22353025164827445,
		roll: 6.2831853071795365,
		x: -1599215.358087469,
		y: 5306262.116751819,
		z: 3157981.6508735246,
		time: 3
	},
	dataServers: {
		baseMOdeldataServer: {
			url: 'http://localhost:8090/iserver/services/data-lx/rest/data/featureResults.rjson?returnContent=true',
		},
		TiltmodeldataServer: { //倾斜单体化图层参数配置，图层名唯一
			'龙兴智慧园区倾斜摄影': {
				dataSourceName: 'dth',
				dataSetName: 'LXqxdth',
				url: 'http://localhost:8090/iserver/services/data-lx/rest/data/featureResults.rjson?returnContent=true',
			}
		}
	},
	BIMinfourl: 'http://114.115.164.244:8090/#/dore?projectId='
}

var CheckfieldNames = {

	"SMID": '系统ID',
	"SMSDRIW": '最西边',
	"SMSDRIN": '最北边',
	"SMSDRIE": '最东边',
	"SMSDRIS": '最南边',
	"SMUSERID": '系统用户ID',
	"SMAREA": '几何面积',
	"SMPERIMETER": '系统几何周长',
	"SMGEOMETRYSIZE": '系统几何尺寸',
	"SMGEOPOSITION": '系统几何位置',
	"USERID": '用户ID',
	'NAME': '名称',
	'BOTTOMATTITUDE': '底部高程',
	'HEIGHT': '建筑高度'
}