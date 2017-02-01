var SceneTemplate = (function () {
    function SceneTemplate() {
        this.timer = 0;
        this.createScene();
    }
    SceneTemplate.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    };
    SceneTemplate.prototype.click = function () {
    };
    SceneTemplate.prototype.keyDown = function (e) {
    };
    SceneTemplate.prototype.keyUp = function (e) {
    };
    SceneTemplate.prototype.update = function () {
        this.timer += 0.1;
    };
    return SceneTemplate;
}());
//# sourceMappingURL=template.js.map