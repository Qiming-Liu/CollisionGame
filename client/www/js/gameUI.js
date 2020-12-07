var canvas;
var ctx;

function gameUICreate() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = gameMap.width;
    canvas.height = gameMap.height;
}

const drawPad = (role) => {
    if (role == 'ghost') {
        ctx.drawImage(gamePad2, 300, 1300, 300, 300);
    } else {
        ctx.drawImage(gamePad, 300, 1300, 300, 300);
    }

    if (currentState == gameState.waiting) {
        gameRun(currentState);
    }
};

const drawPlayer = (player) => {
    if (player.id == socketId) {
        ctx.drawImage(highlight, player.x + 2/3 * player.r, player.y - 2/3 * player.r, 2/3 * player.r, 2/3 * player.r);
    }
    //powerUps
    if (player.twinkle % 20 >= 0 && player.twinkle % 20 < 15) {
        if (player.role == 'ghost') {
            if(player.invincible > 0){
                ctx.drawImage(ghost2, player.x, player.y, 2 * player.r, 2 * player.r);
            } else {
                ctx.drawImage(ghost, player.x, player.y, 2 * player.r, 2 * player.r);
            }
        } else {
            if (player.id == socketId) {
                ctx.drawImage(you, player.x, player.y, 2 * player.r, 2 * player.r);
            } else {
                ctx.drawImage(mate, player.x, player.y, 2 * player.r, 2 * player.r);
            }
        }
    }
    if (player.trap > 0) {
        ctx.drawImage(forbidden, player.x, player.y, 2 * player.r, 2 * player.r);
    }
    if (player.boost > 0) {
        ctx.drawImage(boost, player.x, player.y, 2 * player.r, 2 * player.r);
    }
    if (player.slow > 0) {
        ctx.drawImage(slow, player.x, player.y, 2 * player.r, 2 * player.r);
    }
};

const drawPU = (pu) => {
    switch (pu.type) {
        case 'twinkle': {
            ctx.drawImage(twinkle, pu.x, pu.y, 2 * pu.r, 2 * pu.r);
            break;
        }
        case 'trap': {
            ctx.drawImage(trap, pu.x, pu.y, 2 * pu.r, 2 * pu.r);
            break;
        }
        case 'boost': {
            ctx.drawImage(boost, pu.x, pu.y, 2 * pu.r, 2 * pu.r);
            break;
        }
        case 'slow': {
            ctx.drawImage(slow, pu.x, pu.y, 2 * pu.r, 2 * pu.r);
            break;
        }
    }
};

function drawText(text) {
    ctx.clearRect(0, 0, gameMap.width, gameMap.height);
    ctx.font = "30px Arial";
    ctx.fillText(text, 10, 50);
}
