function Joueur(nom) {
    this.nom = nom;
    this.direction = null;
    this.position = {};
    this.trace = [];
    
    this.changeDirection = function (direction) {
        if (direction === "right" || direction === "left") {
            if (this.direction === "up" || this.direction === "down") {
                this.direction = direction;
            }
        } else if (direction === "up" || direction === "down") {
            if (this.direction === "right" || this.direction === "left") {
                this.direction = direction;
			}
        }
        return this;
    };
    
    this.avancer = function () {
        if(this.direction === "right") {
            this.position.y++;
            this.trace.push(this.position);
        } else if (this.direction === "left") {
            this.position.y--;
            this.trace.push(this.position);
        } else if (this.direction === "up") {
            this.position.x++;
            this.trace.push(this.position);
        } else if (this.direction === "down") {
            this.position.x--;
            this.trace.push(this.position);
        }
        return this;
    };
}

module.exports = Joueur;