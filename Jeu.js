//var Coordonnee = require("./Coordonnee.js");
function Coordonnee(x, y) {
    this.x = x;
    this.y = y;

    this.copy = function () {
        return new Coordonnee(this.x, this.y);
    };

    this.equals = function (Coordonnee) {
        return this.x === Coordonnee.x && this.y === Coordonnee.y;
    };
}

function Joueur(nom) {
    this.nom = nom;
    this.direction = null;
    this.position = {};
    this.trace = [];
    
    this.setPos = function(position) {
		this.position = position;
		this.trace.push(this.position.copy());
	}
    
    this.changeDirection = function (direction) {
        if (direction === "right" || direction === "left") {
            if (this.direction === "up" || this.direction === "down") {
                this.direction = direction;
				console.log("direction changed in player");
            }
        } else if (direction === "up" || direction === "down") {
            if (this.direction === "right" || this.direction === "left") {
                this.direction = direction;
				console.log("direction changed in player")
			}
        }
        return this;
    };
    
    this.avancer = function () {
        if(this.direction === "right") {
            this.position.x++;
            this.trace.push(this.position.copy());
        } else if (this.direction === "left") {
            this.position.x--;
            this.trace.push(this.position.copy());
        } else if (this.direction === "up") {
            this.position.y--;
            this.trace.push(this.position.copy());
        } else if (this.direction === "down") {
            this.position.y++;
            this.trace.push(this.position.copy());
        }
        return this;
    };
}

//var Joueur = require('./Joueur.js');

var joueurs = [];
var morts = [];
var HAUTEUR = 40;
var LARGEUR = 70;
var canvas;
var defCoo = {x: [], y: []};
defCoo.x = [17, 53, 53, 17];
defCoo.y = [10, 30, 10, 30];

var setCanvas = function() {
	canvas = new Array(LARGEUR);
	for(var i = 0; i<canvas.length; i++){
		canvas[i] = [];
	}
}

setCanvas();


var outOfCanvas = function (coordonnee) {
    return coordonnee.x >= LARGEUR || coordonnee.x < 0 || coordonnee.y >= HAUTEUR || coordonnee.y < 0;
};

var active = false;

		
var start = function () {	//
	this.active = true;
	console.log("active: " + active);
};

var coorLibre = function () {//donne une coordonne libre dans le cnavas
	 //test pour les coordonnées prefférer de dépard
	for(var i = 0; i < defCoo.x.length /* < defCoo.y.length */; i++) {
		if (typeof(canvas[ defCoo.x[i] ][ defCoo.y[i] ]) === 'undefined') {
			return new Coordonnee(defCoo.x[i], defCoo.y[i]);
		}
	}
    
    //parcous de tout le canvas
    for (i = 0;  i < LARGEUR; i++) {
        for (j = 0; j < HAUTEUR; j++) {
            if (typeof(canvas[i][j]) === 'undefined') { //exemple de test pour une coordonnée prefférer de dépard
                var position = new Coordonnee(i, j);
				return position;
            }
        }
    }
};
    
var defaultDirection = function (coordonnee) { //determine la bonne direction a donner initialement au joueur
    var direction = null;
            
    if (coordonnee.y < HAUTEUR / 2) { //en haut
        if (coordonnee.x < LARGEUR / 2) { //en haut a gauche
            direction = "down";
        } else { //en haut a droite
            direction = "left";
        }
    } else { //en bas
        if (coordonnee.x < LARGEUR / 2) { //en bas a gauche
            direction = "right";
        } else { //en bas a droite
            direction = "up";
        }
    }
            
    return direction;
};

var prendreCoor = function (coordonnee) { //ajoute une marque a canvas a la coordonne
	if(!outOfCanvas(coordonnee)) {
		canvas[coordonnee.x][coordonnee.y] = true;
	}
};

var checkName = function (joueur) { //vérifie si un nom est libre et renvois un nom libre si il est pris
    var res = joueur;
	for (i = 0; i < joueurs.length; i++) {
        if (joueurs[i].nom === joueur) {
            var lastCar = joueur.charAt(joueur.length - 1);
            if (isNaN(lastCar)) {
                res = joueur.concat(1);    //put 1 at the end of joueur
            } else {
				lastCar++;
                res = joueur.slice(0, joueur.length - 1).concat(lastCar);//put lastCar++ at joueur.charAt(joueur.length - 1   
            }
        }
    }
	
	if(joueur !== res) { //doublecheck nessesary
		res = checkName(res);
	}
	
    return res;
};

var addJoueur = function (joueur) {	 //ajoute le nouveau joeur a this.joueurs, donne une coordonnee libre a joueur, et renvois le nom de joueur car il peut etre changer si le nom donner est déja pris
    var nJoueur = checkName(joueur);
    var jo = new Joueur(nJoueur);
    jo.setPos(coorLibre());
    prendreCoor(jo.position);
    jo.direction = defaultDirection(jo.position);
    joueurs.push(jo);
	return nJoueur;
};
		
var changeDirections = function (name, direction) {
    var nom = name;
    //this.direction = direction;  // a initialiser en fonction de data recu
    for (i = 0; i < joueurs.length; i++) {
        if (joueurs[i].nom === nom) {
            joueurs[i].changeDirection(direction);
			console.log("direction changer dans jeu");
			
            break;
        }
    }
	console.log(direction);
};

var next = function () {	 //fais avancer tous les joueur et met a jour les trace
    for (i = 0; i < joueurs.length; i++) {
        joueurs[i].avancer();
        prendreCoor(joueurs[i].position);
    }
};
		
var curState = function () { //renvois le fichier JSON a donner au client
    var table = [];
    for (i = 0; i < joueurs.length; i++) {
        var object = {};
        object.nom = joueurs[i].nom;
        object.trace = joueurs[i].trace;
        table.push(object);
    }
            
    return JSON.stringify(table);
};

var newState = function () { //renvois le fichier JSON a donner au client
    var table = [];
    for (i = 0; i < joueurs.length; i++) {
        var object = {};
        object.nom = joueurs[i].nom;
        object.trace = [];
        object.trace[0] = joueurs[i].position;
        table.push(object);
    }
            
    return JSON.stringify(table);
};

var collisionJ = function(joueur) {
	for(var i = 0; i < joueurs.length; i++) {
		for(var j = 0; j < joueurs[i].trace.length; j++) {
			if(joueur===joueurs[i] && j+1 === joueurs[i].trace.length) { //ignore if j and i is same player and if trace is current position
				console.log("collision check jump");
				continue;
			}
			if(joueur.position.equals(joueurs[i].trace[j])) {
				return true;
			}
		}
	}
	return false;
}

var collisionM = function(joueur) {	
	for(var i = 0; i < morts.length; i++) {
		for(var j = 0; j < morts[i].trace.length; j++) {
			if(joueur.position.equals(morts[i].trace[j])) {
				return true;
			}
		}
	}
	return false;
}

var kill = function(victime) {
	for(var i = 0; i<joueurs.length; i++) {
		if(victime === joueurs[i].nom) {
			morts = morts.concat(joueurs.splice(i, 1));
			
			break;
		}
	}
}
    
var collision = function () {	//renvois les joueurs qui on fait une collision
    var res = [];
    var found = false;
    var mort;
    
    for (i = 0; i < joueurs.length; i++) { //On vérifie pour chaque joueur qu'il n'y a pas de collision
        if(outOfCanvas(joueurs[i].position)) {
            res.push(joueurs[i].nom);
			
			console.log("out-of-canvas");
			console.log(joueurs[i].nom);
        } else if(collisionJ(joueurs[i])) {
			res.push(joueurs[i].nom);
			
			console.log("collision avec joueur");
			console.log(joueurs[i].nom);
		} else if(collisionM(joueurs[i])) {
			res.push(joueurs[i].nom);
			
			console.log("collision avec mort");
			console.log(joueurs[i].nom);
		}
	}
	
	for(var i = 0; i<res.length; i++) {
		kill(res[i]);
	}
	
	return res;
};
		
var end = function () {	//renvois true si il y a 1 joueur ou moins
    return (joueurs.length < 2);
};
		
var winner = function () {	//renvois le gagnant
    if (joueurs.length === 1) {
        return joueurs[0].nom;
    }
    return null;
};
	    
var reset = function () {
    this.active = false;
	console.log("active: " + active);
    joueurs.splice(0);
    morts.splice(0);
    setCanvas();
    //vide variable
};

module.exports.start = start;
module.exports.active = active;
module.exports.joueurs = joueurs;
module.exports.addJoueur = addJoueur;
module.exports.changeDirection = changeDirections;
module.exports.next = next;
module.exports.curState = curState;
module.exports.newState = newState;
module.exports.collision = collision;
module.exports.end = end;
module.exports.winner = winner;
module.exports.reset = reset;