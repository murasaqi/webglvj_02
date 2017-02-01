var Scene05 = (function () {
    function Scene05(renderer) {
        this.timer = 0;
        this.groups = [];
        this.renderer = renderer;
        this.createScene();
    }
    Scene05.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 100;
        var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);
        var dLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dLight.position.set(0, 100, 0);
        this.scene.add(dLight);
        var dLight02 = new THREE.DirectionalLight(0xffffff, 0.4);
        dLight02.position.set(0, 0, 100);
        this.scene.add(dLight02);
        var material = new THREE.MeshPhongMaterial({
            color: 0x491e5b,
            specular: 0xa0f8ff,
            shininess: 10,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
        });
        var wireMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            wireframe: true
        });
        var convexSize = 10;
        for (var i_1 = 0; i_1 < convexSize; i_1++) {
            var points = [];
            var group = new THREE.Group();
            var range = 50;
            for (var j = 0; j < 8; j++) {
                var randomx = -range + Math.round(Math.random() * range * 3);
                var randomy = -range + Math.round(Math.random() * range * 3);
                var randomz = -range * 0.5 + Math.round(Math.random() * range * 2);
                points.push(new THREE.Vector3(randomx, randomy, randomz));
            }
            var mesh = this.createConvexMesh(40 * 2, 80 * 2, 30 * 2, material);
            var wireMesh = new THREE.Mesh(mesh.geometry, wireMaterial);
            var meshScale = 1.001;
            wireMesh.scale.set(meshScale, meshScale, meshScale);
            wireMesh.material.wireframe = true;
            var rad_1 = 600;
            var x = Math.cos(Math.PI * 2 / (convexSize) * i_1) * rad_1;
            var z = Math.sin(Math.PI * 2 / (convexSize) * i_1) * rad_1;
            var y = Math.sin((Math.PI * 2 / (convexSize) * i_1 * 4) * 40);
            group.add(mesh);
            group.add(wireMesh);
            group.position.set(x, y, z);
            this.groups.push(group);
        }
        for (var k = 0; k < 30; k++) {
            var lineGeo = new THREE.BufferGeometry();
            this.simplex = new SimplexNoise();
            var segments = 50;
            var positions = new Float32Array(segments * 3);
            var colors = new Float32Array(segments * 3);
            var noiseCounter = 0.0;
            var noiseStep = 0.001 + Math.random() * 0.01;
            var x = 0.0 + Math.random() * 20 - 10;
            var y = 0.0 + Math.random() * 20 - 10;
            var z = 0.0 + Math.random() * 20 - 10;
            var xStep_1 = 1.0;
            var noiseRange = 40.0;
            var noiseScale = 0.002;
            var curveStep = 0.0;
            var startRad = Math.PI * 2 * Math.random();
            var point = new THREE.Vector3();
            var direction = new THREE.Vector3();
            var lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors,
                linewidth: 7
            });
            var colorNum = 0.0;
            for (var i = 0; i < segments; i++) {
                direction.x += Math.random() - 0.5 + Math.sin(i * 0.02);
                direction.y += Math.random() - 0.5 + Math.sin(i * 0.01);
                direction.z += Math.random() - 0.5 + Math.cos(i * 0.03);
                direction.normalize().multiplyScalar(10);
                point.add(direction);
                positions[i * 3] = point.x;
                positions[i * 3 + 1] = point.y;
                positions[i * 3 + 2] = point.z;
                colors[i * 3] = Math.sin(i * 0.01);
                colors[i * 3 + 1] = Math.sin(i * 0.01);
                colors[i * 3 + 2] = Math.sin(i * 0.01);
            }
            lineGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            lineGeo.addAttribute('color', new THREE.BufferAttribute(colors, 3));
            lineGeo.computeBoundingSphere();
            var _group = new THREE.Group();
            for (var j = 0; j < 8; j++) {
                var mesh = new THREE.Line(lineGeo, lineMaterial);
                var phi = Math.random() * Math.PI * 2;
                var theta = Math.random() * Math.PI * 2;
                var r = 40;
                mesh.position.set(0, r * Math.cos(theta), r * Math.sin(theta));
                var randomRotate = Math.random() * 1;
                mesh.rotation.set(Math.random() * randomRotate - randomRotate / 2, Math.random() * randomRotate - randomRotate / 2, Math.random() * randomRotate - randomRotate / 2);
                _group.add(mesh);
            }
        }
        var boxGeo = new THREE.BoxBufferGeometry(10, 10, 10, 2, 2, 2);
        var boxMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        var xStep = 10;
        var yStep = 0.5;
        var size = 100;
        var rad = 100;
        for (var i = 0; i < size; i++) {
            var x = xStep * i - (xStep * size) / 2;
            var y = Math.cos(yStep * i) * rad * Math.sin(Math.PI * 2 / size * i);
            var z = Math.sin(yStep * i) * rad;
            var mesh = new THREE.Mesh(boxGeo, boxMaterial);
            mesh.position.set(x, y, z);
            this.scene.add(mesh);
        }
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    Scene05.prototype.createConvexMesh = function (width, height, depth, material) {
        var points = [];
        for (var i = 0; i < 6; i++) {
            var randomX = -width / 2 + Math.round(Math.random() * width);
            var randomY = -height / 2 + Math.round(Math.random() * height);
            var randomZ = -depth / 2 + Math.round(Math.random() * depth);
            points.push(new THREE.Vector3(randomX, randomY, randomZ));
        }
        var cvGeo = new THREE.ConvexGeometry(points);
        var cvMesh = new THREE.Mesh(cvGeo, material);
        return cvMesh;
    };
    Scene05.prototype.click = function () {
    };
    Scene05.prototype.keyDown = function (keyCode) {
    };
    Scene05.prototype.update = function () {
    };
    return Scene05;
}());
//# sourceMappingURL=scene05.js.map