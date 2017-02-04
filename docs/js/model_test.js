var ModelTest = (function () {
    function ModelTest(renderer) {
        this.timer = 0;
        this.groups = [];
        this.time = 0;
        this.rad = 250;
        this.nextRad = 250;
        this.nextTime = 0.0;
        this.renderer = renderer;
        this.createScene();
    }
    ModelTest.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 450;
        this.camera.position.y = -30;
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
                this.model = object;
            }, onProgress, onError);
        });
    };
    ModelTest.prototype.click = function () {
    };
    ModelTest.prototype.keyDown = function (e) {
        if (e.key == "z") {
            if (this.nextRad == 500) {
                this.nextRad = 250;
            }
            else {
                this.nextRad = 500;
            }
        }
    };
    ModelTest.prototype.update = function () {
        if (Math.random() < 0.02 && (this.nextTime - this.time) < 0.01) {
            this.nextTime += Math.random() * Math.PI / 3 + Math.PI / 3;
        }
        this.rad += (this.nextRad - this.rad) * 0.04;
        this.time += (this.nextTime - this.time) * 0.02;
        this.time += 0.02;
        this.camera.position.x = Math.sin(this.time) * this.rad;
        this.camera.position.y = Math.sin(this.time * 0.3) * this.rad * 0.5;
        this.camera.position.z = Math.cos(this.time) * this.rad;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    };
    return ModelTest;
}());
//# sourceMappingURL=model_test.js.map