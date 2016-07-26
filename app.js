//依赖模块
var fs      = require('fs');
var request = require("request");
var cheerio = require("cheerio");
var mkdirp  = require('mkdirp');
var url     = require('url');
var process = require('process')

var parseUrl = function(html){
    if(!html){
        return [];
    }
    var a = [];
    var aRegex = [
        /<a.*?href=['"]([^"']*)['"][^>]*>/gmi,
        /<script.*?src=['"]([^"']*)['"][^>]*>/gmi,
        /<link.*?href=['"]([^"']*)['"][^>]*>/gmi,
        /<img.*?src=['"]([^"']*)['"][^>]*>/gmi,
        /url\s*\([\\'"]*([^\(\)\+]+)[\\'"]*\)/gmi, //CSS背景
    ];
    html = html.replace(/[\n\r\t]/gm,'');
    for(var i = 0; i < aRegex.length; i++){
        do{
            var aRet = aRegex[i].exec(html);
            if(aRet){
                this.debug && this.oFile.save("_log/aParseUrl.log",aRet.join("\n")+"\n\n","utf8",function(){},true);
                //a.push(aRet[1].trim().replace(/^\/+/,'')); //删除/是否会产生问题 删除'/'会有问题(2015-10-07 17:11)
				let str = aRet[1].trim();
				if( str.indexOf('javascript') === -1 ) a.push(str);
            }
        }while(aRet);
    }
    return a;
};

var getResourceType = function(str){
	var reg = /\.(jpg|gif|png|css|js|html|htm|ico)($|\?)/g;
	if( reg.test(str) ){
		return true;
		/* if( str.indexOf('.jpg') !== -1 ) return 'jpg';
		if( str.indexOf('.gif') !== -1 ) return 'gif';
		if( str.indexOf('.png') !== -1 ) return 'png';
		if( str.indexOf('.css') !== -1 ) return 'css';
		if( str.indexOf('.js') !== -1 ) return 'js'; */
	}
	return false;
};

var getFullUrl = function(str){
	var httpReg   = /^(http:|https:)\/\/|\/\/W.+$/g, // http:// https:// //开头
		absolute  = /^\//g,
		returnStr = '';
	if( httpReg.test(str) ){
		returnStr = str;
	}else{
		if( absolute.test(str) ){
			let urlObj = url.parse(targetUrl);
			returnStr = urlObj.protocol + '//' + urlObj.host + str;
		}else{
			returnStr = str + targetUrl;
		}
	}
	
	return returnStr;
}

//发送请求
var launch = function(resourceUrl){
	request(resourceUrl, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			
			let arr = parseUrl(body),
				resourceUrlObj = url.parse( resourceUrl )
							
			//写入主文件
			mkdirp(targetDir + resourceUrlObj.pathname, function(err) {
				if(err){
					console.log(err);
				}else{
					fs.writeFile( targetDir + resourceUrlObj.pathname + '/index.html', body, function (err) {
						if (err) throw err;
						//console.log('It\'s saved!'); //文件被保存
					});
				}
			});
			
			//查找并下载资源
			for(let i = 0, len = arr.length; i<len; i++){
				let resource = arr[i],
					urlObj   = null;
				if( getResourceType(resource) ){
					let fullUrl  = getFullUrl(resource);
					let urlObj   = url.parse( fullUrl );
					let dirArr   = ( urlObj.pathname ).split('/');
					let dir      = '';
					let filename = dirArr[dirArr.length - 1];

					dirArr.pop();
					dir = dirArr.join('/');

					mkdirp(targetDir + dir, function(err) {
						if(err){
							console.log(err);
						}else{
							//console.log( '创建：' + dir + '目录' );
							download(fullUrl, targetDir + dir, filename);
						}
					});
				}else{
					if( !isDownAll ) return;
					
					let urlObj = url.parse( resource );
					
					if( urlObj.hostname ){
						//过滤非目标域名外的地址
						if( urlObj.hostname === resourceUrlObj.hostname ){
							launch(resourceUrlObj.protocol + '//' + resourceUrlObj.hostname + urlObj.pathname);
						}
					}else{
						launch(resourceUrlObj.protocol + '//' + resourceUrlObj.hostname + urlObj.pathname);
					}
					
				}
			}
		}
	});
}

//下载方法
var download = function(src, dir, filename){
	request
		.get(src)
		.on('error', function(err) {
			console.log(err)
		})
		.pipe(fs.createWriteStream(dir + "/" + filename));
		  
	// return ;
    // request.head(url, function(err, res, body){
		// if( err ) return;
        // request(url).pipe(fs.createWriteStream(dir + "/" + filename));
    // });
};



//目标网址
var targetUrl = 'http://baidu.com';

//本地存储目录
var targetDir = './download';

//是否遍历全站
var isDownAll = false;

//创建目录
mkdirp(targetDir, function(err) {
    if(err){
        console.log(err);
    }
});

//监听错误
process.on('uncaughtException', function (err) {
  //打印出错误
  console.log(err);
  //打印出错误的调用栈方便调试
  //console.log(err.stack);
});


launch(targetUrl);



















