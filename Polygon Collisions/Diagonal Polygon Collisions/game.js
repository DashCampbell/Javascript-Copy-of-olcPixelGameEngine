var shape = 0;
var shapes = [];
var intersects = [];

function polygon() {
    this.p = [];//transformed points
    this.pos = new vec2d();//central position of polygon
    this.angle = 0;//direction
    this.o = [];//original model
    this.bOverlap = false;
}
function collision(poly1, poly2) {
    var shape1 = poly1;
    var shape2 = poly2;
    for (var s = 0; s < 2; s++) {
        if (s === 1) {
            shape1 = poly2;
            shape2 = poly1;
        }
        for (var i = 0; i < shape1.p.length; i++) {
            var l1s = shape1.pos;
            var l1e = shape1.p[i];
            for (var j = 0; j < shape2.p.length; j++) {
                var l2s = shape2.p[j];
                var l2e = shape2.p[(j + 1) % shape2.p.length];

                var QP = new vec2d(l2s.x - l1s.x, l2s.y - l1s.y);
                var denom = (l1e.x - l1s.x) * (l2e.y - l2s.y) - (l1e.y - l1s.y) * (l2e.x - l2s.x);
                var t1 = (QP.x * (l2e.y - l2s.y) - QP.y * (l2e.x - l2s.x)) / denom;
                var t2 = (QP.x * (l1e.y - l1s.y) - QP.y * (l1e.x - l1s.x)) / denom;

                if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                    var intersect = new vec2d(l1s.x + (l1e.x - l1s.x) * t1, l1s.y + (l1e.y - l1s.y) * t1);
                    var overlap = new vec2d((l1e.x - intersect.x), (l1e.y - intersect.y));
                    intersects.push(intersect);

                    shape1.pos.x -= overlap.x / 2;
                    shape1.pos.y -= overlap.y / 2;

                    shape2.pos.x += overlap.x / 2;
                    shape2.pos.y += overlap.y / 2;

                    shape1.bOverlap = true;
                    shape2.bOverlap = true;
                    return;
                }
            }
        }
    }
}
function init() {
    Game.onUserCreate = function () {
        //create petagon
        var fTheta = Math.PI * 2 / 5;
        var fSize = 70;
        var p1 = new polygon();
        p1.pos.x = 100; p1.pos.y = 100;
        for (var i = 0; i < 5; i++) {
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
        FillText(20, 20, "1: Petagon", (shape === 0) ? "#F00" : "#000");
        FillText(20, 40, "2: Triangle", (shape === 1) ? "#F00" : "#000");
        FillText(20, 60, "Overlapping: " + (shapes[0].bOverlap ? "True" : "False"));

        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);
