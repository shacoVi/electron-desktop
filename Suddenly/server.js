const request = require('request');
const express = require('express');
const http = require('http');
const fs = require('fs');
const log = console.log;
const path = require('path');
const _ = require('./usefull.js');

let protocol = 'https:';
let website = 'www.twitch.tv';

let custom_agent = {'iphone':'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)',
    'android' : 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36'
}

function _request(req,response,url){
    let exeption = false;
    
    website = website === 'm.youtube.com' ? 'www.youtube.com' : website;
    
    
    if(url.match('/youtubei/v1/log_event') || url.match('accounts.google.com') ){
        exeption = true;
    }
    
	let urldecoded = _.decode_url(url,'localhost:4200','app14867');
	url = urldecoded ? urldecoded : protocol +'//'+ website + url;


	let r = request({ url : url , headers : {'user-agent':custom_agent.iphone}});
    console.log(url);
	r.on('response',function(res){

		var header = res.headers;
		delete header['x-frame-options'];
		delete header['set-cookie'];
		delete header['access-control-allow-origin'] ;
		console.log(header);

		if(_.is_readable(res) && !exeption) {
            
			let data = '';
			res.on('data', (chunk) => data += chunk)

				.on('end', () => {
					let redirect = _.erase_redirection(data);
                    if(_.is_html(res) && res.statusCode === 200){ //console.log(redirect.url);
                        protocol = res.request.uri.protocol;
                        website = res.request.uri.host;
                       // console.log(res.request.uri.protocol,'>>>>> ',res.request.uri.host);
                       // console.log(res.statusCode);
                        //console.log(res);
                    }
					data = _.encode_url(data,url,'localhost:4200','app14867');

					response.write(data);
					response.end();
				});

		} else
			r.pipe(response);
	});
}



var server = http.createServer(function(req, res) {
	switch(req.url){
		case('/') : _.localFile(req,res); break;
		case('/assets/menu.css') : _.localFile(req,res); break;
		case('/assets/contextual.css') : _.localFile(req,res); break;
		case('/favicon.ico') : _.localFile(req,res); break;
		case('/gptbico') : _request(req,res,'/'); break;
		case('/gptbico/favicon.ico') : _request(req,res,'/favicon.ico'); break;
		default :
			if(req.url.match(/local\//)){
					req.url = req.url.replace(/local\//,'');
					_.localAbsFile(req,res);
			}
			else if(req.url){
				_request(req,res,req.url);
			}
	}

}).listen(4200);





log('server listen on port 4300');
