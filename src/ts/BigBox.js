var SphereBufferGeometry = THREE.SphereBufferGeometry;
var LineBoxScene = (function () {
    function LineBoxScene(renderer) {
        this.UPDATE = true;
        this.END = false;
        this.Boxs = [];
        this.isPlay = false;
        this.phi = Math.random() * Math.PI * 2;
        this.theta = Math.random() * Math.PI * 2;
        this.butterflyPosition = new THREE.Vector3(0, 300, 0);
        this.butterfly = new THREE.Mesh();
        this.renderer = renderer;
        this.createScene();
    }
    LineBoxScene.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.timer = 0.0;
        this.scene.fog = new THREE.Fog(0x000000, -500, 3000);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 800;
        this.camera.position.y = 500;
        this.lookAt = new THREE.Vector3();
        this.lookAt.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.lookAt.z += -500;
        this.camera.lookAt(this.lookAt);
        this.xStep = 400;
        this.xNum = 4;
        this.zStep = 200;
        this.zNum = 13;
        for (var i = 0; i < 15; i++) {
            var x = this.getRandom(-7, 8) * 100 + 50;
            var y = 50;
            var z = this.getRandom(-14, 0) * 100 + 50 - 100;
            var pos = new THREE.Vector3(x, y, z);
            var box = new WierBox(this.scene, 100, 100, 100, pos, new THREE.Color(255, 255, 255));
            this.Boxs.push(box);
        }
        var size = 100000;
        var step = 100;
        var spehereWidth = 50;
        var gridHelper = new THREE.GridHelper(size, step);
        this.scene.add(gridHelper);
        this.scene.position.x = 50;
        var sphereGeo = new SphereBufferGeometry(spehereWidth, spehereWidth, 6, 6);
        var spheremat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        });
        this.butterfly = new THREE.Mesh(sphereGeo, spheremat);
        this.butterfly.position.set(-spehereWidth, this.butterflyPosition.y, this.butterflyPosition.z);
        this.scene.add(this.butterfly);
        var geometry = new THREE.BoxGeometry(100, 100, 100);
        var materials = [
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
            new THREE.MeshBasicMaterial({ color: 0x0000ff }),
            new THREE.MeshBasicMaterial({ color: 0x0000ff }),
            new THREE.MeshBasicMaterial({ color: 0xff0000 }),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        ];
        var material = new THREE.MeshFaceMaterial(materials);
        var _mesh = new THREE.Mesh(geometry, material);
        this.scene.add(_mesh);
    };
    LineBoxScene.prototype.update = function () {
        this.timer += 0.02;
        if (this.UPDATE == false) {
            this.remove();
            if (this.scene.children.length == 0) {
                this.END = true;
            }
        }
        for (var i = 0; i < this.Boxs.length; i++) {
            if (this.butterfly.position.z - this.Boxs[i].position.z <= -350) {
                this.Boxs[i].Obj.position.x = this.getRandom(-12, 11) * 100 + 50;
                this.Boxs[i].Obj.position.z -= 800 - this.getRandom(-1, -8) * 200;
                this.Boxs[i].updateHeadVertex(20 + 200 * Math.sin(Math.random() * Math.PI));
            }
        }
        if (this.isPlay) {
            this.camera.position.z -= 4;
            this.butterfly.position.z -= 4;
            this.lookAt.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
            this.lookAt.z += -500 + 50;
            this.camera.lookAt(this.lookAt);
            this.phi += 0.02;
            this.theta += 0.02;
            this.camera.position.x = Math.sin(this.phi) * 20;
            this.camera.position.y = 350 + Math.sin(this.theta) * Math.sin(this.theta / 2) * 20;
            this.camera.position.z += Math.cos(this.phi);
        }
    };
    LineBoxScene.prototype.initOrbitControls = function () {
    };
    LineBoxScene.prototype.click = function () {
        this.isPlay = !this.isPlay;
    };
    LineBoxScene.prototype.endEnabled = function () {
        this.UPDATE = false;
    };
    LineBoxScene.prototype.resize = function () {
    };
    LineBoxScene.prototype.remove = function () {
        while (this.scene.children.length != 0) {
            this.scene.remove(this.scene.children[0]);
            if (this.scene.children[0] == THREE.Mesh) {
                this.scene.children[0].geometry.dispose();
                this.scene.children[0].material.dispose();
            }
        }
        ;
    };
    LineBoxScene.prototype.getRandom = function (min, max) {
        var num = Math.floor((Math.random() * ((max + 1) - min)) + min);
        console.log(num);
        return num;
    };
    return LineBoxScene;
}());
//# sourceMappingURL=BigBox.js.map