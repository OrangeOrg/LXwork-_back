var dataConfig = {
	sceneUrl: 'http://localhost:8090/iserver/services/3D-lx/rest/realspace',
	cameraobj: {
		heading: 1.096033315825772,
		pitch:-0.22353025164827445,
		roll: 6.2831853071795365,
		x:-1599215.358087469,
		y: 5306262.116751819,
		z: 3157981.6508735246,
		time:3
	},
	dataServers: {
		baseMOdeldataServer:{
			url: 'http://localhost:8090/iserver/services/data-lx/rest/data/featureResults.rjson?returnContent=true',
		},		
		TiltmodeldataServer:{//倾斜单体化图层参数配置，图层名唯一
			'dtm':{
				dataSourceName:'DTM',
				dataSetName:'dtm',
				url:'http://localhost:8090/iserver/services/data-dataCD/rest/data/featureResults.rjson?returnContent=true'
			}
		}
	}
}