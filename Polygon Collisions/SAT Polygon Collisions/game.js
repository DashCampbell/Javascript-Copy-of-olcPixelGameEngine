var shape = 0;
var shapes = [];
var intersects = [];

function polygon() {
    this.p = [];//transformed points
    this.pos = new vec2d();//central position of polygon
    this.angle = 0;//direction
    this.o = [];//original model
    this.bOverlap = false;
    this.bSymmetrical = false;
}
function collision(p1, p2) {
    var poly1 = p1;
    var poly2 = p2;
    var nOverlap = Infinity;

    for (var polys = 0; polys < 2; polys++) {
        if (polys === 1) {
            poly1 = p2;
            poly2 = p1;
        }
        for (var a = 0; a < poly1.p.length; a++) {
            var b = (a + 1) % poly1.p.length;
            var axisProj = new vec2d(-(poly1.p[b].y - poly1.p[a].y), poly1.p[b].x - poly1.p[a].x);
            var d = Math.sqrt(axisProj.x * axisProj.x + axisProj.y * axisProj.y);
            axisProj.x /= d;
            axisProj.y /= d;

            var min_p1 = Infinity, max_p1 = -Infinity;
            for (p = 0; p < poly1.p.length; p++) {
                var q = poly1.p[p].x * axisProj.x + poly1.p[p].y * axisProj.y;
                min_p1 = Math.min(min_p1, q);
                max_p1 = Math.max(max_p1, q);
            }
            var min_p2 = Infinity, max_p2 = -Infinity;
            for (p = 0; p < poly2.p.length; p++) {
                var q = poly2.p[p].x * axisProj.x + poly2.p[p].y * axisProj.y;
                min_p2 = Math.min(min_p2, q);
                max_p2 = Math.max(max_p2, q);
            }
            nOverlap = Math.min(Math.min(max_p2, max_p1) - Math.max(min_p2, min_p1), nOverlap);
            if (!(max_p2 >= min_p1 && max_p1 >= min_p2))
                return;
        }
    }
    var d = new vec2d(p2.pos.x - p1.pos.x, p2.pos.y - p1.pos.y);
    var s = Math.sqrt(d.x * d.x + d.y * d.y);

    p1.pos.x -= nOverlap * d.x / s;
    p1.pos.y -= nOverlap * d.y / s;
    p2.pos.x += nOverlap * d.x / s;
    p2.pos.y += nOverlap * d.y / s;

    p1.bOverlap = true;
    p2.bOverlap = true;
}
function init() {
    Game.onUserCreate = function () {
        //create hexagon
        var fTheta = Math.PI * 2 / 6;
        var fSize = 70;
        var p1 = new polygon();
        p1.pos.x = 100; p1.pos.y = 100;
        p1.bSymmetrical = true;
        for (var i = 0; i < 6; i++) {
            p1.o.push(new vec2d(fSize * Math.cos(fTheta * i), fSize * Math.sin(fTheta * i)));
        }
        //triangle
        fTheta = Math.PI * 2 / 3;
        fSize = 60;
        var p2 = new polygon();
        p2.pos.x = 260; p2.pos.y = 150;
        for (var i = 0; i < 3; i++) {
            p2.o.push(new vec2d(fSize * Math.cos(fTheta * i), fSize * Math.sin(fTheta * i)));
        }

        shapes.push(p1);
        shapes.push(p2);

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
            v.bOverlap = false;
        });
        //collision
        intersects = [];
        shapes.forEach(function (v, i) {
            for (var i = i + 1; i < shapes.length; i++)
                collision(v, shapes[i]);
        });

        //Render
        Clear();
        shapes.forEach(function (v) {
            DrawPolygon(v.p, v.bOverlap ? "#F00" : "#00F");
            DrawLine(v.pos.x, v.pos.y, v.p[0].x, v.p[0].y, v.bOverlap ? "#F00" : "#00F");
        });
        intersects.forEach(function (v) {
            FillCircle(v.x, v.y, 5, "#00F");
        });
        FillText(20, 20, "1: Hexagon", (shape === 0) ? "#F00" : "#000");
        FillText(20, 40, "2: Triangle", (shape === 1) ? "#F00" : "#000");
        FillText(20, 60, "Overlapping: " + (shapes[0].bOverlap ? "True" : "False"));

        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);
