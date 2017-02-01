var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
var MatrxTest = (function () {
    function MatrxTest(renderer) {
        this.timer = 0;
        this.renderer = renderer;
        this.createScene();
    }
    MatrxTest.prototype.createLight = function (color) {
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
    MatrxTest.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.001);
        this.renderer.setClearColor({ color: 0xffffff });
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 1;
        var pointMatrixGeometry = new THREE.BufferGeometry();
        var _width = 6;
        var _height = 6;
        var _depth = 6;
        var particles = _width * _height * _depth;
        var planeGeo = new PlaneBufferGeometry(1500, 1500, 8, 8);
        var quat = new THREE.Quaternion();
        var axis = new THREE.Vector3(1, 0, 0).normalize();
        var angle = Math.PI / 2;
        quat.setFromAxisAngle(axis, angle);
        var pos = planeGeo.getAttribute("position");
        var originalPos = pos.array;
        console.log(pos);
        var depthCounter = 10;
        var positions = new Float32Array(originalPos.length * depthCounter);
        var colors = new Float32Array(particles * 3);
        var counter = 0;
        for (var i = 1; i <= depthCounter; i++) {
            for (var j = 0; j < originalPos.length; j += 3) {
                positions[counter++] = originalPos[j];
                positions[counter++] = originalPos[j + 1];
                positions[counter++] = originalPos[j + 2] + i * -120;
            }
        }
        pointMatrixGeometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
        pointMatrixGeometry.computeBoundingBox();
        var textureLoader = new THREE.TextureLoader();
        var mapCircle = textureLoader.load('texture/circle.png');
        var material = new THREE.PointsMaterial({
            size: 5,
            transparent: true,
            color: 0x000000,
            map: mapCircle
        });
        var points = new THREE.Points(pointMatrixGeometry, material);
        this.scene.add(points);
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    MatrxTest.prototype.getSpherePosition = function (radius) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.random() * Math.PI * 2;
        var x = radius * Math.sin(theta) * Math.cos(phi);
        var y = radius * Math.cos(theta);
        var z = radius * Math.sin(theta) * Math.sin(phi);
        return new THREE.Vector3(x, y, z);
    };
    MatrxTest.prototype.snoiseVec3 = function (x) {
        var s = this.noise.noise3D(x.x, x.y, x.z);
        var s1 = this.noise.noise3D(x.y - 19.1, x.z + 33.4, x.x + 47.2);
        var s2 = this.noise.noise3D(x.z + 74.2, x.x - 124.5, x.y + 99.4);
        var c = new THREE.Vector3(s, s1, s2);
        return c;
    };
    MatrxTest.prototype.curlNoise = function (p, time) {
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
    MatrxTest.prototype.keyDown = function (keycode) {
    };
    MatrxTest.prototype.keyUp = function (e) {
    };
    MatrxTest.prototype.update = function () {
        this.renderer.setClearColor(0xffffff);
    };
    return MatrxTest;
}());
//# sourceMappingURL=matrix_test.js.map