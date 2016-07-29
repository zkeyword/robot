//依赖模块
var fs      = require('fs');
var request = require("request");
var cheerio = require("cheerio");
var mkdirp  = require('mkdirp');
var url     = require('url');
var process = require('process');

var config  = require('./config');
var urlTool = require('./core/url');

/* urlTool.getUrlObj('secure?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('/secure?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('//secure?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('http://127.0.0.1:8000/wordpress/secure?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('secure/Dashboard2.jspa?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('/secure/Dashboard2.jspa?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('//secure/Dashboard3.jspa?hl=zh-CN&tab=wT#en/zh-CN/current');
urlTool.getUrlObj('http://127.0.0.2:8000/wordpress/secure/Dashboard1.jpg?hl=zh-CN&tab=wT#en/zh-CN/current'); */

//发送请求
var launch = function(resourceUrl){
	request(resourceUrl, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			
			let arr = urlTool.getUrl(body);
				
			//写入主文件
			downloadHtml(urlTool.getUrlObj( resourceUrl ), body);
			
			//查找并下载资源
			for(let i = 0, len = arr.length; i<len; i++){
				let urlObj   = urlTool.getUrlObj(arr[i]);
					
				if( urlObj.fileName ){
					downloadFile(urlObj);
				}else if( config.isDownAll && urlObj.isCurrentHost ){
					
					//待建立资源表
					//launch(urlObj.fullUrl);
				}
			}
		}
	});
}

//下载方法
var downloadFile = function(urlObj){	
	var fullUrl  = urlObj.fullUrl, 
		fullDir  = config.targetDir + urlObj.fullDir, 
		fileName = urlObj.fileName;
	
	mkdirp(fullDir, function(err) {
		request
			.get(fullUrl)
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
		fullDir  = config.targetDir + urlObj.fullDir, 
		fileName = urlObj.fileName;
	
	mkdirp(fullDir, function(err) {
		fs.writeFile( fullDir + '/index.html', body, function (err) {
			if (err) throw err;
		});
			
		console.log('正在下载：'+ fullUrl)
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
mkdirp(config.targetDir, function(err) {
    if(err){
        console.log(err);
    }
});
launch(config.targetUrl);



















