app = require('express.io')()
app.http().io()
Jeu = require('./Jeu.js');

var tabJoueur = []; // buffer de joueurs ? rajouter au jeu
var tabDirection = new Array(); //buffer de joeur + direction

//donner la page html au joueur
// Send the client html.
app.get('/', function(req, res) {
   res.sendfile(__dirname + '/client.html')
})
app.get('/css/style.css', function(req, res) {
    res.sendfile(__dirname + '/css/style.css')
})
app.get('/css/reset.css', function(req, res) {
    res.sendfile(__dirname + '/css/style.css')
})
app.get('/js/jquery.js', function(req, res) {
    res.sendfile(__dirname + '/js/jquery.js')
})
app.get('/js/myscript.js', function(req, res) {
    res.sendfile(__dirname + '/js/myscript.js')
})

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

app.listen(7076)