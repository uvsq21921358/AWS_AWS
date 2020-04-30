var app = require('express.io')()
app.http().io()
var express = require('express');
var session = require('express-session');
var  bodyParser = require('body-parser');
var mysql = require('mysql');
const bcrypt = require('bcrypt')
const htmlspecialchars = require('htmlspecialchars');

app.use( 'https://code.jquery.com/jquery-1.9.1.min.js',express.static(__dirname + 'https://code.jquery.com/jquery-1.9.1.min.js'));
app.use( '/css/style.css',express.static(__dirname + '/css/style.css'));
var con = mysql.createConnection({
  host: "trongame.cqsquanqskts.us-east-2.rds.amazonaws.com",
  user: "ADMIN",
  password: "1Admin-Admin",
  database: "tron",
  port:3306
});
 con.connect(function(err) {if (err) {throw err  }});
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
//moteur de template
const cookieP = require('cookie-parser');
app.use(cookieP());
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
   //On retire les caracteres speciaux (les balise em strong etc, pour eviter l'injection)
  req.body.psudo=  htmlspecialchars(req.body.psudo);
req.body.password=htmlspecialchars(req.body.password)
req.body.nom =htmlspecialchars(req.body.nom )
req.body.prenom =htmlspecialchars(req.body.prenom)
req.body.email=htmlspecialchars(req.body.email)
  bcrypt.hash (req.body.password, 10, function (err , hash) { 
  try{ 
     
      var sql = "INSERT INTO `joueur` (`psudo`,`nom`,`prenom`,`email`,`mot_pass`,`NbrPartieJouer`,`NbrPartiePerdu`,`NbrPartieGagner` ) VALUES (?,?,?,?,?,?,?,?)";

      con.query(sql,[req.body.psudo,req.body.nom,req.body.prenom,req.body.email,hash,0 , 0, 0 ],function(error) {
           if (error) { res.redirect('/enregistrer')}
          });
      res.redirect('/connecter')
 }
catch{
  res.redirect('/enregistrer')
  res.render('enregistrer.ejs', {title: 'Express'})}
})});
 

app.get('/quiter', function(req,res){{
  req.session.destroy();res.redirect('/');}});

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
    // Gestionnaire login, avec requête préparée
    con.query('SELECT * FROM joueur where psudo = ? ', [req.body.psudo], function(error, results, fields) {
          if (results.length > 0 ){
              req.session.loggedin = true;
              req.session.username = req.body.psudo;
              req.session.psudo = results[0].psudo;
              req.session.email = results[0].nom;
              req.session.prenom = results[0].prenom;
              req.session.email = results[0].email;
              req.session.mot_pass = results[0].mot_pass;
              req.session.NbrPartieGagner = results[0].NbrPartieGagner;
              req.session.NbrPartiePerdu = results[0].NbrPartiePerdu;
              req.session.NbrPartieJouer = results[0].NbrPartieJouer;

              bcrypt.compare (req.body.mot_pass, results[0].mot_pass, function (err, result){ 
                  if (result == true) {
                      con.query('SELECT * FROM joueur ', function(error1, results1, fields1) {
                      //  console.log(results1)
                        req.session.error=results1
                      })
                      
                      console.lo
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
app.get('/profil', function(req, res) {
 console.log("session" ,req.session.psudo)
 res.render('profil.ejs',{psudo:req.session.psudo,NbrPartieJouer:req.session.NbrPartieJouer,NbrPartieGagner:req.session.NbrPartieGagner,NbrPartiePerdu:req.session.NbrPartiePerdu});
})
var nomlylia;
//donner la page html au joueur
// Send the client html.
app.get('/jeu', function(req, res) {
  if (req.session.loggedin) {
nomlylia = req.session.psudo;
    res.render('client.ejs',{psudo:req.session.psudo,NbrPartieJouer:req.session.NbrPartieJouer,NbrPartieGagner:req.session.NbrPartieGagner,NbrPartiePerdu:req.session.NbrPartiePerdu})
}
  else {
    req.session.error="Pour pouvoir jouer il faut d'abord vous connectez "
    res.redirect('/connecter')
  }
  
})





class Position {
  constructor(x, y){ 
    this.x = x;
    this.y = y;}
  copy () {
        return new Position(this.x, this.y);
    };
}

  class Joueur {
  constructor(nom){
    this.nom = nom;
    this.direction = null;
    this.position = {};
    this.trace = [];
    }
    setPos (position) {
    this.position = position;
    this.trace.push(this.position.copy());
  }
}
var joueurs = [];
var perdant = null;
var HAUTEUR = 100;
var LARGEUR = 200;
var lancer = false;
var lancer_le_jeu = function () { //
  lancer = true;
  
};
 ajouter_Joueur = function (joueur) {   
    var nJoueur = joueur;
    
    for (var i = 0; i < joueurs.length; i++) {
    if(joueurs[i].nom === joueur) {
      joueurs.splice(i, 1);
    }
  }
    var jo = new Joueur(nJoueur);
    if (joueurs.length==0){
         jo.setPos(new Position(120,60));
        jo.direction = "right";}
   
    else if(joueurs.length==1){
        jo.setPos(new Position(130,70));
        jo.direction = "left";
    }
    joueurs.push(jo);
  return nJoueur;
};
    
var changer_Direction = function (nom, direction) {
    for (i = 0; i < joueurs.length; i++) {
        if (joueurs[i].nom === nom) {
     if (direction === "right" || direction === "left") {
            if (joueurs[i].direction === "38" || joueurs[i].direction === "40") {
                joueurs[i].direction = direction;
        }
        } else if (direction === "38" || direction === "40") {
            if (joueurs[i].direction === "right" || joueurs[i].direction === "left") {
                joueurs[i].direction = direction;
      }
        }
            break;
        }
    }
};

var avancer = function () {  //fais avancer tous les joueur et met a jour les trace
    for (i = 0; i < joueurs.length; i++) {
           if( joueurs[i].direction === "right") {
             joueurs[i].position.x++;
        } else if ( joueurs[i].direction === "left") {
             joueurs[i].position.x--;
        } else if ( joueurs[i].direction === "38") {
             joueurs[i].position.y--;
        } else if ( joueurs[i].direction === "40") {
             joueurs[i].position.y++;
             
        }
        joueurs[i].trace.push( joueurs[i].position.copy());
       if(!(joueurs[i].position.x >= LARGEUR || joueurs[i].position.x < 0 || joueurs[i].position.y >= HAUTEUR || joueurs[i].position.y < 0)) {
      //  canvas[joueurs[i].position.x][joueurs[i].position.y] = case_occuper;
    }
    }
};
    
var fic_json = function () { //renvois le fichier JSON a donner au client
    var table = [];
    for (i = 0; i < joueurs.length; i++) {
        var object = {};
        object.nom = joueurs[i].nom;
        object.trace = joueurs[i].trace;
        table.push(object);
    }
            
    return JSON.stringify(table);
};

    
var collision = function () { //renvois les joueurs qui on fait une collision
  var mort = [];
  var mort;
  for (i = 0; i < 2; i++) { //On vérifie pour chaque joueur qu'il n'y a pas de collision
        if(joueurs[i].position.x >= LARGEUR || joueurs[i].position.x < 0 || joueurs[i].position.y >= HAUTEUR || joueurs[i].position.y < 0) {
            mort.push(joueurs[i].nom);
        } else  {
            for(var j = 0; j < joueurs.length; j++) {
            for(var t = 0; t < joueurs[j].trace.length; t++) {
                if(!(joueurs[i]===joueurs[j] && t+1 === joueurs[j].trace.length)) { //ignore if j and i is same player and if trace is current position
                   if(joueurs[i].position.x === joueurs[j].trace[t].x && joueurs[i].position.y === joueurs[j].trace[t].y){
                      mort.push(joueurs[i].nom);
                    }
                 }
               }
            }
         } 
     }
  
  for(var i = 0; i<mort.length; i++) {
      for(var j = 0; j<joueurs.length; j++) {
          if(mort[i] === joueurs[j].nom) {
          perdant =joueurs.splice(j, 1);
          break;
          }
      }
  }
  return mort;
};
  
var est_fin = function () { //renvois true si il y a 1 joueur ou moins
    return (joueurs.length < 2);
};
    
var winner = function () {  //renvois le gagnant
    if (joueurs.length === 1) {
        return joueurs[0].nom;
    }
    return null;
};      

var reset = function () {
    lancer = false;
    joueurs.splice(0);
    perdant= null;
};















var perdu =0 ;
var tabJoueur = []; 
var tabDirection = new Array(); 

app.io.route('ready', function(req){//ajouter un joeur au buffer et sauvegarder son socket
  var objet = {};
  objet.nom = nomlylia;
  objet.socket = req.io;
  tabJoueur.push(objet);
})
 //ajoute le nom du joeur avec sa direction dans tableauDirection
app.io.route('changer_direction', function(req){
  var nom = req.data.playerName;
  var direction = req.data.direction;
    for (var i = 0; i < tabDirection.length; i++) {
    if(tabDirection[i].nom === nom) {
      tabDirection[i].direction = direction;
    }
  }
})

function Start(){ //boucle du jeu, donne les commande au jeux et contacte les joeurs
    while(tabJoueur.length>0){ //ajoute les joueur
      var Joueur = tabJoueur.pop();
      var nomJoueur = ajouter_Joueur(Joueur.nom);
        var objet = {};
        objet.nom = nomJoueur;
        objet.direction = null;
        tabDirection.push(objet);
        Joueur.socket.emit('Direction', nomJoueur);
    }
    if(joueurs.length === 2 && !lancer){ //si on a plus d'un joueur et le jeu n'est pas actif
        lancer_le_jeu(); 
        app.io.broadcast('lancer_le_jeu');
        app.io.broadcast('update', fic_json());
    }

    if(lancer){
       for(var i = 0; i<tabDirection.length; i++) {
            changer_Direction(tabDirection[i].nom, tabDirection[i].direction);
          }
        avancer();
        var perdant = collision(); //morts recupere un tableau de joeur mort a contacter
        app.io.broadcast('perdre', perdant);
         app.io.broadcast('update', fic_json());
         if (perdant) {
            var sql="SELECT * FROM joueur where psudo =  '"+ perdant +" ' ";
                    con.query(sql, function(error, results, fields) {
                    if (error) throw error;
                    else{ if (results.length > 0 ){
                          perdu=results[0].NbrPartiePerdu +1;
                          con.query("UPDATE  `joueur` SET `NbrPartiePerdu`=?   WHERE `psudo`=? ; ", [perdu,perdant],function (err, results,){
                              if (err) throw err;
                          });
                        }
                      }
                   })
               var sql="SELECT * FROM joueur where psudo =  '"+ perdant +" ' ";
                    con.query(sql, function(error, results, fields) {
                    if (error) throw error
                    else{ if (results.length > 0 ){
                           var partie=results[0].NbrPartieJouer ;
                          partie=partie +1;
                          con.query("UPDATE  `joueur` SET `NbrPartieJouer`=?   WHERE `psudo`=? ; ", [partie,perdant],function (err, results,){
                              if (err) throw err;
                          });
                        }
                      }
                    })
                  }
        if(est_fin()){

            var gagnant = winner();
            if(gagnant !== null) {
               app.io.broadcast('gagner', gagnant);
                var sql="SELECT * FROM joueur where psudo =  '"+ gagnant +" ' ";
          con.query(sql, function(error, results, fields) {
            if (error) console.log(" ")
              else{ if (results.length > 0 ){
                          console.log(" " + results[0].NbrPartieGagner);
                          var gagnee=results[0].NbrPartieGagner+1 ;
                          console.log("avant " +gagnee)
                          console.log(" apes " +gagnee)
                          con.query("UPDATE `joueur` SET `NbrPartieGagner`=? WHERE `psudo`=? ; ", [gagnee,gagnant],function (err, results,){
                              if (err) throw err;
                              console.log( " record(s) updated   " + err +" " + gagnee);
                            });
                        }
                      }
                    })
               var sql="SELECT * FROM joueur where psudo =  '"+ gagnant +" ' ";
                    con.query(sql, function(error, results, fields) {
                    if (error) console.log(" ")
                    else{ if (results.length > 0 ){
                          console.log(" " + results[0].NbrPartieJouer);
                          var nbr_partie=results[0].NbrPartieJouer ;
                          console.log("avant " +nbr_partie)
                          nbr_partie=nbr_partie +1;
                          console.log(" apes " +nbr_partie)
                          con.query("UPDATE  `joueur` SET `NbrPartieJouer`=?   WHERE `psudo`=? ; ", [nbr_partie,gagnant],function (err, results,){
                              if (err) throw err;
                              console.log( " record(s) updated   " + err +" " + nbr_partie);
                            });
                        }
                      }
                    })
                  }
    reset();
        }
    }
    setTimeout(Start, 100);
}
Start();
app.listen(3000);