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

	
	for(let i = 0; i < aRegex.length; i++){
		do{
			aRet = aRegex[i].exec(html);
			if(aRet){
				let str = aRet[1].trim();
				if( str && str.indexOf('javascript') === -1 && str !== '#' ) a.push(self.getUrlObj(str).fullUrl);
				
			}
		}while(aRet);
	}
	
	return a;
}

exports.getUrlObj = (str, parentSrc) => {
	let obj         = {},
		staticReg   = /\.(jpg|gif|png|ico|css|js|html|htm)($|\?)/g,
		absoluteReg = /^\/.*/,
		targetURI   = URI(config.targetUrl),
		currentURI  = URI(str),
		filename    = currentURI.filename(),
		isFile      = /\./.test(filename),
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
		if( currentURI.hostname() ){
			return currentURI.protocol() ? str : 'http:' + str;
		}
		let currentProtocol = (currentURI.protocol() ? currentURI.protocol() : 'http:'),
			targetPost      = targetURI.port(),
			targetAllHost   = currentProtocol + '//' + targetURI.hostname() + (targetPost ? ':' + targetPost : ''),
			currentPathname = currentURI.pathname(true);
		
		currentPathname = ( isFile || /\/$/.test( currentPathname ) ) ? currentPathname : currentPathname + '/'; //自动补全 /
		
		if( relativeNum ) {
			let currentURI  = URI( currentPathname.replace(/\.\.\//g, '') ),
				currentPath = currentURI.directory(true),
				parentURI   = URI( parentSrc ? parentSrc : config.targetUrl ),
				parentDir   = parentURI.directory(true),
				parentArr   = parentDir.split('/');
				
			parentArr.splice(parentArr.length-2, relativeNum);
			
			return targetAllHost + (currentPath ? '/' + currentPath + '/': '/') + currentURI.filename() + currentURI.search();
		}

		return targetAllHost + (absoluteReg.test(str) ? '': targetURI.pathname(true)) + currentPathname + currentURI.search();
	})();
	
	
	obj.fullDir = (() => {
		let fullURI = URI(obj.fullUrl);
		
		return fullURI.directory(true)
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