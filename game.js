function init() {
    Game.onUserCreate = function () {


        return true;
    }
    Game.onUserUpdate = function (fElapsedTime) {


        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);