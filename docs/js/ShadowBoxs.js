var ShadowBoxs = (function () {
    function ShadowBoxs(renderer) {
        this.timer = 0;
        this.objs = [];
        this.rotations = [];
        this.objs = [];
        this.rotations = [];
        this.tetValues = [];
        this.vec = [];
        this.rotate = [];
        this.limitDist = 60;
        this.isSlowDown = false;
        this.speed = 0.0;
        this.renderer = renderer;
        this.createScene();
    }
    ShadowBoxs.prototype.createLight = function (color) {
        var pointLight = new THREE.PointLight(color, 1, 60);
        pointLight.castShadow = true;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 40;
        pointLight.shadow.bias = 0.001;
        var geometry = new THREE.SphereGeometry(0.3, 12, 6);
        var material = new THREE.MeshBasicMaterial({ color: color });
        var sphere = new THREE.Mesh(geometry, material);
        return pointLight;
    };
    ShadowBoxs.prototype.createScene = function () {
        this.time = 0.0;
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x9400ff, 0.003);
        this.renderer.setClearColor(this.scene.fog.color);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 10;
        this.camera.position.y = 10;
        this.pointLight01 = this.createLight(0xfaff6b);
        this.pointLight01.position.set(30, 30, 0);
        this.scene.add(this.pointLight01);
        this.pointLight02 = this.createLight(0x6bf0ff);
        this.pointLight02.position.set(-30, 30, 0);
        this.scene.add(this.pointLight02);
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.name = 'Dir. Light';
        dirLight.position.set(0, 100, 0);
        var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);
        this.planeGeo = new THREE.PlaneGeometry(1000, 1000, 2, 2);
        var material = new THREE.MeshPhongMaterial({
            color: 0xffffff
        });
        var receiveshadowmesh = new THREE.Mesh(this.planeGeo, material);
        receiveshadowmesh.rotateX(-Math.PI / 2);
        receiveshadowmesh.position.y = 0.1;
        receiveshadowmesh.receiveShadow = true;
        var clipping = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.planeGeo = new THREE.PlaneGeometry(1000, 1000, 300, 300);
        var planematerial = new THREE.MeshLambertMaterial({
            color: 0x9400ff,
            shininess: 10,
            specular: 0x9400ff,
            side: THREE.DoubleSide
        });
        var planemesh = new THREE.Mesh(this.planeGeo, planematerial);
        planemesh.rotateX(-Math.PI / 2);
        planemesh.position.set(0, 0.1, 0);
        planemesh.receiveShadow = true;
        this.scene.add(planemesh);
        var geometry = new THREE.PlaneGeometry(10, 10);
        var material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-Math.PI / 2);
        mesh.position.set(0, -20, 0);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        for (var i = 0; i < this.planeGeo.vertices.length; i++) {
            var dist = this.planeGeo.vertices[i].distanceTo(new THREE.Vector3(0, 0, 0));
        }
        this.group = new THREE.Group();
        var radian = 0.0;
        var _radius = 10;
        var radius = 60;
        for (var i = 0; i < 300; i++) {
            var tetGeometry = new THREE.SphereBufferGeometry(2, 20, 20);
            var tetMaterial = new THREE.MeshLambertMaterial({
                color: 0x9400ff,
                shading: THREE.FlatShading,
                transparent: true
            });
            var tetMesh = new THREE.Mesh(tetGeometry, tetMaterial);
            radian += 0.1 + Math.random() * 0.1;
            var vec3 = this.getSpherePosition(Math.random() * this.limitDist);
            var x = Math.random() * 100 - 50;
            var z = Math.random() * this.limitDist - 1;
            vec3.y;
            var y = Math.random() * 100 - 50;
            tetMesh.position.set(x, y, z);
            var r = new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            this.rotations.push(r);
            tetMesh.rotation.set(r.x, r.y, r.z);
            tetMesh.castShadow = true;
            this.vec.push(new THREE.Vector3(x, y, z).normalize());
            this.rotate.push(new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2));
            this.objs.push(tetMesh);
            this.group.add(tetMesh);
            this.tetValues.push({
                radian: radian,
                radius: radius,
                pos: tetMesh.position
            });
        }
        this.scene.add(this.group);
    };
    ShadowBoxs.prototype.getSpherePosition = function (radius) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.random() * Math.PI * 2;
        var x = radius * Math.sin(theta) * Math.cos(phi);
        var y = radius * Math.cos(theta);
        var z = radius * Math.sin(theta) * Math.sin(phi);
        return new THREE.Vector3(x, y, z);
    };
    ShadowBoxs.prototype.snoiseVec3 = function (x) {
        var s = this.noise.noise3D(x.x, x.y, x.z);
        var s1 = this.noise.noise3D(x.y - 19.1, x.z + 33.4, x.x + 47.2);
        var s2 = this.noise.noise3D(x.z + 74.2, x.x - 124.5, x.y + 99.4);
        var c = new THREE.Vector3(s, s1, s2);
        return c;
    };
    ShadowBoxs.prototype.curlNoise = function (p, time) {
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
    ShadowBoxs.prototype.keyDown = function (keycode) {
        if (keycode.key == "s") {
            console.log("stop");
            this.isSlowDown = true;
        }
    };
    ShadowBoxs.prototype.keyUp = function (e) {
        this.isSlowDown = false;
    };
    ShadowBoxs.prototype.update = function () {
        this.renderer.setClearColor(0x9400ff);
        var rad = 100;
        if (this.isSlowDown) {
            this.speed = 0.001;
        }
        else {
            this.speed = 0.02;
        }
        this.time += this.speed;
        var noiseSpeed = 10;
        for (var i_1 = 0; i_1 < this.objs.length; i_1++) {
            var pos = this.objs[i_1].position;
            var speed = 0.01;
            var vector = new THREE.Vector3(this.vec[i_1].x, this.vec[i_1].y, this.vec[i_1].z);
            pos.add(vector.normalize().multiplyScalar(this.speed));
            var noiseScale = 0.02;
            var noiseValueX = this.noise.noise3D(pos.x * noiseScale, pos.z * noiseScale, this.time + 0.1365143);
            var noiseValueY = this.noise.noise3D(pos.y * noiseScale, pos.x * noiseScale, this.time + 1.21688);
            var noiseValueZ = this.noise.noise3D(pos.z * noiseScale, pos.y * noiseScale, this.time + 2.5564);
            var noiseVec = new THREE.Vector3(noiseValueX, noiseValueY, noiseValueZ);
            noiseVec.y = 1.0;
            pos.add(noiseVec.multiplyScalar(this.speed * 10));
            var dist = pos.distanceTo(new THREE.Vector3(0, 0, 0));
            if (dist > this.limitDist) {
                var newpos = this.getSpherePosition(Math.random() * 6);
                var x = Math.random() * 90 - 45;
                var z = Math.random() * 90 - 45;
                var y = Math.random() * -1;
                pos.set(x, y, z);
                this.vec[i_1] = new THREE.Vector3(pos.x, pos.y, pos.z);
            }
            var scale = (1.0 - dist / this.limitDist) * 0.7;
            var c = Math.max(Math.floor((1.0 - dist / this.limitDist) * 255), 255);
            var g = Math.floor(c * 0.5);
            this.objs[i_1].scale.set(scale, scale, scale);
            this.objs[i_1].rotation.set(this.rotate[i_1].x * 2, this.rotate[i_1].y * 2, this.rotate[i_1].z * 2);
        }
        this.time += 0.003;
        for (var i = 0; i < this.planeGeo.vertices.length; i++) {
            var vert = this.planeGeo.vertices[i];
            var value = this.noise.noise3D(vert.x * 0.01, vert.y * 0.01, this.time * 0.1);
            var dist = this.planeGeo.vertices[i].distanceTo(new THREE.Vector3(0, 0, 0));
            var height = 0.9 - dist / 720;
            this.planeGeo.vertices[i].z = value * 20;
        }
        this.planeGeo.verticesNeedUpdate = true;
        var camX = Math.cos(this.time * 0.5) * 30;
        var camZ = Math.sin(this.time * 0.5) * 30;
        var camY = 60 + Math.sin(this.time * 0.8) * 30;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.position.set(camX, camY, camZ);
        this.pointLight02.position.z = Math.cos(this.time) * 10;
        this.pointLight02.position.x = Math.sin(this.time) * 10;
        this.pointLight01.position.z = Math.cos(this.time + Math.PI) * 10;
        this.pointLight01.position.x = Math.sin(this.time + Math.PI) * 10;
    };
    return ShadowBoxs;
}());
//# sourceMappingURL=ShadowBoxs.js.map