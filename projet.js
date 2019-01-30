const fs = require('fs');
const parse = require('xml2js').parseString;
require('./Suddenly/server.js');
const  electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;



function classify_appsByCategory(callback){

	fs.readFile('/etc/locale.gen',"utf8", (err, language) => {
		if (err) throw err;
		var lang = 'fr';

		fs.readdir('/usr/share/applications/', (err, filesName) => {
			if (err) throw err;
			var categories = {};
			filesName.forEach(fileName => {
				if(fileName.match(/\.desktop$/)){

					var file = fs.readFileSync('/usr/share/applications/'+fileName,"utf8");
					var appName = null;
					var appComment = null;
					var appIcon = null;
					var appCategories = [];
					file.split('\n').forEach( line => {
						var variable = line.split('=');
						if(variable)
							switch(variable[0]){
								case 'Categories' :
									variable[1].split(';').forEach( category => {
										if(category !== '') {
											appCategories.push(category);
											if(!categories[category])
												categories[category] = [];			//we make categories
										}
									});
								break;
								case 'Name' : appName = variable[1]; break;
								case 'Name['+lang+']' : appName = variable[1]; break;
								case 'Comment' : appComment = variable[1]; break;
								case 'Comment['+lang+']' : appComment = variable[1]; break;
								case 'Icon' : appIcon = variable[1]; break;
							}
					}); 

					var iconLocation = null;
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/elementary-xfce/apps/48');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/elementary-xfce/apps/48/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/Pepirus/64x64/apps');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/Pepirus/64x64/apps/'+fileIcon;
						});
					}

					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/Peppermix/48x48/apps/');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/Peppermix/48x48/apps/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/hicolor/48x48/apps/');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/hicolor/48x48/apps/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/Numix-Circle/48/apps');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/Numix-Circle/48/apps/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/elementary-xfce/devices/48/');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/elementary-xfce/devices/48/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/elementary-xfce/places/48');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/elementary-xfce/places/48/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/elementary-xfce/mimes/48');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/elementary-xfce/mimes/48/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/hicolor/48x48/apps');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/hicolor/48x48/apps/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/Adwaita/48x48/emblems/');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/Adwaita/48x48/emblems/'+fileIcon;
						});
					}
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/hicolor/scalable/devices/');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/hicolor/scalable/devices/'+fileIcon;
						});
					}
					
					for( let i=0; i < appCategories.length; i++){
						categories[appCategories[i]].push(
							{
								'Name':appName,
								'Comment':appComment,
								'Icon':{  Name : appIcon, Location : (iconLocation === null) ? appIcon : iconLocation  }
							});
					}
					
					


				}
			});
			
			callback(categories);
		});
	});

}


function render_directory(name,dir,lang){
	var file = fs.readFileSync('/usr/share/desktop-directories/'+dir,"utf8");
					var appName = null;
					var appComment = null;
					var appIcon = null;
					file.split('\n').forEach( line => {
						var variable = line.split('=');
						if(variable)
							switch(variable[0]){
								case 'Name' : appName = variable[1]; break;
								case 'Name['+lang+']' : appName = variable[1]; break;
								case 'Comment' : appComment = variable[1]; break;
								case 'Comment['+lang+']' : appComment = variable[1]; break;
								case 'Icon' : appIcon = variable[1]; break;
							}
					});
					
					var iconLocation = null;
					if(iconLocation === null){
						var filesIcon = fs.readdirSync('/usr/share/icons/elementary-xfce/categories/48/');
						filesIcon.forEach(fileIcon => {
							if(fileIcon.split('.')[0] === appIcon)
								iconLocation = '/usr/share/icons/elementary-xfce/categories/48/'+fileIcon;
						});
					}

					return '			<li>\n'+
					'				<a href="#'+name+'">\n'+
					'					<figure>\n'+
					'						<img width="30" src="/local'+iconLocation+'"/><figcaption>'+appName+'</figcaption>\n'+
					'					</figure>\n'+
					'				</a>\n'+
					'			</li>\n';
}

function render_menu(categories,callback){ //categories is from classify_appsByCategory
	fs.readFile('/etc/xdg/menus/xfce-applications.menu',"utf8", (err, data) => {
		if (err) throw err;

		var html =	`<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="assets/menu.css">
<link rel="stylesheet" type="text/css" href="assets/contextual.css">
</head>
<body>\n`;

html += '<div id="menu">\n';


		parse(data, (err,res) => {
			let nb_div = 0;
			
			let skel = [];
				let menus = res.Menu.Menu;
				
				for(let i=0; i < menus.length; i++){
					let menu = menus[i];
					
					skel.push({name:menu.Name,directory:menu.Directory[0],items:[]});
					
					if(menu.Include && menu.Include[0] && (menu.Include[0].Category ||
					(menu.Include[0].Or && menu.Include[0].Or[0] && menu.Include[0].Or[0].Category))){

						let category = menu.Include[0].Category ? menu.Include[0].Category : menu.Include[0].Or[0].Category;
						skel[i].items.push([]);
						let Icount = 0;
						for( let j=0; j < category.length; j++){
							if(categories[category[j]])
								for(let k=0; k < categories[category[j]].length; k++) {
									skel[i].items[skel[i].items.length-1].push(categories[category[j]][k]);
									Icount++;
									if(Icount % 24 === 0)
										skel[i].items.push([]);
								}
						}
					}
					html += '<div id="'+skel[i].name+'">\n';
					for(let j=0; j< skel[i].items.length; j++)
						html += '	<div id="'+skel[i].name+'_p'+j+'">\n';
				}
				html += '<div id="contextual-fs">\n';
				html += '<div id="contextual-ls">\n';

				html += '		<div id="wraper">\n';
				html += '			<div id="contextual">\n';
				html += ' 				<iframe id="iframe" src="gptbico"></iframe>\n';
				html += '				<a href="#contextual-fs"><div id="contextual-fs-icon"></div></a>';
				html += '				<a href="#contextual-ls"><div id="contextual-ls-icon"></div></a>';
				html += '			</div>\n';
				html += '			<div id="menu-wraper">\n';
				
				html += '		<ul id="menu-ul">\n';
				html += '<li><a href="#wraper"><figure><img width="30" src="gptbico/favicon.ico"></figure></a></li>\n';
				for( let i=0; i < skel.length; i++ )
					html += render_directory(skel[i].name, skel[i].directory ,'fr');
				
				html += '		</ul>\n';
				html += '		</div>\n';

				html += '		<div id="background">\n';
				
				html += '			<div id="menu-items">\n';
				
				for( let i=0; i < skel.length; i++){
					html += '				<div class="menu-item">\n';
					
					html += '					<div class="background-page">\n';
					html += '						<div class="pages">\n';
					
					for(let j=0; j< skel[i].items.length; j++){
						

						html += '							<ul class="page-ul">\n';
						
						for(let k=0; k < skel[i].items[j].length; k++) {
							
							let item = skel[i].items[j][k];
							
							html += '								<li><figure><img width="48" height="48" src="/local' + item.Icon.Location +'">'+
								'<figcaption>'+
								'<p class="appName">'+ item.Name + '</p></figcaption></figure>'+
								'<p class="appComment">' + item.Comment + '</p>' +'</li>\n';
						}
						html += '							</ul>\n';
					}
					html += '						</div>\n';
					html += '					</div>\n';
					html += '					<ul class="menu-page-ul">\n';
					
					for(let j=0; j< skel[i].items.length; j++)
						html += '						<li><a id="'+skel[i].name+'_b'+j+'" href="#'+skel[i].name+'_p'+j+'"></a></li>\n';
						
					html += '					</ul>\n';
					html += '				</div>\n';
				
				}
				
				for( let i=0; i < skel.length; i++ ){
					html += '</div>\n';
					for(let j=0; j< skel[i].items.length; j++)
						html += '</div>\n';
				}
				html += '</div>\n';
				html += '</div>\n';
				html += '</div>\n';
				html += '</div>\n';
					html += '</div>\n';
				html += '</div>\n';
				html += '</body>\n</html>\n';
				
			callback(html);
		});

	});
}

function createWindow () {

	//convertImage('/usr/share/pixmaps',null);
	// Cree la fenetre du navigateur.
	win = new BrowserWindow({ width: 1200, height: 600, frame: false });
	win.setAlwaysOnTop(true, 'screen');


	classify_appsByCategory(    (apps) => render_menu(apps,   (data) => {
		fs.writeFile("Suddenly/index.html", data, function(err) {
			if(err)
				throw err;

			win.loadURL("http://127.0.0.1:4200/");
		});

	}));
}

app.on('ready', createWindow);
