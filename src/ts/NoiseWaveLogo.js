var NoiseWaveLogo = (function () {
    function NoiseWaveLogo(renderer) {
        this.timer = 0.0;
        this.timer_camera = 0.0;
        this.UPDATE = true;
        this.cameraRotateRad = 2;
        this.map = [];
        this.originalVertex = [];
        this.velocity = 1.0;
        this.acceleration = 1.0;
        this.isCameraUpdate = false;
        this.cameraFov = 75;
        this.textureCounter = 0;
        this.randomNoiseSeed = 0.0;
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
    NoiseWaveLogo.prototype.remove = function () {
        while (this.scene.children.length != 0) {
            this.scene.remove(this.scene.children[0]);
            if (this.scene.children[0] == THREE.Mesh) {
                this.scene.children[0].geometry.dispose();
                this.scene.children[0].material.dispose();
            }
        }
        ;
    };
    NoiseWaveLogo.prototype.createScene = function () {
        this.randomNoiseSeed = Math.random() * 0.4 - 0.02;
        this.simplex = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        var textureLoader = new THREE.TextureLoader();
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, -500, 3000);
        var ambient = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambient);
        var light = new THREE.SpotLight(0xffffff);
        light.position.set(0, 1000, 0);
        light.castShadow = true;
        light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 400, 20000));
        light.shadow.bias = -0.00022;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        var light02 = new THREE.SpotLight(0xffffff, 0.4);
        light02.position.set(0, 10, 0);
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.name = 'Dir. Light';
        dirLight.position.set(0, 100, 0);
        this.scene.add(dirLight);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = this.cameraRotateRad;
        this.map.push(textureLoader.load("texture/logo.jpg"));
        this.map.push(textureLoader.load("texture/doge.jpg"));
        var size = 6.0;
        var mesh = 60;
        this.geometry = new THREE.PlaneGeometry(size, 0.6576 * size, mesh, mesh);
        var planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.map[0],
            side: THREE.DoubleSide
        });
        this.image = new THREE.Mesh(this.geometry, planeMaterial);
        this.scene.add(this.image);
        console.log(this.geometry);
        var array = this.geometry.vertices;
        for (var i = 0; i < array.length; i++) {
            var vertex = new THREE.Vector3(array[i].x, array[i].y, array[i].z);
            this.originalVertex[i] = vertex;
        }
    };
    NoiseWaveLogo.prototype.keyDown = function (e) {
        if (e.key == 't') {
            this.textureCounter++;
            if (this.textureCounter >= this.map.length) {
                this.textureCounter = 0;
            }
            this.image.material.map = this.map[this.textureCounter];
            this.image.material.needsUpdate = true;
        }
        if (e.key == "r") {
            this.timer_camera = 0;
            this.isCameraUpdate = 0;
            this.image.rotation.set(0, 0, 0);
            console.log("down");
            var array = this.geometry.vertices;
            for (var i = 0; i < array.length; i++) {
                array[i].x = this.originalVertex[i].x;
                array[i].y = this.originalVertex[i].y;
                array[i].z = this.originalVertex[i].z;
            }
            this.geometry.verticesNeedUpdate = true;
            this.geometry.normalsNeedUpdate = true;
            this.randomNoiseSeed = Math.random() * 0.9 - 0.3;
            console.log(this.randomNoiseSeed);
            if (Math.random() < 0.5) {
                this.velocity = -1;
            }
            else {
                this.velocity = 1.0;
            }
        }
        if (e.key == 'c') {
            this.isCameraUpdate = !this.isCameraUpdate;
        }
        if (e.key == "v") {
            this.velocity *= -1;
        }
        if (e.key == 'd') {
            var pre = this.camera.fov;
            while (Math.abs(pre - this.cameraFov) < 60) {
                this.cameraFov = 75 + Math.random() * 150 - 75;
            }
        }
        if (e.key == "a") {
            if (this.acceleration == 1.0) {
                this.acceleration = 4.0;
            }
            else {
                this.acceleration = 1.0;
            }
        }
    };
    NoiseWaveLogo.prototype.onWindowResize = function () {
    };
    NoiseWaveLogo.prototype.endEnabled = function () {
        this.UPDATE = false;
    };
    NoiseWaveLogo.prototype.snoiseVec3 = function (x) {
        var s = this.simplex.noise3D(x.x, x.y, x.z);
        var s1 = this.simplex.noise3D(x.y - 19.1, x.z + 33.4, x.x + 47.2);
        var s2 = this.simplex.noise3D(x.z + 74.2, x.x - 124.5, x.y + 99.4);
        var c = new THREE.Vector3(s, s1, s2);
        return c;
    };
    NoiseWaveLogo.prototype.curlNoise = function (p, time) {
        var e = 0.1 + this.randomNoiseSeed;
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
    NoiseWaveLogo.prototype.update = function () {
        this.renderer.setClearColor(0xffffff, 0.0);
        var array = this.geometry.vertices;
        var date = new Date();
        this.timer += Math.abs(this.simplex.noise3D(date.getMilliseconds() * 0.1, date.getMinutes() * 0.05, date.getHours() * 0.01)) * 2.0;
        var time = Math.abs(Math.sin(this.timer));
        for (var i = 0; i < array.length; i++) {
            var scale = this.randomNoiseSeed;
            var seed = new THREE.Vector3(array[i].x * scale, array[i].y * scale, array[i].z * scale, time);
            var noiseVec = this.curlNoise(seed);
            array[i].x += Math.cos(noiseVec.x) * 0.01 * time * this.velocity * this.acceleration;
            array[i].y += Math.sin(noiseVec.y) * 0.01 * time * this.velocity * this.acceleration;
            array[i].z += Math.sin(noiseVec.z) * 0.01 * time * this.velocity * this.acceleration;
        }
        this.geometry.verticesNeedUpdate = true;
        this.geometry.normalsNeedUpdate = true;
        this.camera.fov += (this.cameraFov - this.camera.fov) * 0.1;
        this.camera.updateProjectionMatrix();
        if (this.isCameraUpdate) {
            this.image.rotateY(0.01);
            this.timer_camera += 0.01;
            this.image.rotateX(0.01 * Math.sin(this.timer_camera));
            this.camera.position.z = this.cameraRotateRad + 1 * Math.sin(this.timer_camera);
        }
    };
    return NoiseWaveLogo;
}());
//# sourceMappingURL=NoiseWaveLogo.js.map