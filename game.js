function init() {
    Game.onUserCreate = function () {


        return true;
    }
    Game.onUserUpdate = function (fElapsedTime) {

        FillText(20, 20, "Edit game.js file", 16);

        return true;
    }
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);