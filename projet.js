const fs = require('fs');
const imagemagick = require('imagemagick');
const parse = require('xml2js').parseString;

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
  								if(fileName.match('.desktop')){

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
    									var filesIcon = fs.readdirSync('/usr/share/icons/ePepirus/64x64/apps');
    									filesIcon.forEach(fileIcon => {
    											if(fileIcon.split('.')[0] === appIcon)
    													iconLocation = '/usr/share/icons/ePepirus/64x64/apps/'+fileIcon;
    									});
    									if(iconLocation === null){
    										var filesIcon = fs.readdirSync('/usr/share/icons/elementary-xfce/apps/64');
    										filesIcon.forEach(fileIcon => {
    											if(fileIcon.split('.')[0] === appIcon)
    													iconLocation = '/usr/share/icons/elementary-xfce/apps/64/'+fileIcon;
    										});
    									}
    									for( let i=0; i < appCategories.length; i++){
    											categories[appCategories[i]].push(
    												{
    													'Name':appName,
    													'Comment':appComment,
    													'Icon':{  Name : appIcon, Location : iconLocation  }
    												});
    									}


    							}
   						});

   						callback(categories);
				});
		});
		
}

function convertImage(directory , dest){

		var files = fs.readdirSync(directory);
		files.forEach((fileName) => {
			imagemagick.convert([directory+'/'+fileName, 'Image/'+fileName.split('.')[0]+'.jpg'], 
			function(err, stdout){
				if (err) throw err;
				console.log('stdout:', stdout);
			});
		});

}


function render_appsByCategory(categories, category){
	let html = '<ul>';
	if(categories[category]){
		var files = fs.readdirSync('/usr/share/icons/elementary-xfce/apps/64');

			for(let i=0; i<categories[category].length; i++){

					html += '<li>'+categories[category][i].Name;

					let findIcon = false;
					files.forEach( fileName => {
				
							if(fileName.split('.')[0] === categories[category][i].Icon){
									html += '<img src="/usr/share/icons/elementary-xfce/apps/64/'+fileName+'">';
									findIcon = true;
							}
							
									
						//html += '<li>'+categories[category][i].Icon+'</li>';
					});

					if( findIcon === false)
							html += '<span style="color:red">'+categories[category][i].Icon+'</span>';

					html += '</li>';
			}
	}
	html += '</ul>';
	console.log(html);
	return html;
}

function render_menu(categories,callback){ //categories is from classify_appsByCategory
	fs.readFile('/etc/xdg/menus/xfce-applications.menu',"utf8", (err, data) => {
		if (err) throw err;

		var html = '<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body>\n';

		
		parse(data, (err,res) => {
				res.Menu.Menu.forEach((menu) => {
					html += '<ul>\n';
					if(menu.Name)
						html = html+'<li>'+menu.Name[0]+'</li>\n';
					if(menu.Directory)
						html = html+'<li>Directory '+menu.Directory[0]+'</li>\n';	//usr/share/desktop-directories/	with xfce- lxde- preposition		
					if(menu.Include && menu.Include[0] && (menu.Include[0].Category ||
					(menu.Include[0].Or && menu.Include[0].Or[0] && menu.Include[0].Or[0].Category))){

						let category = menu.Include[0].Category ? menu.Include[0].Category : menu.Include[0].Or[0].Category;

						if(categories[category[0]])
								for(let i=0; i < categories[category[0]].length; i++) {
										//html += '<li>'+categories[category[0]][i].Name+'<li>\n';//usr/share/applications
										if(categories[category[0]][i].Icon.Location)
										html += '<li><img src="'+categories[category[0]][i].Icon.Location+'"></li>\n';
										else
										html += '<li>'+categories[category[0]][i].Icon.Name+'</li>\n';
								}
					}

					html += '</ul>';
				});

				html += '</body></html>';
				callback(html);
		});

	});
}

function createWindow () {

	//convertImage('/usr/share/pixmaps',null);
  // Cree la fenetre du navigateur.
	win = new BrowserWindow({ width: 800, height: 600,frame: false });
	win.setAlwaysOnTop(true, 'screen');


	classify_appsByCategory(    (apps) => render_menu(apps,   (data) => {
		fs.writeFile(".menu.html", data, function(err) {
			if(err)
				throw err;
				
			win.loadFile(".menu.html");
		});
		
	}));
}

app.on('ready', createWindow);

