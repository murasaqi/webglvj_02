var TetTest = (function () {
    function TetTest(renderer) {
        this.timer = 0;
        this.objs = [];
        this.rotations = [];
        this.tetValues = [];
        this.renderer = renderer;
        this.createScene();
    }
    TetTest.prototype.createScene = function () {
        this.time = 0.0;
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xf98989, 0.002);
        this.renderer.setClearColor(this.scene.fog.color);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 100;
        this.camera.position.y = 20;
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-1, -1, -1);
        this.scene.add(light);
        var light = new THREE.SpotLight(0xf8ffc0, 1.0);
        light.position.set(0, 100, 0);
        this.scene.add(light);
        var light = new THREE.SpotLight(0xffffff, 1.0);
        light.position.set(0, 90, 0);
        this.scene.add(light);
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-1, -1, -1);
        this.scene.add(light);
        this.group = new THREE.Group();
        var radian = 0.0;
        var _radius = 150;
        var radius = 150;
        for (var i = 0; i < 50; i++) {
            var tetGeometry = new THREE.CylinderGeometry(0, 18 + 10 * Math.random() - 5, 27 + 10 * Math.random() - 5, 4, 1);
            var tetMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                shading: THREE.FlatShading
            });
            radius = _radius + Math.random() * 100 - 50;
            var tetMesh = new THREE.Mesh(tetGeometry, tetMaterial);
            radian += 0.1 + Math.random() * 0.1;
            var x = Math.cos(radian) * radius;
            var z = Math.sin(radian) * radius;
            var y = Math.sin(Math.random() * Math.PI * 2) * 10;
            tetMesh.position.set(x, y, z);
            var r = new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            this.rotations.push(r);
            tetMesh.rotation.set(r.x, r.y, r.z);
            this.objs.push(tetMesh);
            this.group.add(tetMesh);
            this.tetValues.push({
                radian: radian,
                radius: radius,
                pos: tetMesh.position
            });
        }
        this.group.rotateZ(0.6);
        this.group.rotateX(0.3);
        this.planeGeo = new THREE.PlaneGeometry(5000, 5000, 20, 20);
        var planeMat = new THREE.MeshPhongMaterial({
            color: 0xff5b32,
            shininess: 5,
            specular: 0xf8ffc0,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            transparent: true,
            blending: THREE["MultiplyBlending"]
        });
        var planeMesh = new THREE.Mesh(this.planeGeo, planeMat);
        this.scene.add(planeMesh);
        planeMesh.position.y = -40;
        planeMesh.rotateX(Math.PI / 2);
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    TetTest.prototype.update = function () {
        for (var i = 0; i < this.rotations.length; i++) {
            this.rotations[i].x += 0.001;
            this.rotations[i].y += 0.001;
            this.rotations[i].z += 0.001;
            this.objs[i].rotation.set(this.rotations[i].x, this.rotations[i].y, this.rotations[i].z);
            this.tetValues[i].radian += 0.001;
            var radisu = Math.sin(this.timer * 100) * 100 + this.tetValues[i].radius;
            var x = Math.cos(this.tetValues[i].radian) * radisu;
            var z = Math.sin(this.tetValues[i].radian) * radisu;
            this.objs[i].position.x = x;
            this.objs[i].position.z = z;
            var noise = this.noise.noise3D(this.objs[i].position.x * 0.01, this.objs[i].position.y * 0.01, this.time * 0.01 + this.objs[i].position.z * 0.01);
            this.objs[i].position.y = noise * 20;
        }
        this.time += 0.003;
        for (var i = 0; i < this.planeGeo.vertices.length; i++) {
            var vert = this.planeGeo.vertices[i];
            var value = this.noise.noise3D(vert.x * 0.5, vert.y * 0.5, this.time);
            this.planeGeo.vertices[i].z = value * 30.0;
        }
        this.planeGeo.verticesNeedUpdate = true;
    };
    return TetTest;
}());
//# sourceMappingURL=scene02.js.map