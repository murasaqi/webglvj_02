var TetShadowTest = (function () {
    function TetShadowTest(renderer) {
        this.timer = 0;
        this.objs = [];
        this.rotations = [];
        this.objs = [];
        this.rotations = [];
        this.tetValues = [];
        this.renderer = renderer;
        this.createScene();
    }
    TetShadowTest.prototype.createLight = function (color) {
        var pointLight = new THREE.PointLight(color, 1, 30);
        pointLight.castShadow = true;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 200;
        pointLight.shadow.bias = 0.1;
        var geometry = new THREE.SphereGeometry(0.3, 12, 6);
        var material = new THREE.MeshBasicMaterial({ color: color });
        var sphere = new THREE.Mesh(geometry, material);
        pointLight.add(sphere);
        return pointLight;
    };
    TetShadowTest.prototype.createScene = function () {
        this.time = 0.0;
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.003);
        this.renderer.setClearColor(this.scene.fog.color);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 100;
        this.camera.position.y = 20;
        var spotLight = new THREE.SpotLight(0xffffff, 0.3);
        spotLight.name = 'Spot Light';
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.3;
        spotLight.position.set(0, 200, 0);
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 8;
        spotLight.shadow.camera.far = 100;
        spotLight.shadow.mapSize.width = 1024 * 2;
        spotLight.shadow.mapSize.height = 1024 * 2;
        this.scene.add(spotLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.name = 'Dir. Light';
        dirLight.position.set(0, 10, 0);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;
        dirLight.shadow.camera.right = 15;
        dirLight.shadow.camera.left = -15;
        dirLight.shadow.camera.top = 15;
        dirLight.shadow.camera.bottom = -15;
        dirLight.shadow.mapSize.width = 1024 * 2;
        dirLight.shadow.mapSize.height = 1024 * 2;
        this.scene.add(dirLight);
        var geometry = new THREE.TorusKnotGeometry(14, 1, 150, 20);
        var material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            shininess: 100,
            specular: 0xeaeaea
        });
        this.torusKnot = new THREE.Mesh(geometry, material);
        this.torusKnot.position.set(0, 5, 0);
        this.torusKnot.castShadow = true;
        this.torusKnot.receiveShadow = true;
        this.planeGeo = new THREE.PlaneGeometry(1500, 1500, 300, 300);
        var material = new THREE.MeshPhongMaterial({
            color: 0xa0adaf,
            shading: THREE.SmoothShading
        });
        var mesh = new THREE.Mesh(this.planeGeo, material);
        mesh.rotateX(-Math.PI / 2);
        mesh.position.y = -10;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.group = new THREE.Group();
        var radian = 0.0;
        var _radius = 30;
        var radius = 60;
        for (var i = 0; i < 70; i++) {
            var tetGeometry = new THREE.CylinderGeometry(0, 4 + 1 * Math.random() - 0.5, 4 + 1 * Math.random() - 0.5, 4, 1);
            var tetMaterial = new THREE.MeshLambertMaterial({
                color: 0x292929,
                shading: THREE.FlatShading
            });
            var tetMesh = new THREE.Mesh(tetGeometry, tetMaterial);
            radian += 0.1 + Math.random() * 0.1;
            var x = Math.cos(radian) * radius;
            var z = Math.sin(radian) * radius;
            var y = Math.sin(Math.random() * Math.PI * 2) * 2;
            tetMesh.position.set(x, y, z);
            var r = new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            this.rotations.push(r);
            tetMesh.rotation.set(r.x, r.y, r.z);
            tetMesh.castShadow = true;
            this.objs.push(tetMesh);
            this.group.add(tetMesh);
            this.tetValues.push({
                radian: radian,
                radius: radius,
                pos: tetMesh.position
            });
        }
        this.scene.add(this.group);
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    TetShadowTest.prototype.update = function () {
        var rad = 100;
        var time = performance.now() * 0.001;
        for (var i = 0; i < this.rotations.length; i++) {
            this.rotations[i].x += 0.003;
            this.rotations[i].y += 0.003;
            this.rotations[i].z += 0.003;
            this.objs[i].rotation.set(this.rotations[i].x, this.rotations[i].y, this.rotations[i].z);
            this.tetValues[i].radian += 0.002;
            var radisu = this.tetValues[i].radius;
            var x = Math.cos(this.tetValues[i].radian) * radisu;
            var z = Math.sin(this.tetValues[i].radian) * radisu;
            var y = Math.sin(Math.random() * Math.PI * 2) * 10;
            this.objs[i].position.x = x;
            this.objs[i].position.z = z;
            var noise = this.noise.noise3D(this.objs[i].position.x * 0.04, this.objs[i].position.y * 0.04, this.time * 0.04 + this.objs[i].position.z * 0.04);
            this.objs[i].position.y = noise * 4;
        }
        this.renderer.setClearColor(this.scene.fog.color);
        this.time += 0.003;
        for (var i = 0; i < this.planeGeo.vertices.length; i++) {
            var vert = this.planeGeo.vertices[i];
            var value = this.noise.noise3D(vert.x * 0.5, vert.y * 0.5, this.time);
            this.planeGeo.vertices[i].z = value * 2.0;
        }
        this.planeGeo.verticesNeedUpdate = true;
    };
    return TetShadowTest;
}());
//# sourceMappingURL=scene03.js.map