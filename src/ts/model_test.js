var ModelTest = (function () {
    function ModelTest(renderer) {
        this.timer = 0;
        this.groups = [];
        this.renderer = renderer;
        this.createScene();
    }
    ModelTest.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 250;
        this.camera.position.y = 150;
        var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);
        var dLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dLight.position.set(0, 100, 0);
        this.scene.add(dLight);
        var dLight02 = new THREE.DirectionalLight(0xffffff, 0.4);
        dLight02.position.set(0, 0, 100);
        this.scene.add(dLight02);
        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
        };
        var gridHelper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
        this.scene.add(gridHelper);
        var onError = function (xhr) { };
        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('obj/');
        var _scene = this.scene;
        mtlLoader.load('female_head.mtl', function (materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('obj/');
            objLoader.load('female_head.obj', function (object) {
                object.position.y = -95;
                console.log(object.children[0]);
                object.position.y = 30;
                object.children[0].material.shading = THREE.FlatShading;
                _scene.add(object);
            }, onProgress, onError);
        });
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    ModelTest.prototype.click = function () {
    };
    ModelTest.prototype.keyDown = function (keyCode) {
    };
    ModelTest.prototype.update = function () {
    };
    return ModelTest;
}());
//# sourceMappingURL=model_test.js.map