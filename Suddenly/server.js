const request = require('request');
const express = require('express');
const http = require('http');
const fs = require('fs');
const log = console.log;
const path = require('path');
const _ = require('./usefull.js');

let protocol = 'https:';
//let website = 'www.twitch.tv';

let custom_agent = {'iphone':'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)',
    'android' : 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36'
}

function _request(req,response,Apps,url){
    let exeption = false;
    Apps.website = Apps.website === 'm.youtube.com' ? 'www.youtube.com' : Apps.website;
    
    
    if(url.match('/youtubei/v1/log_event') || url.match('accounts.google.com') || url.match('static') ){
        exeption = true;
    }
    
	let urldecoded = _.decode_url(url,'localhost:4200',Apps.encode);
	url = urldecoded ? urldecoded : Apps.protocol +'//'+ Apps.website + url;

	let r = request({ url : url , headers : {'user-agent':custom_agent.iphone}});
	
	
	
	r.on('response',function(res){

		var header = res.headers;
		delete header['x-frame-options'];
		delete header['set-cookie'];
		delete header['access-control-allow-origin'] ;
		//console.log(header);

		if(_.is_readable(res) && !exeption) {
            
			let data = '';
			res.on('data', (chunk) => data += chunk)

				.on('end', () => {
					let redirect = _.erase_redirection(data);
                    if(_.is_html(res) && res.statusCode === 200){ //console.log(redirect.url);
                        let protocol = res.request.uri.protocol ? res.request.uri.protocol : Apps.protocol;
                        Apps.protocol = protocol;
                        website = res.request.uri.host ? res.request.uri.host : Apps.website;
                        Apps.website = website;
                    }
					data = _.encode_url(data,url,'localhost:4200',Apps.encode);

					response.write(data);
					response.end();
				});

		} else
			r.pipe(response);
	});
}


class App{
	constructor(protocol,website,hook,encode){
		this.protocol = protocol;
		this.website = website;
		this.hook = hook;
		this.encode = encode;
	}
}


var server = http.createServer(function(req, res) {
		
	let google = new App('https:','www.google.com','/gptbica','app14867');
	let twitch = new App('https:','www.twitch.tv','/gpdtroi','app54862');
	let youtube = new App('https:','www.youtube.com','/ytoubet','app54866');
	let Apps = [google,youtube,twitch];
	
	if(req.url.match(/^\/local:\//)){
						_.localAbsFile(req.url.replace(/local:\//,''),res);
	}else {
	
	let resolve = false;
	for(let i =0; i< Apps.length; i++)
		switch(req.url){
			case('/') : _.localFile(req,res); resolve=true; break;
			case('/assets/menu.css') : _.localFile(req,res); resolve=true; break;
			case('/assets/contextual.css') : _.localFile(req,res); resolve=true; break;
			case('/favicon.ico') : _.localFile(req,res); resolve=true; break;
			case(Apps[i].hook) : _request(req,res,Apps[i],'/'); resolve=true; break;
			case(Apps[i].hook + '/favicon.ico') : _request(req,res,Apps[i],'/favicon.ico'); resolve=true; break;
			default :
				if(req.url.match(Apps[i].encode)){
					_request(req,res,Apps[i],req.url);
					resolve=true;
				}
		}
		
	if(resolve === false){
		testSite(req,res,Apps,0);
	}
	}
		

}).listen(4200);

function testSite(req,res,Apps,i){
		request({method: 'HEAD', uri: Apps[i].protocol+'//'+Apps[i].website + req.url}, function (error, response, body) {
				if (!error && response.statusCode !== 404) {
					_request(req,res,Apps[i], req.url);
				}else if( i<3){
					testSite(req,res,Apps,i+1);
				}
		});
}



log('server listen on port 4300');
