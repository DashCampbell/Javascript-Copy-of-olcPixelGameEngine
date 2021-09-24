var shapes = [];
var projPoints = [];
var shape = 0;
var nEdge;

function polygon() {
    this.p = [];//transformed points
    this.pos = new vec2d();//central position of polygon
    this.angle = 0;//direction
    this.o = [];//original model
    this.min = -Infinity;
    this.max = Infinity;
}

function init() {
    Game.onUserCreate = function () {
        //create hexagon
        var fTheta = Math.PI * 2 / 6;
        var fSize = 70;
        var p1 = new polygon();
        p1.pos.x = 100; p1.pos.y = 100;
        for (var i = 0; i < 6; i++) {
            p1.o.push(new vec2d(fSize * Math.cos(fTheta * i), fSize * Math.sin(fTheta * i)));
        }
        shapes.push(p1);
        //triangle
        fTheta = Math.PI * 2 / 3;
        fSize = 60;
        var p2 = new polygon();
        p2.pos.x = 260; p2.pos.y = 150;
        for (var i = 0; i < 3; i++) {
            p2.o.push(new vec2d(fSize * Math.cos(fTheta * i), fSize * Math.sin(fTheta * i)));
        }
        shapes.push(p2);

        nEdge = new vec2d(100, 50);
        let d = Math.sqrt(nEdge.x * nEdge.x + nEdge.y * nEdge.y);
        nEdge.x /= d;
        nEdge.y /= d;
        return true;
    }
    Game.update = function (fElapsedTime) {
        //Input
        if (keyState[KEY.K1].bPressed)
            shape = 0;
        if (keyState[KEY.K2].bPressed)
            shape = 1;
        var speed = 100;
        if (keyState[KEY.LEFT].bHeld)
            shapes[shape].angle -= 2 * fElapsedTime;
        if (keyState[KEY.RIGHT].bHeld)
            shapes[shape].angle += 2 * fElapsedTime;
        if (keyState[KEY.UP].bHeld) {
            shapes[shape].pos.x += Math.cos(shapes[shape].angle) * speed * fElapsedTime;
            shapes[shape].pos.y += Math.sin(shapes[shape].angle) * speed * fElapsedTime;
        }
        if (keyState[KEY.DOWN].bHeld) {
            shapes[shape].pos.x -= Math.cos(shapes[shape].angle) * speed * fElapsedTime;
            shapes[shape].pos.y -= Math.sin(shapes[shape].angle) * speed * fElapsedTime;
        }
        shapes.forEach(function (v) {
            v.o.forEach(function (o, i) {
                v.p[i] = new vec2d(o.x * Math.cos(v.angle) - o.y * Math.sin(v.angle) + v.pos.x,
                    o.x * Math.sin(v.angle) + o.y * Math.cos(v.angle) + v.pos.y);
            });
        });
        projPoints = [];
        shapes.forEach(function (v) {
            v.min = Infinity;
            v.max = -Infinity;
            v.p.forEach(function (p) {
                var d = nEdge.x * p.x + nEdge.y * p.y;
                v.min = Math.min(v.min, d);
                v.max = Math.max(v.max, d);
                projPoints.push(new vec2d(nEdge.x * d, nEdge.y * d));
            });
        });

        //Render
        Clear();
        shapes.forEach(function (v) {
            DrawPolygon(v.p, "#00F");
            DrawLine(v.pos.x, v.pos.y, v.p[0].x, v.p[0].y, "#00F");
            v.p.forEach(function (p) {
                FillCircle(p.x, p.y, 3, "#0AF");
            });
        });
        c.setLineDash([5, 5]);
        DrawLine(0, 0, nEdge.x * ScreenWidth() * 2, nEdge.y * ScreenWidth() * 2, "#26F");
        c.setLineDash([]);

        //Show Projected Points
        projPoints.forEach(function (v) {
            FillCircle(v.x, v.y, 3, "#C0F");
        });
        //or Show Projected Max and Min Points
        shapes.forEach(function (v) {
            FillCircle(nEdge.x * v.min, nEdge.y * v.min, 3, "#A0F")
            DrawLine(nEdge.x * v.min, nEdge.y * v.min, nEdge.x * v.max, nEdge.y * v.max, "#C0F");
            FillCircle(nEdge.x * v.max, nEdge.y * v.max, 3, "#A0F")
        });

        FillText(20, 20, "1: Hexagon", (shape === 0) ? "#F00" : "#000");
        FillText(20, 40, "2: Triangle", (shape === 1) ? "#F00" : "#000");
        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);