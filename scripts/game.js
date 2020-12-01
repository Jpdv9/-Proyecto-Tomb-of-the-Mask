const { append, cons, first, isEmpty, isList, length, rest, map } = require("fl-extended");

const SIZE = 40;
const framesPerSecond = 60; // El mundo se dibuja en 60 veces por segundo
const pantallaEstadoDelJuego = document.getElementById("game-status"); // muestra vidas y puntaje
const viewScore = document.getElementById("score");
const menu = document.querySelector("#menu");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d") // herramienta de dibujo

// Asignaciones para el mapa
const mapa = {
    width: 1000,
    height: 600,
    path: 0,
    wall: 1,
    coin: 2,
    superCoin: 3,
    mask: "M"
};

const initialState = {
    time: 0,
    mask: {
        x: 12,
        y: 12
    },

    water: [{
        x: 0,
        y: 15
    }],

    matrix: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 3, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 3, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 1, 2, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1],
        [0, 0, 1, 2, 1, 2, 1, 2, 1, 0, 0, 1, 0, 1, 0, 0, 1, 2, 1, 2, 1, 2, 1, 0, 0],
        [0, 0, 0, 2, 2, 2, 2, 2, 1, 0, 0, 1, 0, 1, 0, 0, 1, 2, 2, 2, 2, 2, 0, 0, 0],
        [0, 0, 0, 2, 1, 1, 1, 2, 0, 0, 1, 1, 0, 1, 1, 0, 0, 2, 1, 1, 1, 2, 0, 0, 0],
        [1, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 1, 1],
        [1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [1, 2, 3, 2, 1, 2, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 2, 1, 2, 3, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
}
let mask = null;
let wall = null;
let coin = null;
let superCoin = null;
let heart = null;
let gameOver = null;
let points = 0;
let actualLives = 3;
let play = false;
let superC = false;

const processingInstance = new Processing(canvas, sketchProc);

function make(data, attribute) {
    return Object.assign({}, data, attribute);
};

function hideMenu() {
    play = true;
    canvas.focus();
    menu.classList.add("menu_hidden");
}

function showMenu() {
    play = false;
    menu.classList.remove("menu_hidden");
}

function apply(l, f) {
    if (!isEmpty(l)) {
        f(first(l));
        apply(rest(l), f);
    };
};

function waterUp(l) {
    const waterObject = first(l);
    return cons({ x: waterObject.x, y: (waterObject.y - 0.003) }, []);
};

function waterDown(l) {
    const waterObject = first(l);
    return cons({ x: waterObject.x, y: (waterObject.y + 0.003) }, []);
};

function superCoinTouched() {
    superC = true;
    return superC;
};



function substractLifes() {
    actualLives--;
}

function addScore() {
    points++
    updateScore();
}

// actualizar la puntuacion en la tabla
function updateScore() {
    viewScore.textContent = points;
}


function sketchProc(processing) {
    // Esto se llama antes de iniciar el juego

    processing.setup = function() {
        // Se ejecuta una vez cuando se inicia el juego

        // Se actualiza 60 veces por segundo
        processing.frameRate(framesPerSecond);

        // Tamaño del mapa
        processing.size(mapa.width, mapa.height);

        // Carga de imágenes
        mask = processing.loadImage("./images/tomb.png");
        wall = processing.loadImage("./images/wall.jpg");
        coin = processing.loadImage("./images/coin.png");
        superCoin = processing.loadImage("./images/superCoin.png");
        heart = processing.loadImage("./images/heart.png");
        gameOver = processing.loadImage("./images/game_over.png")

        // Estado inicial del juego 
        processing.state = Object.assign(initialState);

        // Ennfocar el canvas al inicio
        canvas.focus();
        updateScore();
    };

    // Se ejecuta 60 veces por segundo.
    processing.draw = function() {
        if (play) {
            processing.drawGame(processing.state);
            processing.state = processing.onTic(processing.state);
        };
    };

    // Dibujar en el canvas. Aquí se pone todo lo que quieras pintar
    processing.drawGame = function(world) {

        processing.background(0, 0, 0);
        dibujarMapa(world, processing);
        dibujarMaskAnimado(mask, world, processing);
        dibujarVidas(world, processing, actualLives);
    };


    // actualiza el mundo en cada tic del reloj. Retorna el nuevo estado del mundo
    processing.onTic = function(world) {
        // Actalización para el agua
        let yValue = world.mask.y;
        let water = first(world.water);

        if (Math.trunc(water.y) == yValue && actualLives > 0) {
            substractLifes();
            return make(world, initialState);
        } else if (Math.trunc(water.y) > 0) {

            if (superC) {
                console.log(world.time);
                return make(world, { time: world.time + 1, water: waterDown(world.water) });
            } else {
                if (actualLives > 0) {
                    return make(world, { water: waterUp(world.water) });
                } else {
                    return make(world, {});
                }
            }
        } else {
            return make(world, {});
        }
    };

    // actualiza el mundo cada vez que se oprime una tecla. Retorna el nuevo estado del mundo
    processing.onKeyEvent = function(world, keyCode) {
        let newX = world.mask.x;
        let newY = world.mask.y;

        if (actualLives > 0) {
            switch (keyCode) {

                case processing.UP:
                    let upPosition = world.matrix[newY - 1][newX];
                    if (upPosition != mapa.wall) {
                        if (upPosition == mapa.coin || upPosition == mapa.superCoin) {
                            world.matrix[newY - 1][newX] = mapa.path;
                            if (upPosition == mapa.coin) {
                                addScore();
                            } else if (upPosition == mapa.superCoin) {
                                superCoinTouched();
                                return make(world, { mask: { x: newX, y: newY - 1 } });
                            }
                            return make(world, { mask: { x: newX, y: newY - 1 } });
                        }
                        return make(world, { mask: { x: newX, y: newY - 1 } });
                    }
                    return make(world, {});

                case processing.DOWN:
                    let downPosition = world.matrix[newY + 1][newX];
                    if (downPosition != mapa.wall) {
                        if (downPosition == mapa.coin || downPosition == mapa.superCoin) {
                            world.matrix[newY + 1][newX] = 0;
                            if (downPosition == mapa.coin) {
                                addScore();
                            } else if (downPosition == mapa.superCoin) {
                                superCoinTouched();
                                return make(world, { mask: { x: newX, y: newY + 1 } });
                            }
                            return make(world, { mask: { x: newX, y: newY + 1 } });
                        }
                        return make(world, { mask: { x: newX, y: newY + 1 } });
                    }
                    return make(world, {});

                case processing.LEFT:
                    let leftPosition = world.matrix[newY][newX - 1];
                    if (leftPosition != mapa.wall) {
                        if (leftPosition == mapa.coin || leftPosition == mapa.superCoin) {
                            world.matrix[newY][newX - 1] = 0;
                            if (leftPosition == mapa.coin) {
                                addScore();
                            } else if (leftPosition == mapa.superCoin) {
                                superCoinTouched();
                                return make(world, { mask: { x: newX - 1, y: newY } });
                            }
                            return make(world, { mask: { x: newX - 1, y: newY } });
                        } else if (newX == 0) {
                            return make(world, { mask: { x: 24, y: newY } });
                        }
                        return make(world, { mask: { x: newX - 1, y: newY } });
                    }
                    return make(world, {});

                case processing.RIGHT:
                    let rightPosition = world.matrix[newY][newX + 1];
                    if (rightPosition != mapa.wall) {
                        if (rightPosition == mapa.coin || rightPosition == mapa.superCoin) {
                            world.matrix[newY][newX + 1] = 0;
                            if (rightPosition == mapa.coin) {
                                addScore();
                            } else if (rightPosition == mapa.superCoin) {
                                superCoinTouched();
                                return make(world, { mask: { x: newX + 1, y: newY } });
                            }
                            return make(world, { mask: { x: newX + 1, y: newY } });
                        } else if (newX == 24) {
                            return make(world, { mask: { x: 0, y: newY } });
                        }
                        return make(world, { mask: { x: newX + 1, y: newY } });
                    }
                    return make(world, {});

                default:
                    return world;
            }
        } else {
            return make(world, {});
        }

    };

    // esta función se ejecuta cada vez que presionamos una tecla.
    processing.keyPressed = function() {
        processing.state = processing.onKeyEvent(processing.state, processing.keyCode);
    };
}