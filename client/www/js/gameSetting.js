const {of, merge, fromEvent} = rxjs;
const {map, delay, filter} = rxjs.operators;

//game setting
const gameMap = {
    width: 900,
    height: 1600
}
var gamePad = new Image();
gamePad.src = 'assets/dpad.png';
var gamePad2 = new Image();
gamePad2.src = 'assets/dpad2.png';
var twinkle = new Image();
twinkle.src = 'assets/twinkle.png';
var trap = new Image();
trap.src = 'assets/trap.png';
var boost = new Image();
boost.src = 'assets/boost.png';
var slow = new Image();
slow.src = 'assets/slow.png';
var forbidden = new Image();
forbidden.src = 'assets/forbidden.png';

var you = new Image();
you.src = 'assets/you.png';
var mate = new Image();
mate.src = 'assets/mate.png';
var ghost = new Image();
ghost.src = 'assets/ghost.png';
var ghost2 = new Image();
ghost2.src = 'assets/ghost2.png';
var highlight = new Image();
highlight.src = 'assets/highlight.png';

//const
var gameState = {
    preparing: 0,
    waiting: 1,
    running: 2,
    end: 3
}