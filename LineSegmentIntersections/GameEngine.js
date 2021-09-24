// <--------------EXAMPLE IMPLEMENTAION---------------------->
//js
// function init() {
//     Game.onUserCreate = function () {


//         return true;
//     }
//     Game.update = function (fElapsedTime) {

//         return true;
//     }
//     if (Game.ConstructCanvas(800, 400))
//         Game.Start();
// }
// document.addEventListener("DOMContentLoaded", init);

//html
/* <html>

<head>
    <title>Game Engine</title>
    <script type="text/javascript" src="game.js"></script>
    <script type="text/javascript" src="GameEngine.js"></script>
</head>

<body style="padding: 5% 20%;">
</body>

</html> */

//Document Elements
var title;
var canvas, c;
/**Returns Canvas Width */
var ScreenWidth = function () { return canvas.width; }
/**Returns Canvas Height */
var ScreenHeight = function () { return canvas.height; }

/**Creates a 2D Vector */
function vec2d(x = 0, y = 0) {
    this.x = x;
    this.y = y;
}

//Mouse Input
var mouseState = { bPressed: false, bReleased: false, bHeld: false };
var mousePos = new vec2d(undefined, undefined);
/**Returns the X position of the mouse on the canvas. */
function GetMouseX() { return mousePos.x; }
/**Returns the Y position of the mouse on the canvas. */
function GetMouseY() { return mousePos.y; }
var updateMousePos = function (e) {
    mousePos.x = e.pageX - canvas.offsetLeft;
    mousePos.y = e.pageY - canvas.offsetTop;
};

//Key Input
/**
 * Get the key state of a specific key; if it is held, released, or pressed.
 * - Example - keyState[KEY.BACKSPACE].bHeld
 * */
var keyState = [];
var changedKeys = [];
//Key Codes
const KEY = {
    BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16,
    CTRL: 17, ALT: 18, PAUSE: 19, CAPS_LOCK: 20,
    ESCAPE: 27, SPACE: 32, PAGE_UP: 33, PAGE_DOWN: 34,
    END: 35, HOME: 36,
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
    INSERT: 45, DELETE: 46,
    K0: 48, K1: 49, K2: 50, K3: 51, K4: 52,
    K5: 53, K6: 54, K7: 55, K8: 56, K9: 57,
    A: 65, B: 66, C: 67, D: 68, E: 69, F: 70,
    G: 71, H: 72, I: 73, J: 74, K: 75, L: 76,
    M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
    S: 83, T: 84, U: 85, V: 86, W: 87, X: 88,
    Y: 89, Z: 90,
    LEFT_META: 91, RIGHT_META: 92, SELECT: 93,
    NUMPAD_0: 96, NUMPAD_1: 97, NUMPAD_2: 98,
    NUMPAD_3: 99, NUMPAD_4: 100, NUMPAD_5: 101,
    NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104,
    NUMPAD_9: 105,
    MULTIPLY: 106, ADD: 107, SUBTRACT: 109, DECIMAL: 110, DIVIDE: 111,
    F1: 112, F2: 113, F3: 114, F4: 115,
    F5: 116, F6: 117, F7: 118, F8: 119,
    F9: 120, F10: 121, F11: 122, F12: 123,
    NUM_LOCK: 144, SCROLL_LOCK: 145,
    SEMICOLON: 186, EQUALS: 187, COMMA: 188, DASH: 189, PERIOD: 190,
    FORWARD_SLASH: 191, GRAVE_ACCENT: 192, OPEN_BRACKET: 219, BACK_SLASH: 220,
    CLOSE_BRACKET: 221, SINGLE_QUOTE: 222
};

//<------------GAME ENGINE--------------------------------------->
var Game = {
    //elapsed time of one frame
    fElapsedTime: 0,
    fOldTimeStamp: 0,
    /**
     *Creates canvas element in body of the document.
     * @param {number} w - Width of Canvas 
     * @param {number} h - Height of Canvas
     */
    ConstructCanvas: function (w, h) {
        canvas = document.createElement("CANVAS");
        canvas.style = "border: 3px solid black; box-shadow: -2px -2px 10px 10px #ccc;";
        canvas.id = "screen";
        canvas.width = w;
        canvas.height = h;
        document.body.appendChild(canvas);

        c = canvas.getContext("2d");
        title = document.getElementsByTagName("title")[0].innerText;
        return true;
    },
    Start: function () {
        //Key Input
        for (var i = 0; i < 223; i++)
            keyState.push({ bPressed: false, bReleased: false, bHeld: false });
        document.addEventListener("keydown", function (e) {
            key = keyState[e.keyCode || e.which];
            if (!key.bHeld) {
                key.bPressed = true;
                changedKeys.push(key);
            }
            key.bHeld = true;
        });
        document.addEventListener("keyup", function (e) {
            key = keyState[e.keyCode || e.which];
            key.bHeld = false;
            key.bReleased = true;
            changedKeys.push(key);
        });
        //Mouse Input
        canvas.addEventListener("mousedown", function (e) {
            updateMousePos(e);
            if (!mouseState.bHeld)
                mouseState.bPressed = true;
            mouseState.bHeld = true;
        });
        canvas.addEventListener("mouseup", function (e) {
            updateMousePos(e);
            mouseState.bHeld = false;
            mouseState.bReleased = true;
        });
        canvas.addEventListener("mousemove", function (e) {
            updateMousePos(e);
        });

        if (this.onUserCreate())
            this.run();
    },
    //Game Loop
    run: function (fTimeStamp = 0) {
        //calculate elapsed time of the frame
        this.fElapsedTime = (fTimeStamp - this.fOldTimeStamp) / 1000;
        this.fOldTimeStamp = fTimeStamp;
        //update title
        document.getElementsByTagName("title")[0].innerText = title + " - FPS: " + (1 / this.fElapsedTime).toFixed(1);

        //modified by user
        if (this.update(this.fElapsedTime)) {
            //Reset Key States
            changedKeys.forEach(function (v) {
                if (v.bReleased) v.bReleased = false;
                else v.bPressed = false;
            });
            changedKeys = [];
            //Reset Mouse States
            mouseState.bReleased = false;
            mouseState.bPressed = false;
            window.requestAnimationFrame(this.run.bind(this));
        }
    },
    //Modify onUserCreate() and update()
    /**Called at the start of the game.*/
    onUserCreate: function () { return true; },
    /**
     * Called every frame.
     * @param {number} fElapsedTime - Is the elapsed time of the previous frame.
     * */
    update: function (fElapsedTime) { return true; },
}

//<------------RENDER METHODS--------------------------------------->
//Fill Functions
/**Fills Entire Canvas */
function Clear(color = "#FFF") {
    c.fillStyle = color;
    c.fillRect(0, 0, canvas.width, canvas.height);
}
/**
 * Default Font-Family is Arial.
 * @param {number} x - X coordinate of text.
 * @param {number} y - Y coordinate of text.
 * @param {string} text - Text to be displayed on canvas.
 * @param {string} color - Text color.
 * @param {number} fontSize - Text size.
 */
function FillText(x, y, text, color = "#000", fontSize = 20) {
    c.fillStyle = color;
    c.font = fontSize + "px Arial";
    c.fillText(text, x, y);
}
function FillRect(x, y, w, h, color = "#000") {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
}
function FillCircle(x, y, r, color = "#000") {
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2, false);
    c.fill();
}
/** @param {Array<vec2d>} poly - Array of 2D Vectors */
function FillPolygon(poly, color = "#000") {
    if (poly.length < 3) return;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(poly[0].x, poly[0].y);
    for (var i = 1; i < poly.length; i++) { c.lineTo(poly[i].x, poly[i].y); }
    c.closePath();
    c.fill();
}
//Draw Functions
function DrawLine(x1, y1, x2, y2, color = "#000") {
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
}
function DrawCircle(x, y, r, color = "#000") {
    c.strokeStyle = color;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2, false);
    c.stroke();
}
function DrawRect(x, y, w, h, color = "#000") {
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + w, y);
    c.lineTo(x + w, y + h);
    c.lineTo(x, y + h);
    c.stroke();
}
/** @param {Array<vec2d>} poly - Array of 2D Vectors */
function DrawPolygon(poly, color = "#000") {
    if (poly.length < 3) return;
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(poly[0].x, poly[0].y);
    for (var i = 1; i < poly.length; i++) { c.lineTo(poly[i].x, poly[i].y); }
    c.stroke();
}