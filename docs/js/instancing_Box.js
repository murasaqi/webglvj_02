var InstancingLines = (function () {
    function InstancingLines(renderer) {
        this.renderer = renderer;
        this.createScene();
        var width = 100;
        this.WIDTH = width;
        this.PARTICLES = width * width;
    }
    InstancingLines.prototype.createScene = function () {
        this.time = new Float32Array(1);
        this.time[0] = 0.0;
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer.setClearColor(new THREE.Color(0x000000));
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        var instances = 65000;
        this.geometry = new THREE.InstancedBufferGeometry();
        this.geometry.maxInstancedCount = instances;
        var vertices = new THREE.BufferAttribute(new Float32Array(triangles * 3 * 3), 3);
        vertices.setXYZ(0, 0.025, -0.025, 0);
        vertices.setXYZ(1, -0.025, 0.025, 0);
        vertices.setXYZ(2, 0, 0, 0.025);
        this.geometry.addAttribute('position', vertices);
        var offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 2), 2, 1);
        for (var i = 0, ul = offsets.count; i < ul; i++) {
            offsets.setXYZ(i, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        }
        this.geometry.addAttribute('offset', offsets);
        var colors = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = colors.count; i < ul; i++) {
            colors.setXYZW(i, Math.random(), Math.random(), Math.random(), Math.random());
        }
        this.geometry.addAttribute('color', colors);
        var vector = new THREE.Vector4();
        var orientationsStart = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = orientationsStart.count; i < ul; i++) {
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();
            orientationsStart.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
        this.geometry.addAttribute('orientationStart', orientationsStart);
        var orientationsEnd = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = orientationsEnd.count; i < ul; i++) {
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();
            orientationsEnd.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
        this.geometry.addAttribute('orientationEnd', orientationsEnd);
        this.material = new THREE.RawShaderMaterial({
            uniforms: {
                time: { value: 1.0 },
                sineTime: { value: 1.0 }
            },
            vertexShader: document.getElementById('vertexShader_line').textContent,
            fragmentShader: document.getElementById('fragmentShader_line').textContent,
            side: THREE.DoubleSide,
            transparent: true
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    InstancingLines.prototype.click = function () {
    };
    InstancingLines.prototype.keyDown = function () {
    };
    InstancingLines.prototype.update = function () {
        var time = performance.now();
        var object = this.scene.children[0];
        object.rotation.y = time * 0.0005;
        object.material.uniforms.time.value = time * 0.005;
        object.material.uniforms.sineTime.value = Math.sin(object.material.uniforms.time.value * 0.05);
    };
    return InstancingLines;
}());
//# sourceMappingURL=instancing_Box.js.map