const {fromEvent} = require('rxjs');

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const canvasHeight = 1600;
const canvasWidth = 900;

const fps = 30;
const rushInterval = 45;
const bsEffort = 10;

const defaultR = 30;
const defaultSpeed = 15;

const maxPowerUps = 3;
const powerUPsInterval = 5000;

var gameState = {
    players: {},
    powerUps: []
}
var gameRunning = false;
var playersCount = 0;
var rushTime = 0;
var rushDirection = 'down';

var connection = fromEvent(io, 'connection');
connection.subscribe(function (socket) {
    let posX = Math.floor(Math.random() * (canvasWidth - 2 * defaultR));
    let posY = Math.floor(Math.random() * (canvasHeight - 2 * defaultR));
    playersCount++;
    if (playersCount == 2) {
        gameState.players[socket.id] = {
            x: posX,
            y: 0,
            r: defaultR,
            id: socket.id,
            role: 'ghost',
            speed: defaultSpeed,
            twinkle: 0,
            trap: 0,
            boost: 0,
            slow: 0,
            invincible: 0
        }
        gameRunning = true;
        io.emit('run');
    } else {
        gameState.players[socket.id] = {
            x: posX,
            y: posY,
            r: defaultR,
            id: socket.id,
            role: 'people',
            speed: defaultSpeed,
            twinkle: 0,
            trap: 0,
            boost: 0,
            slow: 0,
            invincible: 0
        }
        if (gameRunning) {
            socket.emit('run');
        }
    }
    console.log('connection:' + JSON.stringify(gameState.players[socket.id]));

    let playerMovement = fromEvent(socket, 'playerMovement');
    playerMovement.subscribe(function (playerMovement) {
        let player = gameState.players[socket.id];
        //move
        if (player != undefined) {
            if (player.trap == 0) {
                if (player.role != 'ghost') {
                    if (playerMovement.up && player.y > 0) {
                        player.y -= getBSSpeed(player);
                    }
                    if (playerMovement.down && player.y < canvasHeight - 2 * player.r) {
                        player.y += getBSSpeed(player);
                    }
                }
                if (!((player.role == 'ghost') && rushTime > rushInterval * 2 / 3)) {
                    if (playerMovement.left && player.x > 0) {
                        player.x -= getBSSpeed(player);
                    }
                    if (playerMovement.right && player.x < canvasWidth - 2 * player.r) {
                        player.x += getBSSpeed(player);
                    }
                }
            }

            //edge fix
            if (player.x < 0) {
                player.x = 0;
            } else if (player.x > canvasWidth - 2 * player.r) {
                player.x = canvasWidth - 2 * player.r;
            }
            if (player.y < 0) {
                player.y = 0;
            } else if (player.y > canvasHeight - 2 * player.r) {
                player.y = canvasHeight - 2 * player.r;
            }

            //powerUPs
            if (player.twinkle > 0) {
                player.twinkle--;
            }
            if (player.trap > 0) {
                player.trap--;
            }
            if (player.boost > 0) {
                player.boost--;
            }
            if (player.slow > 0) {
                player.slow--;
            }
            if (player.invincible > 0) {
                player.invincible--;
            }

            for (let i = 0; i < gameState.powerUps.length; i++) {
                if (checkClash(player, gameState.powerUps[i])) {
                    switch (gameState.powerUps[i].type) {
                        case 'twinkle': {
                            player.twinkle += gameState.powerUps[i].time;
                            player.trap = 0;
                            player.boost = 0;
                            player.slow = 0;
                            break;
                        }
                        case 'trap': {
                            player.trap += gameState.powerUps[i].time;
                            player.twinkle = 0;
                            player.boost = 0;
                            player.slow = 0;
                            break;
                        }
                        case 'boost': {
                            player.boost = gameState.powerUps[i].time;
                            player.twinkle = 0;
                            player.trap = 0;
                            player.slow = 0;
                            break;
                        }
                        case 'slow': {
                            player.slow = gameState.powerUps[i].time;
                            player.twinkle = 0;
                            player.trap = 0;
                            player.boost = 0;
                            break;
                        }
                    }
                    gameState.powerUps.splice(i, 1);
                }
            }
        }
    })

    let rush = fromEvent(socket, 'rush');
    rush.subscribe(function () {
        let player = gameState.players[socket.id];
        if (rushTime < rushInterval * 2 / 3) {
            player.speed = defaultSpeed;
        } else {
            player.speed = 7 * defaultSpeed;
            if (rushDirection == 'up' && player.y > 0) {
                player.y -= player.speed;
            }
            if (rushDirection == 'down' && player.y < canvasHeight - 2 * player.r) {
                player.y += player.speed;
            }
        }
        if (rushTime == rushInterval) {
            rushDirection = rushDirection == 'up' ? 'down' : 'up';
            rushTime = 0;
        }
        rushTime++;

        //clash
        if (player.invincible == 0) {
            for (let people in gameState.players) {
                if (people != socket.id) {
                    if (checkClash(gameState.players[people], gameState.players[socket.id])) {
                        gameState.players[socket.id].role = 'people';
                        gameState.players[socket.id].speed = defaultSpeed;
                        gameState.players[people].role = 'ghost';
                        gameState.players[people].invincible = 150;
                        gameState.players[people].speed = defaultSpeed;
                        io.emit('refresh', gameState);
                    }
                }
            }
        }
    })

    let disconnect = fromEvent(socket, 'disconnect');
    disconnect.subscribe(function () {
        console.log('disconnect:' + JSON.stringify(gameState.players[socket.id]));
        removePlayer(socket.id);
    });
});

setInterval(function () {
    if (gameRunning) {
        io.emit('refresh', gameState);
    }
}, 1000 / fps);

setInterval(function () {
    if (gameRunning) {
        creatPowerUPs();
    }
}, powerUPsInterval);


function removePlayer(id) {
    delete gameState.players[id];
    playersCount--;
    if (playersCount == 1) {
        gameState.players[Object.keys(gameState.players)[0]].role = 'people';
        gameRunning = false;
    }
}

function checkClash(s1, s2) {
    let a = Math.abs(s1.x - s2.x) < s1.r + s2.r;
    let b = Math.abs(s1.y - s2.y) < s1.r + s2.r;

    return a && b;
}

function creatPowerUPs() {
    if (gameState.powerUps.length < maxPowerUps) {
        let posX = Math.floor(Math.random() * (canvasWidth - 2 * defaultR));
        let posY = Math.floor(Math.random() * (canvasHeight - 2 * defaultR));

        let a = posX % 4;
        let pu = {};
        switch (a) {
            case 0: {
                pu = {
                    type: 'twinkle',
                    time: 300,
                    x: posX,
                    y: posY,
                    r: 30
                }
                break;
            }
            case 1: {
                pu = {
                    type: 'trap',
                    time: 90,
                    x: posX,
                    y: posY,
                    r: 30
                }
                break;
            }
            case 2: {
                pu = {
                    type: 'boost',
                    time: 150,
                    x: posX,
                    y: posY,
                    r: 30
                }
                break;
            }
            case 3: {
                pu = {
                    type: 'slow',
                    time: 150,
                    x: posX,
                    y: posY,
                    r: 30
                }
                break;
            }
        }
        gameState.powerUps.push(pu);
        console.log('New powerUps created:' + JSON.stringify(pu));
    }
}

function getBSSpeed(player) {
    if (player.boost > 0) {
        return defaultSpeed + bsEffort;
    }
    if (player.slow > 0) {
        return defaultSpeed - bsEffort;
    }
    return defaultSpeed;
}

server.listen(1234);


