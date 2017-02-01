var NoiseLine = (function () {
    function NoiseLine(renderer) {
        this.timer = 0;
        this.indices_array = [];
        this.renderer = renderer;
        this.createScene();
    }
    NoiseLine.prototype.createScene = function () {
        this.time = 0.0;
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 100;
        this.camera.position.y = 20;
        this.renderer.setClearColor(new THREE.Color(0x000000));
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-1, -1, -1);
        this.scene.add(light);
        var amblight = new THREE.AmbientLight(0xffffff);
        this.scene.add(amblight);
        this.lineGeo = new THREE.BufferGeometry();
        var yStep = 11;
        var lineSize = 10;
        for (var y = 0; y < lineSize; y++) {
            var _y = 50 * Math.cos(Math.PI * 2 / lineSize * y - Math.PI);
            var geometry = new THREE.BufferGeometry();
            var size = 300;
            var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors,
                linewidth: 2 });
            this.positions = new Float32Array(size * 3);
            this.colors = new Float32Array(size * 3);
            var r = 50 * Math.sin(Math.PI / (lineSize - 1) * y);
            var count = 0;
            var timer = 0.0;
            var radiusRange = r / 15;
            for (var i = 0; i < size; i++) {
                timer += 0.01 + _y * 0.01;
                var noiseScale = 0.05;
                if (i != 0) {
                    r = 50 * Math.sin(Math.PI / (lineSize - 1) * y) + radiusRange * this.noise.noise3D(this.positions[(i - 1) * 3] * noiseScale, timer, this.positions[(i - 1) * 3] * noiseScale);
                }
                else {
                    r = 50 * Math.sin(Math.PI / (lineSize - 1) * y) + radiusRange * this.noise.noise3D(0, timer, 0);
                }
                var offsetRad = Math.PI * 2 / (size - 1) * i;
                var x = Math.cos(offsetRad) * r;
                var height = _y;
                var z = Math.sin(offsetRad) * r;
                this.positions[count * 3] = x;
                this.positions[count * 3 + 1] = height;
                this.positions[count * 3 + 2] = z;
                this.colors[count * 3] = 1.0;
                this.colors[count * 3 + 1] = 1.0;
                this.colors[count * 3 + 2] = 1.0;
                count++;
            }
            this.positions[count * 3] = this.positions[0];
            this.positions[count * 3 + 1] = this.positions[1];
            this.positions[count * 3 + 2] = this.positions[2];
            this.colors[count * 3] = 1.0;
            this.colors[count * 3 + 1] = 1.0;
            this.colors[count * 3 + 2] = 1.0;
            geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
            geometry.addAttribute('color', new THREE.BufferAttribute(this.colors, 3));
            geometry.computeBoundingSphere();
            var mesh = new THREE.Line(geometry, material);
            this.scene.add(mesh);
        }
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    NoiseLine.prototype.update = function () {
        this.time += 0.003;
    };
    return NoiseLine;
}());
//# sourceMappingURL=NoiseLine.js.map