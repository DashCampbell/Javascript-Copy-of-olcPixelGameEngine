function init() {
    Game.onUserCreate = function () {
        // Modify

        return true;
    }
    Game.onUserUpdate = function (fElapsedTime) {
        // Modify

        return true;
    }
    // 800px width, 400px height
    if (Game.ConstructCanvas(800, 400))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);