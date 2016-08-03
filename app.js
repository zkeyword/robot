//依赖模块
var fs      = require('fs');
var request = require("request");
var cheerio = require("cheerio");
var mkdirp  = require('mkdirp');
var url     = require('url');
var process = require('process');

var config  = require('./config');
var urlTool = require('./core/url');

var URI = require('urijs');
var url = require('url')


var responseArr    = [],
	responseTxtReg = /(css|html|htm)($|\?)/

//发送请求
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
			responseArr.push(resourceUrl);
			if( !resObj.fileName ){
				downloadHtml(resObj, body);
			}

			/* 去重 */
			responseArr = urlTool.unique(responseArr);
			arr         = urlTool.unique(arr);
			
			for(let i = 0, len = arr.length; i<len; i++){
				let urlObj  = urlTool.getUrlObj(arr[i], resourceUrl)
					fullUrl = urlObj.fullUrl;

				if( urlTool.indexOf(responseArr, fullUrl) === -1 ){
					if( responseTxtReg.test(urlObj.fileName) || ( config.isDownAll && urlObj.isCurrentHost  ) ){
						launch(urlObj.fullUrl);
					}
				}
				
				console.log('获得：'+ fullUrl);
				responseArr.push(fullUrl);
				responseArr = urlTool.unique(responseArr);
				downloadFile(urlObj);
			}
		}
	});
}

//下载方法
var downloadFile = function(urlObj){	
	var fullUrl  = urlObj.fullUrl, 
		fullDir  = config.targetDir + '/' + config.targetName  + '/' + urlObj.fullDir, 
		fileName = urlObj.fileName;
	
	mkdirp(fullDir, function(err) {
		var options = {
			url: fullUrl,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
			}
		};
		
		request(options, function(error, response, body) {
			fs.writeFile( fullDir + "/" + fileName, body, function (err) {
				if (err) throw err;
				console.log('保存成功：'+ fullUrl)
			});
		});
		
		return ;
		
		request
			.get(options)
			.on('error', function(err) {
				console.log(err)
			})
			.pipe(fs.createWriteStream(fullDir + "/" + fileName));
			
		console.log('正在下载：'+ fullUrl)
	});
	
	// return ;
    // request.head(url, function(err, res, body){
		// if( err ) return;
        // request(url).pipe(fs.createWriteStream(dir + "/" + filename));
    // });
};

var downloadHtml = function(urlObj, body){
	var fullUrl  = urlObj.fullUrl, 
		fullDir  = config.targetDir + '/' + config.targetName  + '/'  + urlObj.fullDir, 
		fileName = urlObj.fileName;
	
	mkdirp(fullDir, function(err) {
		fs.writeFile( fullDir + '/index.html', body, function (err) {
			if (err) throw err;
			console.log('保存成功：'+ fullUrl)
		});
	});
}

//监听错误
process.on('uncaughtException', function (err) {
  //打印出错误
  console.log(err);
  //打印出错误的调用栈方便调试
  console.log(err.stack);
});

//创建目录
mkdirp(config.targetDir + '/' + config.targetName  + '/', function(err) {
    if(err){
        console.log(err);
    }
});
launch(config.targetUrl);



















