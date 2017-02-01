var InstancingLines = (function () {
    function InstancingLines(renderer) {
        this.renderer = renderer;
        this.createScene();
        var width = 100;
        this.WIDTH = width;
        this.PARTICLES = width * width;
    }
    InstancingLines.prototype.createScene = function () {
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        var triangles = 1;
        var instances = 65000;
        var geometry = new THREE.InstancedBufferGeometry();
        geometry.maxInstancedCount = instances;
        var vertices = new THREE.BufferAttribute(new Float32Array(triangles * 3 * 3), 3);
        vertices.setXYZ(0, 0.025, -0.025, 0);
        vertices.setXYZ(1, -0.025, 0.025, 0);
        vertices.setXYZ(2, 0, 0, 0.025);
        geometry.addAttribute('position', vertices);
        var offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
        for (var i = 0, ul = offsets.count; i < ul; i++) {
            offsets.setXYZ(i, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        }
        geometry.addAttribute('offset', offsets);
        var colors = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = colors.count; i < ul; i++) {
            colors.setXYZW(i, Math.random(), Math.random(), Math.random(), Math.random());
        }
        geometry.addAttribute('color', colors);
        var vector = new THREE.Vector4();
        var orientationsStart = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = orientationsStart.count; i < ul; i++) {
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();
            orientationsStart.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
        geometry.addAttribute('orientationStart', orientationsStart);
        var orientationsEnd = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = orientationsEnd.count; i < ul; i++) {
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();
            orientationsEnd.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
        geometry.addAttribute('orientationEnd', orientationsEnd);
        var material = new THREE.RawShaderMaterial({
            uniforms: {
                time: { value: 1.0 },
                sineTime: { value: 1.0 }
            },
            vertexShader: document.getElementById('vertexShader_line').textContent,
            fragmentShader: document.getElementById('fragmentShader_line').textContent,
            side: THREE.DoubleSide,
            transparent: true
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.renderer.setClearColor(0x101010);
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    InstancingLines.prototype.click = function () {
    };
    InstancingLines.prototype.keyDown = function () {
    };
    InstancingLines.prototype.update = function () {
    };
    return InstancingLines;
}());
//# sourceMappingURL=instancingLines.js.map