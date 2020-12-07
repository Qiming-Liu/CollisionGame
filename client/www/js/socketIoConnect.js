var sio;
var socketId;

function socketIoConnect() {
    let url;
    if (getOperationSys() == 'Android') {
        url = 'http://10.0.2.2:1234';
    } else {
        url = 'http://localhost:1234';
    }
    startConnect(url);
}

function startConnect(url) {
    sio = io.connect(url, {reconnection: false});

    let connectSio = fromEvent(sio, 'connect');
    let connect_errorSio = fromEvent(sio, 'connect_error');

    connectSio.subscribe(function () {
        socketId = sio.id;

        let runSio = fromEvent(sio, 'run');
        runSio.subscribe(function () {
            currentState = gameState.running;
            gameRun(currentState);

            let refreshSio = fromEvent(sio, 'refresh');
            refreshSio.subscribe(function (gameState) {
                if (gameState.players[socketId].role == 'ghost') {
                    sio.emit('rush');
                }
                sio.emit('playerMovement', playerMovement);

                ctx.clearRect(0, 0, gameMap.width, gameMap.height);

                drawPad(gameState.players[socketId].role);
                for (let player in gameState.players) {
                    drawPlayer(gameState.players[player]);
                }
                for (let i = 0; i < gameState.powerUps.length; i++) {
                    drawPU(gameState.powerUps[i]);
                }
            })
        })

        let disconnectSio = fromEvent(sio, 'disconnect');
        disconnectSio.subscribe(function (data) {
            console.log(data);
            gameRun(gameState.end);
            sio.close();
        })

        currentState = gameState.waiting;
        gameRun(currentState);
    });

    connect_errorSio.subscribe(function () {
        let url = askForServerIp("Can not connect to the server, please input the server ip");
        console.log(url);
        startConnect(url);
    });
}

function askForServerIp(text) {
    let server_ip = window.prompt(text, "");
    let regex = server_ip.search('[a-zA-z]+://[^\\s]*');
    if (regex == 0) {
        return server_ip;
    } else {
        return askForServerIp('Can not match the regex, please input again');
    }
}

function getOperationSys() {
    var OS = '';
    var OSArray = {};
    var UserAgent = navigator.userAgent.toLowerCase();
    OSArray.Windows = (navigator.platform == 'Win32') || (navigator.platform == 'Windows');
    OSArray.Mac = (navigator.platform == 'Mac68K') || (navigator.platform == 'MacPPC')
        || (navigator.platform == 'Macintosh') || (navigator.platform == 'MacIntel');
    OSArray.iphone = UserAgent.indexOf('iphone') > -1;
    OSArray.ipod = UserAgent.indexOf('ipod') > -1;
    OSArray.ipad = UserAgent.indexOf('ipad') > -1;
    OSArray.Android = UserAgent.indexOf('android') > -1;
    for (var i in OSArray) {
        if (OSArray[i]) {
            OS = i;
        }
    }
    return OS;
}