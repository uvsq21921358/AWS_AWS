// modifier
app = require('express.io')()
app.http().io()
Jeu = require('./Jeu.js');

var tabJoueur = []; // buffer de joueurs ? rajouter au jeu
var tabDirection = new Array(); //buffer de joeur + direction

var express = require('express');
var session = require('express-session');
//var app = express();
var  bodyParser = require('body-parser');
var mysql = require('mysql');
const bcrypt = require('bcrypt')
/*app.get('/css/style.css', function(req, res) {
    res.sendfile(__dirname + '/css/style.css')
})
app.get('/css/reset.css', function(req, res) {
    res.sendfile(__dirname + '/css/style.css')
})
/*app.get('/js/jquery.js', function(req, res) {
    res.sendfile(__dirname + '/js/jquery.js')
})
app.get('/js/myscript.js', function(req, res) {
    res.sendfile(__dirname + '/js/myscript.js')
})*/
app.use( '/js/jquery.js',express.static(__dirname + '/js/jquery.js'));
app.use( '/css/style.css',express.static(__dirname + '/css/style.css'));
app.use('/js/myscript.js', express.static(__dirname + '/js/myscript.js'));
app.use( '/css/reset.css',express.static(__dirname + '/css/reset.css'));
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tron"
});
 con.connect(function(err) {if (err) {throw err  }})
//moteur de template
app.set('view-enigme','ejs')
//body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.get('/',function(req,res){
res.render('bienvenu.ejs');
})
app.post('/',function(req,res) {
  if(req.body.connecter){ res.redirect('/connecter')   }
  else if (req.body.inscrivez) { res.redirect('/enregistrer') }
})
app.get('/enregistrer',function(req,res){
    if(req.session.error)
      { 
        res.locals.error=req.session.error;
        req.session.error=undefined;
      }
    res.render('enregistrer.ejs');
  });


app.post('/enregistrer',function(req,res) {
  bcrypt.hash (req.body.password, 10, function (err , hash) { 
  try{ 
     
      var sql = "INSERT INTO `joueur` (`psudo`,`nom`,`prenom`,`email`,`mot_pass`) VALUES ('" + req.body.psudo + "','" + req.body.nom + "', '" + req.body.prenom + "','" + req.body.email + "', '" +  hash + "')";
      con.query(sql,function(error) {
           if (error) { res.redirect('/enregistrer')}
          });
      res.redirect('/connecter')
 }
catch{
  res.redirect('/enregistrer')
  res.render('enregistrer.ejs', {title: 'Express'})}
})});
 



app.get('/connecter',function(req,res){
  if(req.session.error)
  {
    res.locals.error=req.session.error;
    req.session.error=undefined;
  }
    res.render('connecter.ejs');
});






app.post('/connecter', function  (req, res) {
	if (req.body.psudo && req.body.mot_pass) {
		con.query('SELECT * FROM joueur where psudo = ? ', [req.body.psudo], function(error, results, fields) {
          if (results.length > 0 ){
              req.session.loggedin = true;
              req.session.username = req.body.psudo;
              bcrypt.compare (req.body.mot_pass, results[0].mot_pass, function (err, result){ 
                  if (result == true) {
                      con.query('SELECT * FROM joueur ', function(error1, results1, fields1) {
                        console.log(results1)
                        req.session.error=results1
                      })
                    res.redirect('/jeu'); } 
                  else {
                    req.session.error="mot de pass erroner " 
                    res.redirect('/connecter') }
                  })
            }	
            else{
           req.session.error="vous n'éxister pas sur notre base de donnée :( enregistrer vous d'abord !"
            
            res.redirect('/enregistrer')}
          }

          );
	} 
  else {
    req.session.error="il faut saissir le psudo et le mot de pass :( "
    res.redirect('/connecter')
  	res.end();
	}
});


//donner la page html au joueur
// Send the client html.
app.get('/jeu', function(req, res) {
   res.sendfile(__dirname + '/client.html')
})

/*app.get('/liste', function(req, res) {

 res.render('liste.ejs');
})*/
/*app.get('/jeu', function(req, res) {
  if (req.session.loggedin) {
     res.render('jeu.ejs');}
  else {
    req.session.error="Pour pouvoir jouer il faut d'abord vous connectez "
    res.redirect('/connecter')
  }
  res.end();
});*/





//accepterJoueurs
app.io.route('ready', function(req){//ajouter un joeur au buffer et sauvegarder son socket
	var objet = {};
	objet.nom = req.data;
    console.log(req.data);
	objet.socket = req.io;
	tabJoueur.push(objet);
})

app.io.route('change-direction', function(req){
    //ajoute le nom du joeur avec sa direction dans tableauDirection

   // console.log(req2.data);
	var i = 0;
	//var nom = req.data.playerName;
	var nom = req.data.playerName;
	var direction = req.data.direction;
    console.log("--------------------------------------------");
    console.log("------------------nom "+req.data.playerName);
    console.log("------------------direction "+req.data.direction);
    console.log("--------------------------------------------");
	
    for (var i = 0; i < tabDirection.length; i++) {
		if(tabDirection[i].nom === nom) {
			tabDirection[i].direction = direction;
			console.log("direction changed");
		}
	}
	
	//req.io.broadcast(tabDirection);
})

function resetServer() {
	Jeu.reset();
	tabDirection = [];
	tabJoueur = [];
	console.log("jeu reset");
}

function live(){ //boucle du jeu, donne les commande au jeux et contacte les joeurs
    console.log("cycle");
    while(tabJoueur.length>0){ //ajoute les joueur
    	var Joueur = tabJoueur.pop();
    	var nomJoueur = Jeu.addJoueur(Joueur.nom);
        var objet = {};
        objet.nom = nomJoueur;
        objet.direction = null;
        tabDirection.push(objet);
        Joueur.socket.emit('connected', nomJoueur);
        console.log("connected "+ nomJoueur);
        if(Jeu.active) {
            Joueur.socket.emit('start');
            console.log("jeu satarted new player");
            Joueur.socket.emit('update', Jeu.curState());
            app.io.broadcast('update', Jeu.newState());
        }
        //ajouter a direction avec nom
    }
    
	console.log("nb de joueur: " + Jeu.joueurs.length);
	console.log("jeu actif: " + Jeu.active);
	
    if(Jeu.joueurs.length>1 && !Jeu.active){ //si on a plus d'un joueur et le jeu n'est pas actif
        Jeu.start(); //on d?mmarre le jeu
        console.log(Jeu.active);
        app.io.broadcast('start');
        app.io.broadcast('update', Jeu.curState());
        console.log("jeu satarted");
    }

    if(Jeu.active){
        //changer direction
        for(var i = 0; i<tabDirection.length; i++) {
            Jeu.changeDirection(tabDirection[i].nom, tabDirection[i].direction);
			console.log("direction changed in live")
			console.log(tabDirection[i].direction)
        }

        Jeu.next();
		
		console.log("avancer");
		
        var morts = Jeu.collision(); //morts recupere un tableau de joeur mort a contacter
        app.io.broadcast('lost', morts);
        
        app.io.broadcast('update', Jeu.newState());
        if(Jeu.end()){
			console.log("jeu fini");
            var win = Jeu.winner(); //on sauvegarde le gagnant qu'on contactera si il y en a un
            if(win !== null) app.io.broadcast('win', win);
            //on pr?pare le jeux pour la prochaine partis
			
			resetServer();
        }
    }
    setTimeout(live, 1000);
}
live();

app.listen(3000)