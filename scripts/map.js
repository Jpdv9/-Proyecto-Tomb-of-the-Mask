/**
 * Dibuja el mapa segun el tipo de la celda
 * @param {object} world
 * @param {object} processing
 * @return {void}
 */


function dibujarMapa(world, processing) {
    processing.background(0, 0, 0);
    forEach(world.matrix, (row, i) => {
        forEach(row, (cell, j) => {
            if (cell == mapa.wall) {
                processing.image(wall, j * SIZE, i * SIZE, SIZE, SIZE);
            } else if (cell == mapa.coin) {
                processing.image(coin, j * SIZE + 10, i * SIZE + 10, SIZE / 2, SIZE / 2);
            } else if (cell == mapa.superCoin) {
                processing.image(superCoin, j * SIZE + 5, i * SIZE + 5, 30, 30);
            }
        });
    });
    apply(world.water, aF => {
        processing.fill(0, 160, 160);
        processing.rect(aF.x * SIZE, aF.y * SIZE, 1000, 600);
    });
}

/**
 * Dibuja las vidas que aparece en la parte superior del mapa
 * @param {world} 
 * @param {processing} 
 * @param {index} 
 */

function dibujarVidas(world, processing, index = 0) {
    if (index > 0) {
        processing.image(heart, index * SIZE, world.matrix[0].lenght * SIZE, SIZE * 0.9, SIZE * 0.9);
        return dibujarVidas(world, processing, --index)
    }

}

/**
 * Posiciona a mask donde haya una "M" en la matriz
 * @param {world}
 * @return {mask}
 */
function inicializarMask(world) {
    return forEachWithReturn(world.matrix, (row, i) => {
        return forEachWithReturn(row, (cell, j) => {
            if (cell == world.mask)
                return Object.assign(world.mask, { x: j * 37 }, { y: i * 37 });
        });
    });
};

function dibujarMaskAnimado(imagen, world, processing) {
    // Dibujar a Mask en el mapa     
    ctx.globalAlpha = 0.8;
    processing.image(mask, world.mask.x * SIZE, world.mask.y * SIZE, SIZE, SIZE);
};

/**
 * 
 * @param {lista} l 
 * @param {funcion} f 
 * @param {integer} index 
 */
function forEach(l, f, index = 0) {
    if (!isEmpty(l)) {
        f(first(l), index);
        forEach(rest(l), f, index + 1);
    };
};

/**
 * 
 * @param {lista} l 
 * @param {function} f 
 * @param {integer} index 
 */
function forEachWithReturn(l, f, index = 0) {
    if (!isEmpty(l)) {
        let r = f(first(l), index);
        if (r) return r;
        return forEachWithReturn(rest(l), f, index + 1);
    };
};