/**
 * http://medialize.github.io/URI.js/docs.html
*/

var url     = require('url'),
	URI     = require('urijs'),
	config  = require('../config');

exports.getUrl = (html)=>{
	let a    = [],
		self = this;
	
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
	html = html.replace(/\\\"|\\\'/g, '');
	html = html.replace(/\\\//g, '/');
	
	for(let i = 0; i < aRegex.length; i++){
		do{
			aRet = aRegex[i].exec(html);
			if(aRet){
				let str = aRet[1].trim();
				if( str && str.indexOf('javascript') === -1 && str !== '#' && str.indexOf('data:') === -1 ){
					a.push(self.getUrlObj(str.replace(/\'|\"/g, '')).fullUrl);
				}
			}
		}while(aRet);
	}
	return self.unique(a);
}

exports.getUrlObj = (str, parentSrc) => {
	let obj         = {},
		staticReg   = /\.(jpg|gif|png|ico|css|js|shtml|html|htm)($|\?)/g,
		absoluteReg = /^\/.*/,
		targetURI   = URI(config.targetUrl),
		currentURI  = URI( str.replace(/#.*/g, '') ),  //过滤 url hash
		filename    = currentURI.filename(),
		isFile      = /\.(bmp|jpg|gif|png|jpeg|ico|svg|ttf|woff|css|js|html|htm|php|jsp|aspx|asp|xml)$/.test(filename),
		relativeNum = str.split('../').length - 1;

	obj.isStaticFile = false;
	
	if( isFile ){
		obj.fileName = filename;
		
		obj.fileType = (() => {
			return filename.split('.')[1];
		})();
		
		obj.isStaticFile = (()=>{
			if( staticReg.test(filename) ) return true;
			return false;
		})();
	}

	obj.fullUrl = (() => {
		
		let currentProtocol = (currentURI.protocol() ? currentURI.protocol() + ':' : 'http:'),
			targetPost      = targetURI.port(),
			targetAllHost   = currentProtocol + '//' + targetURI.hostname() + (targetPost ? ':' + targetPost : '')
			currentPathname = currentURI.pathname(true);
			
		currentPathname = ( isFile || /\/$/.test( currentPathname ) ) ? currentPathname : currentPathname + '/'; //自动补全 /
		
		if( currentURI.hostname() ){
			return targetAllHost + currentPathname + currentURI.search();
		}
		
		if( targetURI.pathname(true) === '/' ) return targetURI.href();

		if( relativeNum ) {
			let currentURI  = URI( currentPathname.replace(/\.\.\//g, '') ),
				currentPath = currentURI.directory(true),
				parentURI   = URI( parentSrc ? parentSrc : config.targetUrl ),
				parentPath  = parentURI.pathname(true),
				parentArr   = parentPath.split('/');
				
			parentArr.splice(parentArr.length-1, relativeNum);

			return targetAllHost + parentArr.join('/') + (currentPath ? '/' + currentPath + '/': '/') + currentURI.filename() + currentURI.search();
		}

		return targetAllHost + (absoluteReg.test(str) ? '': ( isFile ? targetURI.directory() + '/' : targetURI.pathname(true) ) ) + currentPathname + currentURI.search();
	})();
	
	obj.fullDir = (() => {
		let fullURI = URI(obj.fullUrl);
		
		return fullURI.directory(true) + ( isFile ? '' : fullURI.filename() )
	})();
	
	obj.hostname = (()=>{
		return URI(obj.fullUrl).hostname();
	})();
	
	obj.isCurrentHost = (()=>{
		let fullURI = URI(obj.fullUrl);
		
		if( fullURI.hostname() !== targetURI.hostname() ) return false;
		
		return true;
	})();
		
	return obj;
}

exports.indexOf = (urlArr, src)=>{
	for (var i = urlArr.length - 1; i >= 0; i--) {
		if( urlArr[i] === src ){
			return i
		}
	}
	return -1
}

exports.unique = (urlArr)=>{
    var result = [], hash = {};
    for (var i = 0, elem; (elem = urlArr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}