/* 依赖环境 */
var request = require("request");
var process = require('process');

/* 依赖模块 */
var config       = require('./config'),
	urlTool      = require('./core/url'),
	downloadFile = require('./core/downfile').index,
	responseArr  = [],
	responseTag  = 0;

/* 发送请求 */
var launch = function(resourceUrl){
	var options = {
		url: resourceUrl,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
		}
	};
	request(options, function(error, response, body) {
		if(!error && response.statusCode == 200) {

			let arr    = urlTool.getUrl(body);
				resObj = urlTool.getUrlObj( resourceUrl );
				
			/* 添加资源 */
			responseArr.push(resObj.fullUrl);
			
			if( !responseTag ){
				downloadFile(resObj);
			}

			/* 去重 */
			responseArr = urlTool.unique(responseArr);
			
			for(let i = 0, len = arr.length; i<len; i++){
				let urlObj  = urlTool.getUrlObj(arr[i], resourceUrl),
					fullUrl = urlObj.fullUrl;

				if( urlTool.indexOf(responseArr, fullUrl) === -1 ){
					if( config.isDownAll && (urlObj.isCurrentHost || urlObj.fileType === 'css') ){
						launch(urlObj.fullUrl);
					}
					if( urlObj.isStaticFile || urlObj.isCurrentHost ){
						console.log('获得：'+ fullUrl);
						responseArr.push(fullUrl);
						responseArr = urlTool.unique(responseArr);
						downloadFile(urlObj);
					}
				}
			}
			
			responseTag ++;
		}
	});
}

//监听错误
process.on('uncaughtException', function (err) {
  //打印出错误
  console.log(err);
  //打印出错误的调用栈方便调试
  console.log(err.stack);
});


launch(config.targetUrl);



















