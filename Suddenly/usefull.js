const url = require('url');
const path = require('path');
const fs = require('fs');

_ = {
    
        mimeType : {
            '.ico': 'image/x-icon',
            '.html': 'text/html',
            '.html-utf8': 'text/html; charset=UTF-8',
            '.js': 'text/javascript',
            '.js-utf8': 'text/javascript; charset=UTF-8',
            '.json': 'application/json',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.xpm': 'image/xpm',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.eot': 'appliaction/vnd.ms-fontobject',
            '.ttf': 'aplication/font-sfnt'
        },

        is_readable : (res) => {
            let mimeType = [ 
            'text/html', 
            'text/html; charset=UTF-8',
            'text/html; charset=utf-8',
            'text/javascript',
            'text/javascript; charset=UTF-8',
            'text/javascript; charset=utf-8',
            'application/json'];
            
            let contentType = res.headers['content-type'];
            for(let i=0; i < mimeType.length; i++)
                    if(contentType === mimeType[i])
                        return true;
            return false;
        },
        
        is_html : (res) => {
            let mimeType = [ 
            'text/html', 
            'text/html; charset=UTF-8',
            'text/html; charset=utf-8' ]
            let contentType = res.headers['content-type'];
            for(let i=0; i < mimeType.length; i++)
                    if(contentType === mimeType[i])
                        return true;
            return false;
        },

        localAbsFile : (req,res) => {

            const ext = path.parse(req.url).ext;
            console.log(ext,' ',exports.mimeType[ext]);
                fs.readFile(req.url, null, function(error, content) {
                                res.writeHead(200, {"Content-Type": exports.mimeType[ext]});
                                res.end(content);
                        });
        },

        localFile : (req,res) => {
            let url = (req.url === '/') ? '/index.html' : req.url;
            let pathname = path.join(__dirname, url);
            const ext = path.parse(pathname).ext;
            
                fs.readFile(pathname, 'utf-8', function(error, content) {
                                res.writeHead(200, {"Content-Type": exports.mimeType[ext]});
                                res.end(content);
                        });
        },
        

     
        decode_url : (url,myUrl,encode) => {
            
            let s = url.match(new RegExp('\/'+encode+'\/([s|x])\/'));
            let result = null;
            
            if(s && s[1]){
                if(s[1] === 's'){
                    result = url.replace('/'+encode+'/s/','https://');
                }
                else if(s[1] === 'x'){
                    result = url.replace('/'+encode+'/x/','http://');
                }
            }
            
            return result;
        },
     
     
        encode_url : (a,url,myUrl,encode) => {
            
           // console.log(a.replace(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?/g));
        
        /*    a = a.replace(/["|(]\/\/[^"|^)]+?["|)]/g, (r) => {
                
                return r.replace('//','http://');
            });*/
           // console.log(a.match(/"\/\/[^"]+?"/g));
            return a.replace(/["|'|x22=\(] *http[s]? *: *[^"|^']+?[,|"|'|x22|\)]/gi, (r) => {
                    let t = null;
                    if(r.match(/\\\//)){ // on modifie les url dans le code javascript
                       
                            r = r.replace('http','http:\\\/\\\/'+myUrl+'\\\/'+encode+'\\\/')
                            .replace('s:\\\/\\\/','s\\\/')
                            .replace('\\\/:\\\/\\\/','\\\/x\\\/');
                       
                    }else{ // on modifie les url
                        r = r.replace('http','http://'+myUrl+'/'+encode+'/')
                        .replace('s://','s/')
                        .replace('/://','/x/');
                    }
                return r;
            });
        },
        
        
        
         erase_redirection : (body) => {
                let a,b;
            
                if (body) {
                    
                        body = body.replace(/<META[^>]+http-equiv *= *["|']refresh["|'][^>]*>/ig,function(meta){
                                a = meta.match(/content *= *["|']([0-9])+;/i);
                                b =     meta.match(/; *URL *= *([^"|^']+) *["|']/i);
                                a = a ? a[1] : null;
                                b = b ? b[1] : null;
                                return '';
                        });
                }
            
                if( a && b)
                        return {seconds:a,url:b,http_equiv:'refresh',body:body};
                
                return null;
        }

        
}
exports.mimeType = _.mimeType;
exports.localFile = _.localFile;
exports.localAbsFile = _.localAbsFile;
exports.decode_url = _.decode_url;
exports.encode_url = _.encode_url;
exports.erase_redirection = _.erase_redirection;
exports.is_readable = _.is_readable;
exports.is_html = _.is_html;
