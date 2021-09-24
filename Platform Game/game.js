var nTileSize;
var nVisibleTilesX, nVisibleTilesY;
var viewport = { x: 0, y: 0 };

const STATE = { MENU: 0, PLAY: 1, CREATE: 2 };
var currentState;
var currentTile;

var maps = [];
var currentMap;
var currentMapIndex;
var nLiquidLevel;
var bRising;


const ID = { PLAYER: 0, ENEMY: 1 };
var entities = [];
var player;
var bGameOver;

const Edge = { NORTH: 0, SOUTH: 1, EAST: 2, WEST: 3 };
const TILE = { GROUND: '#', SPRING: '^', COIN: 'o', AIR: '.', ENEMY: 'E', ENEMY_JUMP: 'H', X: 'X', PLAYER: 'P' };
const Tiles = [
    {
        char: '#',
        edge: [
            NORTH = function (e) {
                e.newPy = Math.floor(e.newPy);
                e.vy = 0;
                e.bOnGround = true;
            },
            SOUTH = function (e) {
                e.newPy = Math.floor(e.newPy) + 1;
                e.vy = 0;
            },
            EAST = function (e) {
                e.newPx = Math.floor(e.newPx) + 1;
                if (e.ID === ID.PLAYER) {
                    e.vx = 0;
                    e.onWestWall = false;
                    if (!e.bOnGround) {
                        if (!e.bCanWallJump)
                            e.bEnteredWallJumpState = true;
                        e.bCanWallJump = true;
                        e.bOnWall = true;
                    }
                } else
                    e.right = true;
            },
            WEST = function (e) {
                e.newPx = Math.floor(e.newPx);
                if (e.ID === ID.PLAYER) {
                    e.vx = 0;
                    e.onWestWall = true;
                    if (!e.bOnGround) {
                        if (!e.bCanWallJump)
                            e.bEnteredWallJumpState = true;
                        e.bCanWallJump = true;
                        e.bOnWall = true;
                    }
                } else
                    e.right = false;
            }
        ]
    },
    {
        char: '^',
        edge: [
            NORTH = function (e) {
                e.newPy = Math.floor(e.newPy);
                e.vy = (e.ID === ID.ENEMY) ? (e.bInWater ? -3 : -10) : (keyState[KEY.UP].bHeld && !e.bInWater ? -18 : -4);
            }
        ]
    }
];
function CheckEdge(x, y, e, edge) {
    switch (GetTile(x, y, currentMap)) {
        case Tiles[0].char:
            Tiles[0].edge[edge](e);
            return true;
        case 'X':
            if (e.ID === ID.ENEMY)
                Tiles[0].edge[edge](e);
            else
                bGameOver = true;
            return true;
        case 'o':
            if (e.ID === ID.PLAYER) {
                player.nScore += 100;
                SetTile(x, y, '.');
            }
            return true;
        case '^':
            Tiles[edge === Edge.NORTH ? 1 : 0].edge[edge](e);
    }
}
function TileMap(name, levelMap, levelWidth, levelHeight, liquid = 'null', minLiquidLevel = 0, maxLiquidLevel = 0, nRisingSpeed = 0) {
    if (levelMap.length / levelHeight != levelWidth)
        console.error("WRONG MAP DIMENSIONS - Expected Length: " + levelHeight * levelWidth + ", Map Length: " + levelMap.length);
    this.name = name;
    this.levelMap = levelMap;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;
    if (liquid != 'null') {
        this.liquid = liquid
        this.minLiquidLevel = this.levelHeight - minLiquidLevel;
        this.maxLiquidLevel = this.levelHeight - maxLiquidLevel;
        this.nRisingSpeed = nRisingSpeed;
    }
}
function setMap(index) {
    entities.forEach(function (v) {
        switch (v.ID) {
            case ID.PLAYER:
                SetTile(v.ox, v.oy, 'P');
                break;
            case ID.ENEMY:
                if (!v.bJump)
                    SetTile(v.ox, v.oy, GetTile(v.ox, v.oy) === 'o' ? 'F' : 'E');
                else
                    SetTile(v.ox, v.oy, GetTile(v.ox, v.oy) === 'o' ? 'K' : 'H');
                break;
        }
    });
    entities = [];
    currentMap = maps[index];
    for (var x = 0; x < currentMap.levelWidth; x++)
        for (var y = 0; y < currentMap.levelHeight; y++)
            switch (GetTile(x, y)) {
                case 'P':
                    player = new Player(x, y);
                    entities.push(player);
                    SetTile(x, y, '.');
                    break;
                case 'E':
                    entities.push(new Enemy(x, y, 4, false));
                    SetTile(x, y, '.');
                    break;
                case 'H':
                    entities.push(new Enemy(x, y, 4, true));
                    SetTile(x, y, '.');
                    break;
                case 'F':
                    entities.push(new Enemy(x, y, 4., false));
                    SetTile(x, y, 'o');
                    break;
                case 'K':
                    entities.push(new Enemy(x, y, 4., true));
                    SetTile(x, y, 'o');
                    break;
            }
    nLiquidLevel = currentMap.minLiquidLevel;
}
function SetTile(x, y, char) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < currentMap.levelWidth && y >= 0 && y < currentMap.levelHeight)
        currentMap.levelMap = currentMap.levelMap.substr(0, y * currentMap.levelWidth + x) + char +
            currentMap.levelMap.substr(y * currentMap.levelWidth + x + 1);
}
function GetTile(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < currentMap.levelWidth && y >= 0 && y < currentMap.levelHeight)
        return currentMap.levelMap[y * currentMap.levelWidth + x];
}

class Entity {
    constructor(id, px, py) {
        this.ID = id;
        this.px = px; this.py = py;
        this.ox = px; this.oy = py;
        this.spawnX = px; this.spawnY = py;
        this.newPx; this.newPy;
        this.vx = 0; this.vy = 0;
        this.bOnGround = false;
        this.bEnteredWater;
        this.bInWater;
    }
    update(fElapsedTime) { }
    TileCollision() {
        this.bOnGround = false;
        //Tile Collisions
        if (this.vx <= 0) {//Moving Left
            if (!CheckEdge(this.newPx, this.py, this, Edge.EAST))
                CheckEdge(this.newPx, this.py + 0.9, this, Edge.EAST);
        } else {//Moving Right
            if (!CheckEdge(this.newPx + 1, this.py, this, Edge.WEST))
                CheckEdge(this.newPx + 1, this.py + 0.9, this, Edge.WEST);
        }
        if (this.vy < 0) {//Moving Up
            if (!CheckEdge(this.newPx, this.newPy, this, Edge.SOUTH))
                CheckEdge(this.newPx + 0.9, this.newPy, this, Edge.SOUTH);
        } else //Moving Down
            if (!CheckEdge(this.newPx, this.newPy + 1, this, Edge.NORTH))
                CheckEdge(this.newPx + 0.9, this.newPy + 1, this, Edge.NORTH);
    }
}
class Enemy extends Entity {
    constructor(px, py, speed, bJump) {
        super(ID.ENEMY, px, py);
        this.bAlive = true;
        this.right = true;
        this.bJump = bJump;
        this.vx = speed;
        this.speed = speed;
        this.groundTileY;
        this.spawnGroundY;

        let foundTile = false;
        for (var y = this.py; y < currentMap.levelHeight; y++) {
            switch (GetTile(this.px, y)) {
                case '#':
                case '^':
                case 'X':
                    this.spawnGroundY = y;
                    this.groundTileY = y;
                    foundTile = true;
            }
            if (foundTile)
                break;
        }
    }
    update(fElapsedTime) {
        if (this.bAlive) {
            this.bEnteredWater = false;
            if (this.py + 0.9 > nLiquidLevel) {
                if (!this.bInWater)
                    this.bEnteredWater = true;
                this.bInWater = true;
            } else
                this.bInWater = false;
            //Apply speed
            this.vx = (this.right ? 1 : -1) * this.speed;
            if (Math.abs(this.vx * fElapsedTime) >= 1)
                this.vx = 0;
            //Apply Gravity
            this.vy += (this.bInWater ? 3 : 25) * fElapsedTime;
            if (this.bOnGround && this.bJump)
                this.vy = this.bInWater ? -3 : -10;
            if (this.bEnteredWater || Math.abs(this.vy * fElapsedTime) >= 1)
                this.vy = 0;

            this.newPx = this.px + this.vx * fElapsedTime;
            this.newPy = this.py + this.vy * fElapsedTime;

            if (this.newPx < 0) {
                this.newPx = 0;
                this.right = true;
            }
            if (this.newPx > currentMap.levelWidth - 1) {
                this.newPx = currentMap.levelWidth - 1;
                this.right = false;
            }
            if (this.newPy > currentMap.levelHeight)
                this.bAlive = false;
            this.TileCollision();
            if (this.bOnGround) {
                switch (GetTile(this.newPx, this.newPy + 1)) {
                    case '.':
                    case 'o':
                        this.newPx = Math.floor(this.newPx) + 1;
                        this.right = true;
                }
                switch (GetTile(this.newPx + 1, this.newPy + 1)) {
                    case '.':
                    case 'o':
                        this.newPx = Math.floor(this.newPx);
                        this.right = false;
                }
                this.groundTileY = this.newPy + 1;
            } else {
                switch (GetTile(this.newPx, this.groundTileY)) {
                    case '.':
                    case 'o':
                        this.newPx = Math.floor(this.newPx) + 1;
                        this.right = true;
                }
                switch (GetTile(this.newPx + 1, this.groundTileY)) {
                    case '.':
                    case 'o':
                        this.newPx = Math.floor(this.newPx);
                        this.right = false;
                }
            }
            if (player.px < this.px + 1 && player.px + 1 > this.px && player.py < this.py + 1 && player.py + 1 > this.py) {
                var dir = new vec2d((player.px + 0.5) - (this.newPx + 0.5), (player.py + 0.5) - (this.newPy + 0.5));
                var ang = Math.acos(-dir.y / Math.sqrt(dir.x * dir.x + dir.y * dir.y)) * 180 / Math.PI;
                if (ang <= 50) {
                    this.bAlive = false;
                    player.vy = player.bInWater ? -4 : ((keyState[KEY.UP].bHeld) ? -17 : -10);
                    player.nScore += 500;
                }
                else
                    bGameOver = true;
            }

            this.px = this.newPx;
            this.py = this.newPy;
        }
    }
}
class Player extends Entity {
    constructor(px, py) {
        super(ID.PLAYER, px, py);
        this.bCanWallJump = false;
        this.bEnteredWallJumpState = false;
        this.bOnWall = false;
        this.onWestWall = false;
        this.nScore = 0;
    }
    update(fElapsedTime) {
        if (keyState[KEY.RIGHT].bHeld)
            this.vx += (this.bOnGround ? 40 : 30) * fElapsedTime;
        if (keyState[KEY.LEFT].bHeld)
            this.vx -= (this.bOnGround ? 40 : 30) * fElapsedTime;
        if (keyState[KEY.UP].bHeld && (this.bOnGround || this.bInWater))
            this.vy = (!this.bInWater || this.py + 0.9 < nLiquidLevel) ? -15 : -3;
        else if (keyState[KEY.UP].bPressed && this.bCanWallJump) {
            this.vy = (!this.bInWater || this.py + 0.9 < nLiquidLevel) ? -15 : -3;
            if (this.bCanWallJump && !this.bInWater)
                this.vx = (this.onWestWall ? -15 : 15);
        }
        //Debugging
        // if (keyState[KEY.DOWN].bHeld)
        //     this.vy += 40 * fElapsedTime;
        // if (keyState[KEY.UP].bHeld)
        //     this.vy += -40 * fElapsedTime;
        this.bEnteredWater = false;
        if (this.py + 1 > nLiquidLevel) {
            if (currentMap.liquid == "l")
                bGameOver = true;
            if (!this.bInWater)
                this.bEnteredWater = true;
            this.bInWater = true;
        } else
            this.bInWater = false;
        //Apply drag
        this.vx += -4.5 * this.vx * fElapsedTime;
        if (Math.abs(this.vx) < 0.01 || Math.abs(this.vx * fElapsedTime) >= 1)
            this.vx = 0;
        //Apply Gravity
        this.vy += (this.bInWater || this.bCanWallJump ? 3 : 25) * fElapsedTime;
        if (this.bEnteredWallJumpState || this.bEnteredWater || Math.abs(this.vy * fElapsedTime) >= 1)
            this.vy = 0;

        this.newPx = this.px + this.vx * fElapsedTime;
        this.newPy = this.py + this.vy * fElapsedTime;

        if (this.newPx < 0)
            this.newPx = 0;
        if (this.newPx > currentMap.levelWidth - 1)
            this.newPx = currentMap.levelWidth - 1;
        if (this.newPy > currentMap.levelHeight)
            bGameOver = true;

        this.bEnteredWallJumpState = false;
        this.bOnWall = false;
        this.TileCollision();
        if (!this.bOnWall)
            this.bCanWallJump = false;

        this.px = this.newPx;
        this.py = this.newPy;
    }
}
function init() {
    Game.onUserCreate = function () {
        currentState = STATE.PLAY;
        currentTile = TILE.GROUND;
        bRising = true;
        bSubMenu = false;
        bGameOver = false;

        let sLevel = "";
        sLevel += "....###.........................................................";
        sLevel += "....###.........................................................";
        sLevel += "....###.........................................................";
        sLevel += "....###...............X##X....####.....#########................";
        sLevel += "....###.........................................................";
        sLevel += "....###..........#.........##............XXX....................";
        sLevel += "....ooo..........#.......................XXX.....###............";
        sLevel += "....ooP...#...H..#....#############.............................";
        sLevel += "#######.o.#......#......................................####....";
        sLevel += "........o..######.......................#####...................";
        sLevel += "..XXXX..o......####.....########...................##...........";
        sLevel += "..oooo..o......................####.............................";
        sLevel += "..oooo..o.....................#.................................";
        sLevel += "#############..#####.##########..###############################";
        sLevel += "#############..#####oooooooooooo################################";
        sLevel += "#############..#################################################";
        maps.push(new TileMap("level1", sLevel, 64, 16, 'w', 4, 4, 1.8));
        sLevel = "";
        sLevel += "........#######......######....................................#";
        sLevel += "........#######......######....................................#";
        sLevel += "........#######.......................................#####....#";
        sLevel += "........#######..................######........................#";
        sLevel += "........#######......######....................................#";
        sLevel += "........#######......######...................#######........###";
        sLevel += "........#######......######.............................##.....#";
        sLevel += "........#######......######....##..............................#";
        sLevel += "...P...........................................................#";
        sLevel += "#####..................................#########################";
        sLevel += "#####.E.........................################################";
        sLevel += "###############......###########################################";
        sLevel += "###############......###########################################";
        sLevel += "###############......###########################################";
        sLevel += "###############......###########################################";
        sLevel += "###############......###########################################";
        sLevel += "###############......###########################################";
        sLevel += "###############......###########################################";
        sLevel += "................................................................";
        sLevel += ".####....##.......................#######.....................##";
        sLevel += "................................................................";
        sLevel += "................................................................";
        sLevel += "######..##########............###############.........##########";
        sLevel += "######..........................................................";
        sLevel += "......................###.......................####............";
        sLevel += "................................#.....####......................";
        sLevel += "###############...........##....#.....####................##....";
        sLevel += "###############.................#.....########..............####";
        sLevel += "############........##..........#.....####..................####";
        sLevel += "#########...............................................####....";
        sLevel += "..........................######################........####....";
        sLevel += "#################..................................##...........";
        maps.push(new TileMap("level1", sLevel, 64, 32, 'w', 3, 10, 1.9));
        currentMapIndex = 0;
        setMap(currentMapIndex);
        nLiquidLevel = currentMap.minLiquidLevel;
        return true;
    }
    Game.update = function (fElapsedTime) {
        switch (currentState) {
            case STATE.PLAY:
                if (!bGameOver) {
                    //------TICK----------------------------------------
                    entities.forEach(function (v) {
                        v.update(fElapsedTime);
                    });
                    if (keyState[KEY.C].bPressed) {
                        currentState = STATE.CREATE;
                        viewport.x = player.px;
                        viewport.y = player.py;
                        entities.forEach(function (v) {
                            if (v.ID === ID.ENEMY) {
                                v.px = v.ox;
                                v.py = v.oy;
                                v.bAlive = true;
                            }
                        });
                    }
                    if (keyState[KEY.SHIFT].bReleased) {
                        currentMapIndex++;
                        if (currentMapIndex >= maps.length)
                            currentMapIndex = 0;
                        setMap(currentMapIndex);
                    }
                    if (currentMap.liquid != undefined) {
                        nLiquidLevel += (bRising ? -currentMap.nRisingSpeed : currentMap.nRisingSpeed) * (fElapsedTime > 1 ? 0.001 : fElapsedTime);
                        if (nLiquidLevel >= currentMap.minLiquidLevel)
                            bRising = true;
                        else if (nLiquidLevel <= currentMap.maxLiquidLevel)
                            bRising = false;
                    }

                    //------RENDER----------------------------------------
                    nTileSize = 32;
                    nVisibleTilesX = ScreenWidth() / nTileSize;
                    nVisibleTilesY = ScreenHeight() / nTileSize;
                    var cameraPosX = player.px;
                    var cameraPosY = player.py;
                    var fOffsetX = cameraPosX - nVisibleTilesX / 2;
                    var fOffsetY = cameraPosY - nVisibleTilesY / 2;
                    if (fOffsetX < 0)
                        fOffsetX = 0;
                    if (fOffsetY < 0)
                        fOffsetY = 0;
                    if (fOffsetX > currentMap.levelWidth - nVisibleTilesX)
                        fOffsetX = currentMap.levelWidth - nVisibleTilesX;
                    if (fOffsetY > currentMap.levelHeight - nVisibleTilesY)
                        fOffsetY = currentMap.levelHeight - nVisibleTilesY;
                    var fTileOffsetX = (fOffsetX - Math.floor(fOffsetX)) * nTileSize;
                    var fTileOffsetY = (fOffsetY - Math.floor(fOffsetY)) * nTileSize;

                    //Draw Map
                    for (var x = -1; x < nVisibleTilesX + 1; x++)
                        for (var y = -1; y < nVisibleTilesY + 1; y++)
                            switch (GetTile(x + fOffsetX, y + fOffsetY)) {
                                case '.':
                                    FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#4FF');
                                    break;
                                case '#':
                                    FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#0C0');
                                    break;
                                case '^':
                                    FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#900');
                                    break;
                                case 'X':
                                    FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#999');
                                    DrawLine(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY,
                                        x * nTileSize - fTileOffsetX + nTileSize, y * nTileSize - fTileOffsetY + nTileSize, "#FFF");
                                    DrawLine(x * nTileSize - fTileOffsetX + nTileSize, y * nTileSize - fTileOffsetY,
                                        x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY + nTileSize, "#FFF");
                                    break;
                                case 'o':
                                    FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#4FF');
                                    FillCircle((x * nTileSize - fTileOffsetX) + nTileSize / 2,
                                        (y * nTileSize - fTileOffsetY) + nTileSize / 2, nTileSize / 3, "#FF0");
                                    break;
                                default:
                                    FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#000');
                            }
                    entities.forEach(function (v) {
                        if (v.ID === ID.PLAYER)
                            FillRect((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                                nTileSize, nTileSize, "#F00");
                        else if (v.ID === ID.ENEMY && v.bAlive) {
                            FillRect((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                                nTileSize, nTileSize, "#333");
                            if (v.bJump) {
                                DrawRect((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                                    nTileSize, nTileSize, "#F00", 2);
                                DrawLine((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                                    (v.px - fOffsetX) * nTileSize + nTileSize, (v.py - fOffsetY) * nTileSize + nTileSize, "#F00", 2);
                                DrawLine((v.px - fOffsetX) * nTileSize + nTileSize, (v.py - fOffsetY) * nTileSize,
                                    (v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize + nTileSize, "#F00", 2);
                            }
                        }
                    });
                    for (var x = -1; x < nVisibleTilesX + 1; x++)
                        DrawLine(x * nTileSize - fTileOffsetX, 0, x * nTileSize - fTileOffsetX, ScreenHeight(), "#FFF");
                    for (var y = -1; y < nVisibleTilesY + 1; y++)
                        DrawLine(0, y * nTileSize - fTileOffsetY, ScreenWidth(), y * nTileSize - fTileOffsetY, "#FFF");
                    if (currentMap.liquid != undefined)
                        FillRect(0, (nLiquidLevel - fOffsetY) * nTileSize, ScreenWidth(), currentMap.levelHeight * nTileSize,
                            currentMap.liquid === 'w' ? "rgba(0,200,250,0.5)" : "rgba(250,100,0,0.9)");
                    FillText(20, 30, "Score: " + player.nScore, "#FFF");
                } else {
                    if (keyState[KEY.R].bHeld) {
                        bGameOver = false;
                        player.nScore = 0;
                        entities.forEach(function (v) {
                            v.px = v.ox;
                            v.py = v.oy;
                            v.vx = 0;
                            v.vy = 0;
                            if (v.ID === ID.ENEMY) {
                                v.bAlive = true;
                                v.groundTileY = v.spawnGroundY;
                            }
                        });
                        nLiquidLevel = currentMap.minLiquidLevel;
                    }
                    FillText(ScreenWidth() / 2 - 180, ScreenHeight() / 2, "Press 'R' to Restart", "#FFF", 45);
                }
                break;
            case STATE.CREATE:
                //------TICK----------------------------------------
                var cameraPosX = viewport.x;
                var cameraPosY = viewport.y;
                var fOffsetX = cameraPosX - nVisibleTilesX / 2;
                var fOffsetY = cameraPosY - nVisibleTilesY / 2;
                let circle = null;
                nTileSize = 26;
                nVisibleTilesX = ScreenWidth() / nTileSize;
                nVisibleTilesY = ScreenHeight() / nTileSize;
                if (fOffsetX < 0)
                    fOffsetX = 0;
                if (fOffsetY < 0)
                    fOffsetY = 0;
                if (fOffsetX > currentMap.levelWidth - nVisibleTilesX)
                    fOffsetX = currentMap.levelWidth - nVisibleTilesX;
                if (fOffsetY > currentMap.levelHeight - nVisibleTilesY)
                    fOffsetY = currentMap.levelHeight - nVisibleTilesY;

                //Input
                if (keyState[KEY.LEFT].bHeld)
                    viewport.x -= 20 * fElapsedTime;
                if (keyState[KEY.RIGHT].bHeld)
                    viewport.x += 20 * fElapsedTime;
                if (keyState[KEY.UP].bHeld)
                    viewport.y -= 20 * fElapsedTime;
                if (keyState[KEY.DOWN].bHeld)
                    viewport.y += 20 * fElapsedTime;
                if (keyState[KEY.C].bPressed) {
                    currentState = STATE.PLAY;
                    nLiquidLevel = currentMap.minLiquidLevel;
                }
                if (keyState[KEY.S].bPressed)
                    currentMap.liquid = (currentMap.liquid === 'l') ? 'w' : 'l';

                if (keyState[KEY.K1].bPressed)
                    currentTile = TILE.GROUND;
                if (keyState[KEY.K2].bPressed)
                    currentTile = TILE.SPRING;
                if (keyState[KEY.K3].bPressed)
                    currentTile = TILE.COIN;
                if (keyState[KEY.K4].bPressed)
                    currentTile = TILE.AIR;
                if (keyState[KEY.K5].bPressed)
                    currentTile = TILE.ENEMY;
                if (keyState[KEY.K6].bPressed)
                    currentTile = TILE.ENEMY_JUMP;
                if (keyState[KEY.K7].bPressed)
                    currentTile = TILE.X;

                let onCircle = false;
                if (mouseState.bHeld) {
                    for (var i = 0; i < 2; i++) {
                        if (i == 0) {
                            let screenLiquidLevel = (currentMap.maxLiquidLevel - fOffsetY) * nTileSize;
                            let d = (GetMouseX() - ScreenWidth() / 2) * (GetMouseX() - ScreenWidth() / 2) +
                                ((GetMouseY() - screenLiquidLevel) * (GetMouseY() - screenLiquidLevel));
                            if (d <= 12 * 12) {
                                currentMap.maxLiquidLevel = GetMouseY() / nTileSize + fOffsetY;
                                if (currentMap.maxLiquidLevel >= currentMap.minLiquidLevel) {
                                    currentMap.maxLiquidLevel = currentMap.minLiquidLevel;
                                }
                                onCircle = true;
                                circle = 0;
                                break;
                            }
                        } else {
                            let screenLiquidLevel = (currentMap.minLiquidLevel - fOffsetY) * nTileSize;
                            let d = (GetMouseX() - ScreenWidth() / 2) * (GetMouseX() - ScreenWidth() / 2) +
                                ((GetMouseY() - screenLiquidLevel) * (GetMouseY() - screenLiquidLevel));
                            if (d <= 12 * 12) {
                                currentMap.minLiquidLevel = GetMouseY() / nTileSize + fOffsetY;
                                if (currentMap.minLiquidLevel <= currentMap.maxLiquidLevel) {
                                    currentMap.minLiquidLevel = currentMap.maxLiquidLevel;
                                }
                                onCircle = true;
                                circle = 1;
                                break;
                            }
                        }
                    }
                    if (!onCircle) {
                        var x = Math.floor(GetMouseX() / nTileSize + fOffsetX);
                        var y = Math.floor(GetMouseY() / nTileSize + fOffsetY);
                        switch (currentTile) {
                            case '#':
                            case 'X':
                            case '^':
                            case '.':
                            case 'o':
                                entities.forEach(function (v, i) {
                                    if (v.ox === x && v.oy === y)
                                        entities.splice(i, 1);
                                });
                                SetTile(x, y, currentTile);
                                break;
                            case 'E':
                                entities.forEach(function (v, i) {
                                    if (v.ox === x && v.oy === y)
                                        entities.splice(i, 1);
                                });
                                if (GetTile(x, y) != 'o')
                                    SetTile(x, y, '.');
                                entities.push(new Enemy(x, y, 4, false));
                                break;
                            case 'H':
                                entities.forEach(function (v, i) {
                                    if (v.ox === x && v.oy === y)
                                        entities.splice(i, 1);
                                });
                                if (GetTile(x, y) != 'o')
                                    SetTile(x, y, '.');
                                entities.push(new Enemy(x, y, 4, true));
                                break;
                        }
                    }
                }
                //------RENDER----------------------------------------
                var fTileOffsetX = (fOffsetX - Math.floor(fOffsetX)) * nTileSize;
                var fTileOffsetY = (fOffsetY - Math.floor(fOffsetY)) * nTileSize;
                //Draw Map
                for (var x = -1; x < nVisibleTilesX + 1; x++)
                    for (var y = -1; y < nVisibleTilesY + 1; y++)
                        switch (GetTile(x + fOffsetX, y + fOffsetY)) {
                            case '.':
                                FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#4FF');
                                break;
                            case '#':
                                FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#0C0');
                                break;
                            case '^':
                                FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#900');
                                break;
                            case 'X':
                                FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#999');
                                DrawLine(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY,
                                    x * nTileSize - fTileOffsetX + nTileSize, y * nTileSize - fTileOffsetY + nTileSize, "#FFF");
                                DrawLine(x * nTileSize - fTileOffsetX + nTileSize, y * nTileSize - fTileOffsetY,
                                    x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY + nTileSize, "#FFF");
                                break;
                            case 'o':
                                FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#4FF');
                                FillCircle((x * nTileSize - fTileOffsetX) + nTileSize / 2,
                                    (y * nTileSize - fTileOffsetY) + nTileSize / 2, nTileSize / 3, "#FF0");
                                break;
                            default:
                                FillRect(x * nTileSize - fTileOffsetX, y * nTileSize - fTileOffsetY, nTileSize, nTileSize, '#000');
                        }
                entities.forEach(function (v) {
                    if (v.ID === ID.PLAYER)
                        FillRect((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                            nTileSize, nTileSize, "#F00");
                    else {
                        FillRect((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                            nTileSize, nTileSize, "#333");
                        if (v.bJump) {
                            DrawRect((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                                nTileSize, nTileSize, "#F00", 2);
                            DrawLine((v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize,
                                (v.px - fOffsetX) * nTileSize + nTileSize, (v.py - fOffsetY) * nTileSize + nTileSize, "#F00", 2);
                            DrawLine((v.px - fOffsetX) * nTileSize + nTileSize, (v.py - fOffsetY) * nTileSize,
                                (v.px - fOffsetX) * nTileSize, (v.py - fOffsetY) * nTileSize + nTileSize, "#F00", 2);
                        }
                    }
                });
                for (var x = -1; x < nVisibleTilesX + 1; x++)
                    DrawLine(x * nTileSize - fTileOffsetX, 0, x * nTileSize - fTileOffsetX, ScreenHeight(), "#FFF");
                for (var y = -1; y < nVisibleTilesY + 1; y++)
                    DrawLine(0, y * nTileSize - fTileOffsetY, ScreenWidth(), y * nTileSize - fTileOffsetY, "#FFF");
                if (currentMap.liquid != undefined) {
                    FillRect(0, (currentMap.maxLiquidLevel - fOffsetY) * nTileSize, ScreenWidth(), currentMap.levelHeight * nTileSize,
                        currentMap.liquid === 'w' ? "rgba(0,200,250,0.5)" : "rgba(250,100,0,0.9)");
                    DrawLine(0, (currentMap.maxLiquidLevel - fOffsetY) * nTileSize,
                        ScreenWidth(), (currentMap.maxLiquidLevel - fOffsetY) * nTileSize, "#FC0", 3);
                    FillCircle(ScreenWidth() / 2, (currentMap.maxLiquidLevel - fOffsetY) * nTileSize, 10, "#FC0");

                    FillRect(0, (currentMap.minLiquidLevel - fOffsetY) * nTileSize, ScreenWidth(), currentMap.levelHeight * nTileSize,
                        currentMap.liquid === 'w' ? "rgba(0,200,250,0.7)" : "rgba(250,100,0,0.9)");
                    DrawLine(0, (currentMap.minLiquidLevel - fOffsetY) * nTileSize,
                        ScreenWidth(), (currentMap.minLiquidLevel - fOffsetY) * nTileSize, "#FC0", 3);
                    FillCircle(ScreenWidth() / 2, (currentMap.minLiquidLevel - fOffsetY) * nTileSize, 10, "#FC0");
                    if (onCircle)
                        DrawCircle(ScreenWidth() / 2, ((circle === 0 ?
                            currentMap.maxLiquidLevel : currentMap.minLiquidLevel) - fOffsetY) * nTileSize, 10, "#F30", 3);
                }
                //Draw SubMenu
                let d = 40;
                let mTileS = 26;
                FillRect(0, 0, ScreenWidth(), 40, "rgba(255,255,255,0.5)");
                FillText(d * 1, 25, "1: ", "#FFF", 27);
                FillRect(d * 2 - 11, 6, mTileS, mTileS, "#0C0");
                FillText(d * 3, 25, "2: ", "#FFF", 27);
                FillRect(d * 4 - 11, 6, mTileS, mTileS, "#900");
                FillText(d * 5, 25, "3: ", "#FFF", 27);
                FillCircle((d * 6 - 11) + mTileS / 2, 6 + mTileS / 2, mTileS / 2.5, "#FF0");
                FillText(d * 7, 25, "4: ", "#FFF", 27);
                FillRect(d * 8 - 11, 6, mTileS, mTileS, "#4FF");
                //'E'
                FillText(d * 9, 25, "5: ", "#FFF", 27);
                FillRect(d * 10 - 11, 6, mTileS, mTileS, "#333");
                //'H'
                FillText(d * 11, 25, "6: ", "#FFF", 27);
                FillRect(d * 12 - 11, 6, mTileS, mTileS, "#333");
                DrawRect(d * 12 - 11, 6, mTileS, mTileS, "#F00");
                DrawLine(d * 12 - 11, 6, d * 12 - 11 + mTileS, 6 + mTileS, "#F00");
                DrawLine(d * 12 - 11 + mTileS, 6, d * 12 - 11, 6 + mTileS, "#F00");
                //'X'
                FillText(d * 13, 25, "7: ", "#FFF", 27);
                FillRect(d * 14 - 11, 6, mTileS, mTileS, "#999");
                DrawLine(d * 14 - 11, 6, d * 14 - 11 + mTileS, 6 + mTileS, "#FFF");
                DrawLine(d * 14 - 11 + mTileS, 6, d * 14 - 11, 6 + mTileS, "#FFF");
                switch (currentTile) {
                    case TILE.GROUND:
                        DrawRect(d * 2 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                    case TILE.SPRING:
                        DrawRect(d * 4 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                    case TILE.COIN:
                        DrawRect(d * 6 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                    case TILE.AIR:
                        DrawRect(d * 8 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                    case TILE.ENEMY:
                        DrawRect(d * 10 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                    case TILE.ENEMY_JUMP:
                        DrawRect(d * 12 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                    case TILE.X:
                        DrawRect(d * 14 - 15, 3, mTileS + 7, mTileS + 7, "#444", 4);
                        break;
                }
                break;
            case STATE.MENU:
                break;
        }
        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);
