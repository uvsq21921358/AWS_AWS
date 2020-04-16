$(document).ready(function(){
    //La partie de l'utilisation canvas
    var canvas = $("#canvas")[0],
        context = canvas.getContext("2d"),
        width = $("#canvas").width(), //La largeur de balis canvas
        height = $("#canvas").height(),//La langeur de balis canvas
        cw = 10, // la taille de cellule de tron
        direction, //la direction du tron (left|right|up|down)
        tronArray,//un tableau de coordonnées pour le tron
        wait = 10,
        speed = 100,//Vitesse de tron
        playerName,//nom de joueur
        isAcceCont = false,
        playerColor;//couleur de joueur
    var isOffline;

    var tabIndex = [];
    var nomJoueur=[];
    io.on('connected', function(data){
        playerName = data;
        if($(window).DeviceMotionEvent != undefined) {
            isAcceCont=true;
            startAccelerometreController();
        }
         startKeyController();
        isOffline = true;
        playerOffline.init();
    });
    io.on('update', function(data){
        //construire canvas avec donnée
        // les donné serons en JSON et seron un ensemble de coordonnée + nom
        var tabJoueur = JSON.parse(data);
        for(var i = 0; i<tabJoueur.length; i++) {
            var traceAdded = false;
			var newJData = tabJoueur[i];
            for(var j = 0; j<tabIndex.length; j++) {
                if (newJData.nom===tabIndex[j].nom) {
                    tabIndex[j].trace = tabIndex[j].trace.concat(newJData.trace);
                    traceAdded = true;
                }
            }
            if (!traceAdded) {
            	if(newJData.nom === playerName) {
            		newJData.col = playerColor;
                    $(".joueur").prepend("<li style='color:"+newJData.col+"' id='"+newJData.nom+"'>Vous: "+newJData.nom+"</li>");
            	} else {
            		newJData.col = getRandomColor();
                    $(".joueur").append("<li style='color:"+newJData.col+"' id='"+newJData.nom+"'>"+newJData.nom+"</li>");
            	}
                tabIndex.push(newJData);
            }

        }
        draw();
    //update
    });

    io.on('start', function(){
        isOffline = false;
        $("#block_loader").fadeOut(600,function(){
            $(".joueur").fadeIn(500);
        });
        context.clearRect(0, 0, width, height);
        init();

    });

    io.on('lost', function(data){
    //verifier son propre nom est present
        //alert("Vous avez perdu");
        for(var i = 0; i<data.length; i++) {
            $("#"+data[i]).css({'text-decoration':'line-through'});
            if(data[i] === playerName){
                //alert("Vous avez perdu");
                stopKeyController();
                isAcceCont=false;
                youLost();
            }
        }
        console.log(data);
     });

    io.on('win', function(data){
    //recois le nom du gagnant
        if(data === playerName){
            //alert("Vous avez gagné !!!");
            stopKeyController();
            isAcceCont=false;
            youWin();
        }
    });
    io.on('end', function(){
    //code a exécuter quand le jeu est finis
        stopKeyController();
        isAcceCont=false;
        $("#message_win").text("Jeu est Fini");
        youWin();
    });

    //initialisation d'elements sur l'eran
    function init(){
        context.clearRect(0,0, width, height);
        //context.fillStyle = "black";
        //context.strokeStyle = "black";
        context.strokeRect(0,0, width, height);
        //Dessin éléments de grille sur l'écran
        context.strokeStyle = "#eee";
        context.stroke();
    }
    //logique de base et le rendu
    function draw(){
        //dessinons tron
        for(var i = 0; i<tabIndex.length; i++) {
            for(var j = 0; j<tabIndex[i].trace.length; j++) {
                context.fillStyle = tabIndex[i].col;
                context.fillRect(tabIndex[i].trace[j].x*cw, tabIndex[i].trace[j].y*cw, cw, cw);
            }
        }
    }

    $("#btn_start").click(function(e){
        var pName;
        $("#player_name").val() == "" ?  pName = "Player 1" :  pName = $("#player_name").val();
        io.emit('ready', pName);
        playerColor = $("#player_color").val();
        e.preventDefault();
        $("aside").fadeOut(300,function(){
            $("main").animate(
              {
                width: "870px",
                height: "408px"
              },
            300,function(){
                    $("#block_jeu").fadeIn(300);
            });
        });
    });

    $("#restart_game").click(function(e){
        tabIndex = [];
        nomJoueur=[];
        io.emit('ready', playerName);
        e.preventDefault();
        $("#block_loader").show();
        $(".joueur").hide();
        $(".joueur > *").remove();
        $("#restart_menu").fadeOut(300,function(){
            $("main").animate(
                {
                    width: "870px",
                    height: "408px"
                },
                300,function(){
                    $("#block_jeu").fadeIn(300);
                });
        });
    });
    $("#get_main_menu").click(function(e){
        tabIndex = [];
        nomJoueur=[];
        e.preventDefault();
        $("#block_loader").show();
        $(".joueur").hide();
        $(".joueur > *").remove();
        $("#restart_menu").fadeOut(300,function(){
            $("main").animate(
                {
                    width: "342px",
                    height: "237px"
                },
                300,function(){
                    $("#start_menu").fadeIn(300);
                });
        });
    });

    function getRandomColor() {
        var colorRandom = "#"+((1<<24)*Math.random()|0).toString(16);
        for(var i = 0; i<tabIndex.length; i++) {

            if(colorRandom === tabIndex[i].col){
                colorRandom = "#"+((1<<24)*Math.random()|0).toString(16);
                i=0;
            }
        }
        return colorRandom;
    }

    function startKeyController() {
         //les boutons de contrôle
        $(document).keydown(function (e) {
            var key = e.which;//определение текущего кода кнопки
            var ObjectData = new Object();
            ObjectData.playerName = playerName;
            if (key == "37" && direction != "right") {
                direction = "left";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "38" && direction != "down") {
                direction = "up";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "39" && direction != "left") {
                direction = "right";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "40" && direction != "up") {
                direction = "down";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "81" && direction != "right") {
                direction = "left";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "90" && direction != "down") {
                direction = "up";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "68" && direction != "left") {
                direction = "right";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
            else if (key == "83" && direction != "up") {
                direction = "down";
                ObjectData.direction = direction;
                io.emit('change-direction', ObjectData);
            }
        });
    }
    function stopKeyController(){
        $(document).unbind("keydown");
    }

    var playerOffline = {
        //инициализаци и запуск отрисовки элементов на экране
       init: function (){
           if(isOffline==true) {
               direction = "right";//направление трона по умолчанию
               playerOffline.createTron();

               if (typeof gameLoop != "undefined") {
                   clearInterval(gameLoop);
               }

               //создание сетки заднего фона
               context.clearRect(0, 0, width, height);
               //context.fillStyle = "black";
              // context.strokeStyle = "black";
               context.strokeRect(0, 0, width, height);
               gameLoop = setInterval(playerOffline.draw, 100);
           }

        },
        //создание трона(заполнение массива)
        createTron : function(){
            if(isOffline==true) {
                tronArray = [];
                //cодание трона в верхнем левом углу экрана
                tronArray.push({x: 0, y: 0});
            }
        },
        //основная логика и отрисовка
        draw : function (){
            if(isOffline==true) {
                var headTron; // ячейка массива которая содержит будущие кординаты головы трона

                //получение текущих кординат головы трона
                var nx = tronArray[0].x,
                    ny = tronArray[0].y;

                //меняем направление трона в зависимости от значения переменной direction
                if (direction == "right") {
                    nx++;
                } else if (direction == "left") {
                    nx--;
                } else if (direction == "up") {
                    ny--;
                } else if (direction == "down") {
                    ny++;
                }

                //проверяем столкновение трона с самим собой и с границами canvas
                if (nx == -1 || nx == width / cw || ny == -1 || ny == height / cw || playerOffline.checkCollision(nx, ny, tronArray)) {
                    playerOffline.init();
                    return;
                }
                else {
                    //если столкновений нет создаем новую ячейку с новыми координатами
                    headTron = {x: nx, y: ny}
                    headTron.x = nx;
                    headTron.y = ny;
                    //добавление ячейки headTron в начало массива tronArray
                    tronArray.unshift(headTron);
                }

                //отрисовываем трон
                for (var i = 0; i < tronArray.length; i++) {
                    var cell = tronArray[i];
                    playerOffline.drawCells(cell.x, cell.y);
                }
            }
        },

        //отрисовка змеи по ячейкам
        drawCells : function(x,y){
            if(isOffline==true) {
                context.fillStyle = playerColor;
                context.shadowColor = 'white';
                context.fillRect(x * cw, y * cw, cw, cw);
            }
        },

        //проверка зон сотолкновения
        checkCollision : function(x,y,array){
            if(isOffline==true) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i].x == x && array[i].y == y) return true;
                }
                return false;
            }
        }

    };
    $("#get_menu").click(function(){
        showMainMenu();
    });
    function showMainMenu(){
        $("#get_menu").fadeOut(200,function(){
            $("#block_jeu").fadeOut(200,function(){
                $("main").animate(
                    {
                        width: "350px",
                        height: "150px"
                    },
                    300,function(){
                        $("#player_name").val(playerName);
                        $("#player_color").val(playerColor);

                        $("#restart_menu").fadeIn(300);
                    }
                );
            });
        });
    }
    function youLost(){
        $("#message_err").fadeIn(200, function(){
            setTimeout(function(){
                $("#message_err").fadeOut(200, function(){
                    $("#get_menu").fadeIn(200);
                });
            }, 1000);
        });
    }
    function youWin(){
        $("#message_win").fadeIn(200, function(){
            setTimeout(function(){
                $("#message_win").fadeOut(200, function(){
                    $("#get_menu").fadeIn(200);
                });
            }, 1000);
        });
    }
    function startAccelerometreController(){
        if(isAcceCont){
                $(window).ondevicemotion = function(e) {

                    if (e.accelerationIncludingGravity.x > 0 && direction != "right") {
                        direction = "left";
                        ObjectData.direction = direction;
                        io.emit('change-direction', ObjectData);
                    }
                    else if (e.accelerationIncludingGravity.x < 0 && direction != "left") {
                        direction = "right";
                        ObjectData.direction = direction;
                        io.emit('change-direction', ObjectData);
                    }
                    else if (e.accelerationIncludingGravity.y < 0  && direction != "down") {
                        direction = "up";
                        ObjectData.direction = direction;
                        io.emit('change-direction', ObjectData);
                    }

                    else if (e.accelerationIncludingGravity.y > 0  && direction != "up") {
                        direction = "down";
                        ObjectData.direction = direction;
                        io.emit('change-direction', ObjectData);
                    }
                }
        }
    }
    $("#player_name").keyup( function() {
        var valCurrent = $(this);
        if(valCurrent.val().length > 10)
            valCurrent.val(valCurrent.val().substr(0, 10));
    });


});//ready








