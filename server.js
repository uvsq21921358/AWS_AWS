var express = require('express');
var session = require('express-session');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

const bcrypt = require('bcrypt');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tron"
});
con.connect(function(err) {if (err) {throw err  }});


server.listen(1501,function(){
  console.log('Ecoute sur le port 1501');
});


io.sockets.on('connection', function (socket,req) {

    console.log('CONNEXION SOCKET REUSSIE!!!');

    socket.emit('message', 'Vous êtes bien connecté !');
    //code à lancer quand un client se connecte
    //console.log('Un client se connecte, socket.id = ' + socket.id);

    socket.broadcast.emit('message', 'Un autre client vient de se connecter ! ');
    
    socket.on('message', function(message){
      console.log('message recu : '+message);
      socket.emit('message', message);
    })

    // Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
    socket.on('message', function (message) {
        // On récupère le pseudo de celui qui a cliqué dans les variables de session
        console.log(socket.id + ' me parle ! Il me dit : ' + message);
    });

});


 
//moteur de template
app.set('view-enigme','ejs')
//body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

var sess_storage =session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
});

app.use(sess_storage);


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

     
      var sql = "INSERT INTO `joueur` (`psudo`,`nom`,`prenom`,`email`,`mot_pass`,`NbrPartieJouer`,`NbrPartiePerdu`,`NbrPartieGagner` ) VALUES ('" + req.body.psudo + "','" + req.body.nom + "', '" + req.body.prenom + "','" + req.body.email + "', '" +  hash + "',0 , 0, 0 )";

      con.query(sql,function(error) {
           if (error) { 
            res.redirect('/enregistrer')}
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
      
              req.session.psudo = results[0].psudo;
              req.session.email = results[0].nom;
              req.session.prenom = results[0].prenom;
              req.session.email = results[0].email;
              req.session.mot_pass = results[0].mot_pass;
              req.session.NbrPartieGagner = results[0].NbrPartieGagner;
              req.session.NbrPartiePerdu = results[0].NbrPartiePerdu;
              req.session.NbrPartieJouer = results[0].NbrPartieJouer;
              req.session.loggedin = true;
              req.session.username = req.body.psudo;
             
              bcrypt.compare (req.body.mot_pass, results[0].mot_pass, function (err, result){ 
                  if (result == true) {
                      con.query('SELECT * FROM joueur ', function(error1, results1, fields1) {
                        req.session.error=results1
                      })
                    res.redirect('/profil'); } 
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

app.get('/profil', function(req, res) {
 console.log("session" ,req.session.psudo)
 res.render('profil.ejs',{psudo:req.session.psudo,NbrPartieJouer:req.session.NbrPartieJouer,NbrPartieGagner:req.session.NbrPartieGagner,NbrPartiePerdu:req.session.NbrPartiePerdu});
})
app.get('/jeu', function(req, res) {
  if (req.session.loggedin) {
     res.render('jeu.ejs');}
  else {
    req.session.error="Pour pouvoir jouer il faut d'abord vous connectez "
    res.redirect('/connecter')
  }
  res.end();
});


module.exports = app;





/*var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "jeu_tron"
});

/*con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
// insertion 
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO joueur (psudo,nom,prenom,email,mot_pass) VALUES ('lkkk', 'jjj','mmm','touazi.lylia@gmail.com','lol')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});

//select
con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM joueur", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});*/