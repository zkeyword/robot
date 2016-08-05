var fs      = require('fs')
	mkdirp  = require('mkdirp'),
	request = require("request"),
	config  = require('../config');

exports.index = (urlObj, html) => {	
	var fullUrl  = urlObj.fullUrl, 
		fullDir  = config.targetDir + '/' + config.targetName  + '/' + urlObj.hostname + '/' + urlObj.fullDir, 
		fileName = urlObj.fileName;
		
	mkdirp(fullDir, function(err) {
		var options = {
			url: fullUrl,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
			}
		};
		
		if( !html ){
			request(options, function(error, response, body) {
				if( fileName ){
					fs.writeFile( fullDir + "/" + fileName, body, function (err) {
						if (err) throw err;
						//console.log('保存成功：'+ fullUrl)
					});
				}else{
					fs.writeFile( fullDir + '/index.html', body, function (err) {
						if (err) throw err;
						//console.log('保存成功：'+ fullUrl)
					});
				}
			});
		}else{
			fs.writeFile( fullDir + '/index.html', html, function (err) {
				if (err) throw err;
				//console.log('保存成功：'+ fullUrl)
			});
		}
	});
};