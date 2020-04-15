module.exports = () => {
  // Load The FS Module & The Config File
  fs = require('fs');

  // Load The Path Module
  path = require('path');

  config = JSON.parse(fs.readFileSync('config.json'));

  // Load Express Module
  express = require('express');
  app 	= express();

  // Load Body Parser Module
  bodyParser = require('body-parser');
  //app.use(bodyParser.json());

  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  //app.use(bodyParser.urlencoded({extended: false}));
  //app.use(express.bodyParser({limit: '50mb'}));

  // Load Express Handlebars Module & Setup Express View Engine
  expressHandlebars = require('express-handlebars');
  app.set('views', __dirname+'/views/'); // Set The Views Directory
  app.engine('html', expressHandlebars({ // Setup View Engine Middleware
    layoutsDir:__dirname + '/views/layouts',
  	defaultLayout: 'main',
  	extname: '.html',
  	helpers: {
  		section: function(name, options) {

  			if(!this._sections) {
  				this._sections = {};
  			}

  			this._sections[name] = options.fn(this);
  			return null;
  		}
  	}
  }));
  app.set('view engine', 'html');

  // Load Express Session Module
  session = require('express-session');
  app.use(session({ // Setup Session Middleware
  	secret: config.session.secret,
  	saveUninitialized: true,
  	resave: true
  }));

  // Load Connect Flash Module
  flash = require('connect-flash');
  app.use(flash());
  app.use(function(req, res, next) { // Setup Global Flash Message Middleware
  	res.locals.success_msg 	= req.flash('success_msg');
  	res.locals.error_msg 	= req.flash('error_msg');
  	res.locals.error 			= req.flash('error');
  	res.locals.user 			= req.user || null;
  	next();
  });

  // Load The Bcrypt Module
  bcrypt = require('bcryptjs');

  // Setup Globally Included Directories
  app.use(express.static(path.join(__dirname, '/../bower_components/')));
  app.use(express.static(path.join(__dirname, '/../node_modules/')));
  app.use(express.static(path.join(__dirname, '/../controllers/')));
  app.use(express.static(path.join(__dirname, '/../public/')));

  // Load Available Modules For Dependancy Injection Into Models & Routes
  modules = {
  	app: app,
  	bcrypt: bcrypt,
  	bodyParser: bodyParser,
  	config: config,
  	express: express,
  	expressHandlebars: expressHandlebars,
  	flash: flash,
  	fs: fs,
  	path: path,
  	session: session
  };

app.get('/', function(req, res) {
		   res.render('pages/home');
	});

app.post('/save_data', function(req, res) {   // clear the all image once it reach to length 55 and start from begining  

        if( global.users_list.length === 55){
          global.users_list.length = 0;
        }
     
       global.users_list.push({
         "message":req.body.message.trim(),
         "image" : req.body.image
       });
       
       var dir_path = require('path').join(require('os').homedir(), 'Desktop');
       dir_path = dir_path+'/slingshot_pics/';
       var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
       var fileName = req.body.message.trim().replace(" ", "-");
       require("fs").writeFile(dir_path+fileName+".png", base64Data, 'base64', function(err) {
           return  res.send({mesage:"data saved"});
       });

	});

  // Setup Globally Included Routes
//  fs.readdirSync(path.join(__dirname, 'routes')).forEach(function(filename) {

//  	if(~filename.indexOf('.js'))
//  		require(path.join(__dirname, 'routes/'+filename))(modules);
//  });

  // Start The HTTP Server
  app.listen(config.server.port, config.server.host);
}
