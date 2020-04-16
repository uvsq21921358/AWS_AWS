$(document).ready(function(){
    //$("#block_jeu").hide();
    io.on('connected', function(data){});
/*
*  io.on('connected', function(data){});
*       var ObjectData = new Object();
 ObjectData.direction = direction;
 ObjectData.playerName = playerName;
 io.emit('change-direction', ObjectData);
 io.emit('ready', playerName);
*  */
    var cw = 10, // la taille de cellule de tron
        direction; //la direction du tron (left|right|up|down)
    var canvas,context,width,height;
    //un tableau de coordonnées pour le tron
    var tronArray;

    var wait = 30;
    var speed = 100;
    var playerName;
    var playerColor;

    function start(){
        //La partie de l'utilisation canvas
        canvas = $("#canvas")[0];
        context = canvas.getContext("2d");
        width = $("#canvas").width(); //La largeur de balis canvas
        height = $("#canvas").height();//La langeur de balis canvas
        //initialisation du jeu
        init();

    }
    //initialisation d'elements sur l'eran
    function init(){
        direction= "right";//direction du tron par défaut
        createTron();
        
        if(typeof gameLoop != "undefined"){
            clearInterval(gameLoop);
        }
      
        context.clearRect(0,0, width, height);
        //context.fillStyle = "black";        
        //context.strokeStyle = "black";
       // context.strokeRect(0,0, width, height);
        //Dessin éléments de grille sur l'écran
        context.strokeStyle = "#eee";
        context.stroke();  
        gameLoop = setInterval(draw,speed);                      
        
    }
    
    //la création du tron (le remplissage de la tableax)
    function createTron(){
        tronArray = [];
        //la création du tron dans le coin supérieur gauche de l'écran
        tronArray.push({x:0,y:0});    
    }
    //logique de base et le rendu
    function draw(){
        var headTron; //le cellule qui contient les coordonnées du futur "tete" du tron
        
        //l'obtention de la position actuelle de la tête du tron
        var nx = tronArray[0].x,
            ny = tronArray[0].y;
        var ObjectData = new Object();
        ObjectData.direction = direction;
        ObjectData.playerName = playerName;
        io.emit('change-direction', ObjectData);
        //on change la direction du tron en fonction de la valeur de la variable de "direction"(left|right|up|down)
        if(direction == "right"){
            nx++; 
        }else if(direction == "left"){
            nx--;    
        }else if(direction == "up"){
            ny--;
        }else if(direction == "down"){
            ny++;
        }
       // io.emit('change-direction', direction,playerName)
        
        //vérifions la collision du Tron avec lui-même ou avec les limites de la grille de canvas
        if(nx == -1 || nx == width/cw || ny == -1 || ny == height/cw || checkCollision(nx, ny, tronArray)){
            init();
            return;
        }
        else{
            //Si une collision ne est pas, créons une nouvelle cellule avec les nouvelles coordonnées
            headTron = {x:nx, y:ny}
            headTron.x = nx;
            headTron.y = ny;
            //ajouton de cellule "headTron" au début de la tableaux tronArray
            tronArray.unshift(headTron);
        }
        
        //dessinons tron
        for(var i = 0; i < tronArray.length; i++){
            var cell = tronArray[i];
            drawCells(cell.x, cell.y);
        }
    }
    
    //function pour dessin du tron
    function drawCells(x,y){
        context.fillStyle = playerColor;
        context.fillRect(x*cw, y*cw, cw, cw);
    }
    
    //vérification les zones de collision
    function checkCollision(x,y,array){
        for(var i = 0; i<array.length; i++){
            if(array[i].x == x && array[i].y == y) return true;
        }
        return false;
    }
    //les boutons de contrôle
    $(document).keydown(function(e){
        var key = e.which;//определение текущего кода кнопки
        if(key == "37" && direction!= "right") direction = "left";
        else if(key == "38" && direction!= "down") direction = "up";
        else if(key == "39" && direction!= "left") direction = "right";
        else if(key == "40" && direction!= "up") direction = "down";
        else if(key == "81" && direction!= "right") direction = "left";
        else if(key == "90" && direction!= "down") direction = "up";
        else if(key == "68" && direction!= "left") direction = "right";
        else if(key == "83" && direction!= "up") direction = "down";

    });




$("#btn_start").click(function(e){
    $("#player_name").val() == "" ?  playerName = "Player 1" :  playerName = $("#player_name").val();
    io.emit('ready', playerName);
    playerColor = $("#player_color").val();
    io.emit('ready', playerName)
    e.preventDefault();
    $("aside").fadeOut(600,function(){
        $("main").animate(
          {
            width: "870px",
            height: "408px"
          },
        1000,function(){
            $("#block_loader").fadeIn(600, function(){
                // начать повторы с интервалом 2 сек
                for(var i=3; i>=0; i--){
                    setTimeout(function() {
                        $("#nb_progress").text(i);
                    }, 1000);   
                    
                }
                // начать повторы с интервалом 2 сек
                var timerId = setInterval(function() {
                    if(wait>0){
                       wait = wait-1; 
                    }
                  $("#nb_progress").text(wait);
                }, 1000);
                
                // через 5 сек остановить повторы
                setTimeout(function() {
                  clearInterval(timerId);
                  $(".joueur li:first-child").text(playerName).css({"color":playerColor});
                  $("#block_loader").fadeOut(400,function(){
                    $("#block_jeu").fadeIn(500,function(){
                        //initialisation du jeu
                        start();
                    });
                  });
                  
                }, 1000);
                
                
            });
        });
    });
});












    //logique de base et le rendu
    function drawlocale(){
        var headTron; //le cellule qui contient les coordonnées du futur "tete" du tron

        //l'obtention de la position actuelle de la tête du tron
        var nx = tronArray[0].x,
            ny = tronArray[0].y;

        //on change la direction du tron en fonction de la valeur de la variable de "direction"(left|right|up|down)
        if(direction == "right"){
            nx++;
        }else if(direction == "left"){
            nx--;
        }else if(direction == "up"){
            ny--;
        }else if(direction == "down"){
            ny++;
        }

        //vérifions la collision du Tron avec lui-même ou avec les limites de la grille de canvas
        if(nx == -1 || nx == width/cw || ny == -1 || ny == height/cw || checkCollision(nx, ny, tronArray)){
            init();
            return;
        }
        else{
            //Si une collision ne est pas, créons une nouvelle cellule avec les nouvelles coordonnées
            headTron = {};
            headTron.x = nx;
            headTron.y = ny;
            //ajouton de cellule "headTron" au début de la tableaux tronArray
            tronArray.unshift(headTron);
        }

        //dessinons tron
        for(var i = 0; i < tronArray.length; i++){
            var cell = tronArray[i];
            drawCells(cell.x, cell.y);
        }
    }

    //vérification les zones de collision
    function checkCollision(x,y,array){
        for(var i = 0; i<array.length; i++){
            if(array[i].x == x && array[i].y == y) return true;
        }
        return false;
    }

});//ready








