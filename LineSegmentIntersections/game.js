var rad = 12;
var lines = [];
function line(s, e) { this.s = s; this.e = e; this.overlap = false; };

function init() {
    Game.onUserCreate = function () {
        lines.push(new line(new vec2d(200, 170), new vec2d(100, 200)));
        lines.push(new line(new vec2d(100, 100), new vec2d(300, 30)));
        lines.push(new line(new vec2d(300, 200), new vec2d(230, 300)));

        return true;
    }
    Game.update = function (fElapsedTime) {
        if (mouseState.bHeld) {
            lines.forEach(function (line) {
                var sd = (line.s.x - GetMouseX()) * (line.s.x - GetMouseX()) +
                    (line.s.y - GetMouseY()) * (line.s.y - GetMouseY());
                var ed = (line.e.x - GetMouseX()) * (line.e.x - GetMouseX()) +
                    (line.e.y - GetMouseY()) * (line.e.y - GetMouseY());

                if (sd <= rad * rad) {
                    line.s.x = GetMouseX();
                    line.s.y = GetMouseY();
                } else if (ed <= rad * rad) {
                    line.e.x = GetMouseX();
                    line.e.y = GetMouseY();
                }
            });
        }
        var intersections = [];
        //Collisions
        lines.forEach(function (v) { v.overlap = false; })
        lines.forEach(function (line1, i) {
            //Test Line Against every line but itself
            for (var j = i + 1; j < lines.length; j++) {
                line2 = lines[j];
                //line 1
                var P = line1.s;
                var R = new vec2d(line1.e.x - line1.s.x, line1.e.y - line1.s.y);
                //line 2
                var Q = line2.s;
                var S = new vec2d(line2.e.x - line2.s.x, line2.e.y - line2.s.y);

                //Uses Cross Product
                var denom = (line1.e.x - line1.s.x) * (line2.e.y - line2.s.y) - (line1.e.y - line1.s.y) * (line2.e.x - line2.s.x);
                if (denom != 0) {
                    var t1 = ((Q.x - P.x) * S.y - (Q.y - P.y) * S.x) / denom;
                    var t2 = ((Q.x - P.x) * R.y - (Q.y - P.y) * R.x) / denom;
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        var pos = new vec2d(P.x + t1 * R.x, P.y + t1 * R.y);
                        intersections.push(pos);
                        line1.overlap = true;
                        line2.overlap = true;
                    }
                }
            }
        });
        //sort intersection
        intersections.sort(function (a, b) {
            return (b.x * b.x + b.y * b.y) - (a.x * a.x + a.y * a.y);
        });
        //RENDER
        Clear();
        lines.forEach(function (v) {
            var col = v.overlap ? "#F00" : "#00F";
            DrawLine(v.s.x, v.s.y, v.e.x, v.e.y, col);
            FillCircle(v.s.x, v.s.y, rad, col);
            FillText(v.s.x, v.s.y, 'S', "#FFF", 12);

            FillCircle(v.e.x, v.e.y, rad, col);
            FillText(v.e.x, v.e.y, 'E', "#FFF", 12);
        });
        FillPolygon(intersections, "#90F");
        intersections.forEach(function (pos) {
            FillCircle(pos.x, pos.y, 5, "#00F");
        });

        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);