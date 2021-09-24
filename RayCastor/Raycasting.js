var fFOV = Math.PI / 4;
var fDepth = 28.0;
var fSpeed = 5.0;
var Player = { x: 4.7, y: 5.09, A: 0 }//A = angle

var map;
var nMapWidth = 32;
var nMapHeight = 64;

function init() {
    Game.onUserCreate = function () {
        map = "";
        map += "################################";
        map += "#...............#..............#";
        map += "#.......#########.......########";
        map += "#..............##..............#";
        map += "#......##......##......##......#";
        map += "#......##..............##......#";
        map += "#..............##..............#";
        map += "###............####............#";
        map += "##.............###.............#";
        map += "#............####............###";
        map += "#..............................#";
        map += "#..............##..............#";
        map += "#..............##..............#";
        map += "#...........#####...........####";
        map += "#..............................#";
        map += "###..####....########....#######";
        map += "####.####.......######.........#";
        map += "#...............#..............#";
        map += "#.......#########.......##..####";
        map += "#..............##..............#";
        map += "#......##......##.......#......#";
        map += "#......##......##......##......#";
        map += "#..............##..............#";
        map += "###............####............#";
        map += "##.............###.............#";
        map += "#............####............###";
        map += "#..............................#";
        map += "#..............................#";
        map += "#..............##..............#";
        map += "#...........##..............####";
        map += "#..............##..............#";
        map += "################################";

        return true;
    }
    Game.update = function (fElapsedTime) {
        // console.log("x: " + Player.x + ", y: " + Player.y);
        if (keyState[KEY.W].bHeld) {
            Player.x += Math.cos(Player.A) * fSpeed * fElapsedTime;
            Player.y += Math.sin(Player.A) * fSpeed * fElapsedTime;
            if (map[Math.floor(Player.y) * nMapWidth + Math.floor(Player.x)] === '#') {
                Player.x -= Math.cos(Player.A) * fSpeed * fElapsedTime;
                Player.y -= Math.sin(Player.A) * fSpeed * fElapsedTime;
            }
        }
        if (keyState[KEY.S].bHeld) {
            Player.x -= Math.cos(Player.A) * fSpeed * fElapsedTime;
            Player.y -= Math.sin(Player.A) * fSpeed * fElapsedTime;
            if (map[Math.floor(Player.y) * nMapWidth + Math.floor(Player.x)] === '#') {
                Player.x += Math.cos(Player.A) * fSpeed * fElapsedTime;
                Player.y += Math.sin(Player.A) * fSpeed * fElapsedTime;
            }
        }
        if (keyState[KEY.A].bHeld) {
            Player.x += Math.sin(Player.A) * fSpeed * fElapsedTime;
            Player.y += -Math.cos(Player.A) * fSpeed * fElapsedTime;
            if (map[Math.floor(Player.y) * nMapWidth + Math.floor(Player.x)] === '#') {
                Player.x -= Math.sin(Player.A) * fSpeed * fElapsedTime;
                Player.y -= -Math.cos(Player.A) * fSpeed * fElapsedTime;
            }
        }
        if (keyState[KEY.D].bHeld) {
            Player.x -= Math.sin(Player.A) * fSpeed * fElapsedTime;
            Player.y -= -Math.cos(Player.A) * fSpeed * fElapsedTime;
            if (map[Math.floor(Player.y) * nMapWidth + Math.floor(Player.x)] === '#') {
                Player.x += Math.sin(Player.A) * fSpeed * fElapsedTime;
                Player.y += -Math.cos(Player.A) * fSpeed * fElapsedTime;
            }
        }
        if (keyState[KEY.LEFT].bHeld)
            Player.A -= fSpeed * 0.4 * fElapsedTime;
        if (keyState[KEY.RIGHT].bHeld)
            Player.A += fSpeed * 0.4 * fElapsedTime;

        for (var x = 0; x < ScreenWidth(); x++) {
            var fRayAngle = (Player.A - fFOV / 2) + (x / ScreenWidth()) * fFOV;
            var fStepSize = 0.01;
            var fDistanceToWall = 0.0;
            var fEyeX = Math.cos(fRayAngle);
            var fEyeY = Math.sin(fRayAngle);

            var bHitWall = false;
            var bBoundary = false;

            while (!bHitWall && fDistanceToWall < fDepth) {
                fDistanceToWall += fStepSize;
                var nTestX = Math.floor(Player.x + fEyeX * fDistanceToWall);
                var nTestY = Math.floor(Player.y + fEyeY * fDistanceToWall);

                if (nTestX < 0 || nTestX >= nMapWidth || nTestY < 0 || nTestY >= nMapHeight) {
                    bHitWall = true;
                    fDistanceToWall = fDepth;
                } else {
                    if (map[nTestY * nMapWidth + nTestX] === '#') {
                        bHitWall = true;

                        var p = [];
                        for (tx = 0; tx < 2; tx++)
                            for (ty = 0; ty < 2; ty++) {
                                var vx = nTestX + tx - Player.x;
                                var vy = nTestY + ty - Player.y;
                                var d = Math.sqrt(vx * vx + vy * vy);
                                var dot = (fEyeX * vx / d) + (fEyeY * vy / d);
                                p.push([d, dot]);
                            }
                        p.sort(function (a, b) { return a[0] - b[0]; });

                        var fBound = 0.001;
                        if (Math.acos(p[0][1]) < fBound) bBoundary = true;
                        if (Math.acos(p[1][1]) < fBound) bBoundary = true;
                    }
                }
            }
            var fDistance = ((fEyeX * Math.cos(Player.A)) + (fEyeY * Math.sin(Player.A))) * fDistanceToWall;
            var nCeiling = (ScreenHeight() / 2) - (ScreenHeight() / fDistance);
            var nFloor = ScreenHeight() - nCeiling;

            var nShade = ((fDistanceToWall >= fDepth) || bBoundary) ? 0 : 450 / (fDistanceToWall);

            DrawLine(x, 0, x, nCeiling, "#0CF");
            DrawLine(x, nCeiling, x, nFloor, 'rgba(' + (nShade * 1.6) + ', 0, ' + (nShade * 0.3) + ')');
            DrawLine(x, nFloor, x, ScreenHeight(), "#062");
        }
        return true;
    }
    if (Game.ConstructCanvas(900, 500, 1))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);
