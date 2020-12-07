function gameRun(state) {
    console.log(state);
    switch (state) {
        case gameState.preparing: {
            gameUICreate();
            onListening();
            socketIoConnect();
            drawText('Connecting to the server...');
            break;
        }
        case gameState.waiting: {
            // playMusic();
            drawText('Connected. Waiting for the players...');
            break;
        }
        case gameState.running: {
            break;
        }
        case gameState.end: {
            drawText('Game over. Thanks for the game!');
            break;
        }
    }
}
var currentState = gameState.preparing;
gameRun(currentState);
