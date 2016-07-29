var url     = require('url'),
	config  = require('../config');

exports.getUrl = (html)=>{
	let a = [];
	
	if(!html){
		return a;
	}
	
	let aRegex = [
		/<a.*?href=['"]([^"']*)['"][^>]*>/gmi,
		/<script.*?src=['"]([^"']*)['"][^>]*>/gmi,
		/<link.*?href=['"]([^"']*)['"][^>]*>/gmi,
		/<img.*?src=['"]([^"']*)['"][^>]*>/gmi,
		/url\s*\([\\'"]*([^\(\)\+]+)[\\'"]*\)/gmi, //CSS背景
		/<iframe.*?src=['"]([^"']*)['"][^>]*>/gmi
	],
	aRet;
	
	html = html.replace(/[\n\r\t]/gm, '');
	
	for(let i = 0; i < aRegex.length; i++){
		do{
			aRet = aRegex[i].exec(html);
			if(aRet){
				let str = aRet[1].trim();
				if( str.indexOf('javascript') === -1 ) a.push(str);
			}
		}while(aRet);
	}
	
	return a;
}

exports.getUrlObj = (str, targetDir) => {
	let obj           = {},
		staticReg     = /\.(jpg|gif|png|css|js|ico|html|htm)($|\?)/g,
		absoluteReg   = /^\/.*/,
		uniqueReg     = /\/{2,}/g, // TODO //www.baidu.com  这种类型未匹配
		targetUrlObj  = url.parse(config.targetUrl)
		currentUrlObj = url.parse(str),
		pathname      =  currentUrlObj.pathname ? currentUrlObj.pathname.replace(uniqueReg, '/') : '',
		pathnameArr   = pathname.split('/'),
		lastPathname  = pathnameArr[pathnameArr.length - 1],
		isFile        = /\./.test(lastPathname);

	obj.isStaticFile = false;
		
	if( isFile ){
		obj.fileName = lastPathname;
		
		obj.fileType = (() => {
			return lastPathname.split('.')[1];
		})();
		
		obj.isStaticFile = (()=>{
			if( staticReg.test(lastPathname) ) return true;
			return false;
		})();
	}
	
	obj.fullDir = ((arr) => { 
		let tmpStr = '';
		
		if( isFile ) arr.pop();
		
		tmpStr = arr.join('/');
		
		if( currentUrlObj.protocol || absoluteReg.test(tmpStr) ) return tmpStr;
		
		return targetUrlObj.pathname + tmpStr;
	})(pathnameArr);
	
	obj.fullUrl = (()=>{
		let search = currentUrlObj.search ? currentUrlObj.search : '',
			tmpStr = '';
			
		if( currentUrlObj.protocol ) return str;
			
		if( isFile ){
			tmpStr = pathnameArr.join('/') + '/' + lastPathname + search;
		}else{
			tmpStr = pathname + search;
		}
		if( absoluteReg.test(tmpStr) ) return targetUrlObj.protocol + '//' + targetUrlObj.host + tmpStr;
		
		return config.targetUrl + tmpStr;
	})();
	
	obj.isCurrentHost = (()=>{
		if( currentUrlObj.protocol && currentUrlObj.hostname !== targetUrlObj.hostname ) return false;
		return true;
	})();

	return obj;
}