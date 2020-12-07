var playerMovement = {
    up: false,
    down: false,
    left: false,
    right: false
}

function onListening() {
    let h = window.screen.height;
    let w = window.screen.width;

    if (h > w) {
        canvas.style = 'width:100vw;height:calc(100/9*16)vw;';
    } else {
        canvas.style = 'width:calc(100/16*9)vh;height:100vh;';
    }

    let mu$ = rxjs.fromEvent(document, 'mouseup');
    let md$ = rxjs.fromEvent(document, 'mousedown');

    let ts$ = rxjs.fromEvent(document, 'touchstart');
    let te$ = rxjs.fromEvent(document, 'touchend');
    let tc$ = rxjs.fromEvent(document, 'touchcancel');


    md$ = md$.pipe(map(val => getDirection(getEventPosition(val))));
    md$.subscribe((a) => changeMovement(a));

    ts$ = ts$.pipe(map(val => getDirection(getEventPosition({
        x: val.touches[0].clientX,
        y: val.touches[0].clientY
    }))));
    ts$.subscribe((a) => changeMovement(a));

    mu$.subscribe(function () {
        playerMovement.up = false;
        playerMovement.left = false;
        playerMovement.down = false;
        playerMovement.right = false;
    });
    te$.subscribe(function () {
        playerMovement.up = false;
        playerMovement.left = false;
        playerMovement.down = false;
        playerMovement.right = false;
    });
    tc$.subscribe(function () {
        playerMovement.up = false;
        playerMovement.left = false;
        playerMovement.down = false;
        playerMovement.right = false;
    });
}

function changeMovement(dir) {
    switch (dir) {
        case 'up': {
            playerMovement.up = true;
            break;
        }
        case 'left': {
            playerMovement.left = true;
            break;
        }
        case 'down': {
            playerMovement.down = true;
            break;
        }
        case 'right': {
            playerMovement.right = true;
            break;
        }
    }
}

function getDirection(point) {
    if (point.x > 411 && point.x < 491 && point.y > 1311 && point.y < 1406) {
        return 'up';
    }
    if (point.x > 316 && point.x < 411 && point.y > 1404 && point.y < 1484) {
        return 'left';
    }
    if (point.x > 411 && point.x < 491 && point.y > 1486 && point.y < 1581) {
        return 'down';
    }
    if (point.x > 491 && point.x < 586 && point.y > 1404 && point.y < 1484) {
        return 'right';
    }
}

function getEventPosition(point) {
    let bbox = canvas.getBoundingClientRect();
    return {
        x: (point.x - bbox.left) * (canvas.width / bbox.width),
        y: (point.y - bbox.top) * (canvas.height / bbox.height)
    }
}
