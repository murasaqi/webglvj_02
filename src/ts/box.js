var FloatingBox = (function () {
    function FloatingBox(renderer) {
        this.objs = [];
        this.timer = 0.0;
        this.objects = [];
        this.radius = 400;
        this.position_origin = [];
        this.animateVector = [];
        this.UPDATE = true;
        this.settings = {
            metalness: 0.1,
            roughness: 0.2,
            ambientIntensity: 0.1,
            aoMapIntensity: 1.0,
            envMapIntensity: 1.0,
            displacementScale: 2.436143,
            normalScale: 1.0
        };
        this.END = false;
        this.renderer = renderer;
        this.createScene();
    }
    FloatingBox.prototype.remove = function () {
        while (this.scene.children.length != 0) {
            this.scene.remove(this.scene.children[0]);
            if (this.scene.children[0] == THREE.Mesh) {
                this.scene.children[0].geometry.dispose();
                this.scene.children[0].material.dispose();
            }
        }
        ;
    };
    FloatingBox.prototype.createRenderer = function () {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.sortObjects = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        document.body.appendChild(this.renderer.domElement);
    };
    FloatingBox.prototype.createScene = function () {
        this.simplex = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        var textureLoader = new THREE.TextureLoader();
        var normalMap = textureLoader.load("texture/nomalmap.png");
        var displacementMap = textureLoader.load("texture/bumpmap.jpg");
        var cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            roughness: this.settings.roughness,
            metalness: this.settings.metalness,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(1, -1),
            displacementMap: displacementMap,
            displacementScale: this.settings.displacementScale,
            displacementBias: -0.428408
        });
        this.material = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            roughness: this.settings.roughness,
            metalness: this.settings.metalness,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(1, -1),
            displacementMap: displacementMap,
            displacementScale: this.settings.displacementScale,
            displacementBias: -0.428408
        });
        this.cube = new THREE.Mesh(this.geometry, cubeMaterial);
        this.scene.add(this.cube);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, -500, 2500);
        var ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);
        var light = new THREE.SpotLight(0xffffff);
        light.position.set(0, 1000, 0);
        light.castShadow = true;
        light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 400, 20000));
        light.shadow.bias = -0.00022;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        this.scene.add(light);
        var light02 = new THREE.SpotLight(0xffffff, 0.4);
        light02.position.set(0, 10, 0);
        this.scene.add(light02);
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.name = 'Dir. Light';
        dirLight.position.set(0, 100, 0);
        this.scene.add(dirLight);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 1000;
        this.cameraNextPos = new THREE.Vector3(Math.random() * 30 - 30, Math.random() * 30 - 30, Math.random() * 30 - 30 + 1000);
        this.cameraNextLookAt = new THREE.Vector3(Math.random() * 30 - 30, Math.random() * 30 - 30, Math.random() * 30 - 30);
        this.cameraLookAt = new THREE.Vector3(Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 40 - 40);
        var settings = {
            metalness: 0.1,
            roughness: 0.2,
            ambientIntensity: 0.1,
            aoMapIntensity: 1.0,
            envMapIntensity: 1.0,
            displacementScale: 2.436143,
            normalScale: 1.0
        };
        this.normalMap = textureLoader.load("texture/comp/tilenormalmap.png");
        this.map = textureLoader.load("texture/comp/tilemap.png");
        this.displacementMap = textureLoader.load("texture/comp/tilehightmap.jpg");
        var planeGeo = new THREE.PlaneGeometry(6000, 6000, 10, 10);
        var planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: settings.roughness,
            metalness: settings.metalness,
            normalMap: this.normalMap,
            normalScale: new THREE.Vector2(1, -1),
            displacementMap: this.displacementMap,
            displacementScale: settings.displacementScale,
            displacementBias: -0.428408,
            map: this.map,
            side: THREE.DoubleSide
        });
        var planeWireMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            wireframe: true
        });
        planeGeo.rotateX(-Math.PI / 2);
        var obj = new THREE.Mesh(planeGeo, planeMaterial);
        obj.position.y = -600;
        obj.position.z = 1000;
        obj.castShadow = true;
        obj.receiveShadow = true;
        this.scene.add(obj);
        var geometry = new THREE.BoxGeometry(40, 40, 40);
        var material = new THREE.MeshPhongMaterial({
            color: 0x111111,
            specular: 0x555555,
            shininess: 10,
            shading: THREE.FlatShading
        });
        for (var i = 0; i < 700; i++) {
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.random() * Math.PI * 2;
            var object = new THREE.Mesh(geometry, this.material);
            object.position.x = Math.sin(theta) * Math.cos(phi) * this.radius;
            object.position.y = Math.cos(theta) * this.radius;
            object.position.z = Math.sin(theta) * Math.sin(phi) * this.radius;
            this.position_origin.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
            vec = new THREE.Vector3(theta, phi, 0);
            this.animateVector.push(vec);
            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;
            object.castShadow = true;
            object.receiveShadow = true;
            this.scene.add(object);
            this.objects.push(object);
        }
        var points = [];
        for (var i = 0; i < 10; i++) {
            var randomx = -20 + Math.round(Math.random() * 200);
            var randomy = -15 + Math.round(Math.random() * 400);
            var randomz = -20 + Math.round(Math.random() * 400);
            points.push(new THREE.Vector3(randomx, randomy, randomz));
        }
        console.log(this.scene);
    };
    FloatingBox.prototype.onWindowResize = function () {
    };
    FloatingBox.prototype.getSpherePosition = function (radius) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.random() * Math.PI * 2;
        var x = radius * Math.sin(theta) * Math.cos(phi);
        var y = radius * Math.cos(theta);
        var z = radius * Math.sin(theta) * Math.sin(phi);
        return new THREE.Vector3(x, y, z);
    };
    FloatingBox.prototype.snoiseVec3 = function (x) {
        var s = this.simplex.noise3D(x.x, x.y, x.z);
        var s1 = this.simplex.noise3D(x.y - 19.1, x.z + 33.4, x.x + 47.2);
        var s2 = this.simplex.noise3D(x.z + 74.2, x.x - 124.5, x.y + 99.4);
        var c = new THREE.Vector3(s, s1, s2);
        return c;
    };
    FloatingBox.prototype.curlNoise = function (p) {
        var e = 0.1;
        var dx = new THREE.Vector3(e, 0.0, 0.0);
        var dy = new THREE.Vector3(0.0, e, 0.0);
        var dz = new THREE.Vector3(0.0, 0.0, e);
        var _p = new THREE.Vector3(p.x, p.y, p.z).sub(dx);
        var p_x0 = this.snoiseVec3(_p);
        _p = new THREE.Vector3(p.x, p.y, p.z).add(dx);
        var p_x1 = this.snoiseVec3(_p);
        _p = new THREE.Vector3(p.x, p.y, p.z).sub(dy);
        var p_y0 = this.snoiseVec3(_p);
        _p = new THREE.Vector3(p.x, p.y, p.z).add(dy);
        var p_y1 = this.snoiseVec3(_p);
        _p = new THREE.Vector3(p.x, p.y, p.z).sub(dz);
        var p_z0 = this.snoiseVec3(_p);
        _p = new THREE.Vector3(p.x, p.y, p.z).add(dz);
        var p_z1 = this.snoiseVec3(_p);
        var x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
        var y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
        var z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
        var divisor = 1.0 / (2.0 * e);
        var noisevec = new THREE.Vector3(x, y, z);
        noisevec.multiplyScalar(divisor);
        return noisevec;
    };
    FloatingBox.prototype.endEnabled = function () {
        this.UPDATE = false;
    };
    FloatingBox.prototype.update = function () {
        this.renderer.setClearColor(this.scene.fog.color);
        if (this.UPDATE == false) {
            this.remove();
            if (this.scene.children.length == 0) {
                this.END = true;
            }
        }
        var date = new Date();
        if (this.cameraNextPos.distanceTo(this.camera.position) < 0.01) {
            var dist = 800;
            this.cameraNextPos = new THREE.Vector3(Math.random() * dist - dist / 2, Math.random() * dist - dist / 2, Math.random() * 2000 - 1000);
            this.cameraNextLookAt = new THREE.Vector3(Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 40 - 40);
        }
        this.timer += 0.01;
        for (var i = 0; i < this.objects.length; i++) {
            var p = this.objects[i].position;
            var scale = 0.001;
            var vec = this.curlNoise(new THREE.Vector3(p.x * scale, p.y * scale, p.z * scale));
            this.objects[i].position.x += vec.x;
            this.objects[i].position.y += vec.y;
            this.objects[i].position.z += vec.z;
            var v = new THREE.Vector3(p.x, p.y, p.z);
            this.objects[i].position.add(v.normalize());
            var dist_1 = this.objects[i].position.distanceTo(new THREE.Vector3(0, 0, 0));
            var maxDist = 700;
            if (dist_1 <= maxDist) {
                this.objects[i].scale.set(1.0 - dist_1 / maxDist, 1.0 - dist_1 / maxDist, 1.0 - dist_1 / maxDist);
            }
            else {
                var newpos = this.getSpherePosition(10);
                newpos.x += Math.sin(this.timer * 5) * this.radius;
                newpos.y += Math.cos(this.timer * 3) * this.radius;
                newpos.z += Math.sin(this.timer * 7) * this.radius;
                this.objects[i].position.set(newpos.x, newpos.y, newpos.z);
            }
        }
        var speed = 0.008;
        this.camera.position.x += (this.cameraNextPos.x - this.camera.position.x) * speed;
        this.camera.position.y += (this.cameraNextPos.y - this.camera.position.y) * speed;
        this.camera.position.z += (this.cameraNextPos.z - this.camera.position.z) * speed;
        this.cameraLookAt.x += (this.cameraNextLookAt.x - this.cameraLookAt.x) * speed;
        this.cameraLookAt.y += (this.cameraNextLookAt.y - this.cameraLookAt.y) * speed;
        this.cameraLookAt.z += (this.cameraNextLookAt.z - this.cameraLookAt.z) * speed;
        var lookat = new THREE.Vector3(this.cameraLookAt.x * Math.sin(this.timer), this.cameraLookAt.y * Math.sin(this.timer), this.cameraLookAt.z * Math.sin(this.timer));
        this.camera.lookAt(lookat);
    };
    return FloatingBox;
}());
//# sourceMappingURL=box.js.map