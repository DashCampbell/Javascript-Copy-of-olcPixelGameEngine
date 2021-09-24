const gravity = 60;
var planets = [];

var Player = {
    r: 15,
    px: 20, py: 20,
    vx: 0, vy: 0,
    speed: 80,
    bOnPlanet: false,
    update: function (fElapsedTime) {
        // if (keyState[KEY.UP].bHeld)
        //     Player.py -= this.speed * fElapsedTime;
        // if (keyState[KEY.DOWN].bHeld)
        //     Player.py += this.speed * fElapsedTime;
        if (keyState[KEY.UP].bPressed)
            Player.vy = -100;
        if (keyState[KEY.LEFT].bHeld)
            Player.vx -= this.speed * fElapsedTime;
        if (keyState[KEY.RIGHT].bHeld)
            Player.vx += this.speed * fElapsedTime;
        let vec;
        this.bOnPlanet = false;
        planets.forEach(function (v) {
            vec = new vec2d(v.px - Player.px, v.py - Player.py);
            if ((vec.x * vec.x + vec.y * vec.y) <= (Player.r + v.g_range) * (Player.r + v.g_range))
                Player.bOnPlanet = true;
        });
        this.vx += this.vx * -0.5 * fElapsedTime;
        if (Math.abs(this.vx) < 0.01)
            this.vx = 0;
        this.vy += gravity * fElapsedTime;

        if (!this.bOnPlanet) {
            this.px += this.vx * fElapsedTime;
            this.py += this.vy * fElapsedTime;
        } else {
            var vecd = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

            var c_vx = (vec.y / vecd) * this.vx;
            var c_vy = (-vec.x / vecd) * this.vx;
            var gx = (vec.x / vecd) * this.vy;
            var gy = (vec.y / vecd) * this.vy;

            this.px += (gx + c_vx) * fElapsedTime;
            this.py += (gy + c_vy) * fElapsedTime;
        }

        if (this.px > ScreenWidth() - this.r)
            this.px = ScreenWidth() - this.r;
        if (this.px < this.r)
            this.px = this.r;
        if (this.py > ScreenHeight() - this.r)
            this.py = ScreenHeight() - this.r;
    }
}
function Planet(px, py, radius, g_range) {
    this.px = px;
    this.py = py;
    this.r = radius;
    this.g_range = g_range;

    this.update = function (fElapsedTime) {
        var vec = new vec2d(Player.px - this.px, Player.py - this.py);
        //collision
        var d = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (d <= (Player.r + this.r)) {
            Player.px += (vec.x / d) * (this.r - d + Player.r);
            Player.py += (vec.y / d) * (this.r - d + Player.r);
        }
    };
}

function init() {
    Game.onUserCreate = function () {
        planets.push(new Planet(220, 200, 50, 170));

        return true;
    }
    Game.update = function (fElapsedTime) {
        //tick
        Player.update(fElapsedTime);
        planets.forEach(function (v) {
            v.update(fElapsedTime);
        });
        //render
        Clear();
        planets.forEach(function (v) {
            FillCircle(v.px, v.py, v.g_range, "#F9F");
            FillCircle(v.px, v.py, v.r, "#A01");
        });
        FillCircle(Player.px, Player.py, Player.r, "#05F");
        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);