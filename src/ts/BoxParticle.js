var BoxParticle = (function () {
    function BoxParticle(renderer) {
        this.time = 0.0;
        this.WIDTH = 100;
        this.PARTICLES = this.WIDTH * this.WIDTH;
        this.time = 0.0;
        this.simplex = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.renderer = renderer;
        this.renderer.setClearColor(0xffffff);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 1000;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.initPosition();
        this.initComputeRenderer();
        this.createScene();
    }
    BoxParticle.prototype.createScene = function () {
        var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);
        var dLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dLight.position.set(0, 100, 0);
        this.scene.add(dLight);
        var dLight02 = new THREE.DirectionalLight(0xffffff, 0.4);
        dLight02.position.set(0, 0, 100);
        this.scene.add(dLight02);
        this.loadModel();
    };
    BoxParticle.prototype.initComputeRenderer = function () {
        this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);
        var dtPosition = this.gpuCompute.createTexture();
        var dtVelocity = this.gpuCompute.createTexture();
        this.fillTextures(dtPosition, dtVelocity);
        this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", document.getElementById('computeShaderVelocity').textContent, dtVelocity);
        this.positionVariable = this.gpuCompute.addVariable("texturePosition", document.getElementById('computeShaderPosition').textContent, dtPosition);
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
        var velocityUniforms = this.velocityVariable.material.uniforms;
        var positionUniforms = this.positionVariable.material.uniforms;
        velocityUniforms.time = { value: 0.0 };
        positionUniforms.time = { value: 0.0 };
        positionUniforms.emitterPos = { value: new THREE.Vector3(0, 0, 0) };
        positionUniforms.pre_emitterPos = { value: new THREE.Vector3(0, 0, 0) };
        var error = this.gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }
    };
    BoxParticle.prototype.initPosition = function () {
        this.geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(this.PARTICLES * 3);
        var p = 0;
        for (var i = 0; i < this.PARTICLES; i++) {
            positions[p++] = 0;
            positions[p++] = 0;
            positions[p++] = 0;
        }
        var uvs = new Float32Array(this.PARTICLES * 2);
        p = 0;
        for (var j = 0; j < this.WIDTH; j++) {
            for (var i = 0; i < this.WIDTH; i++) {
                uvs[p++] = i / (this.WIDTH - 1);
                uvs[p++] = j / (this.WIDTH - 1);
            }
        }
        this.geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.particleUniforms = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
            cameraConstant: { value: this.getCameraConstant(this.camera) },
            map: { value: new THREE.TextureLoader().load("texture/circle.png") }
        };
        var material = new THREE.ShaderMaterial({
            uniforms: this.particleUniforms,
            vertexShader: document.getElementById('particleVertexShader').textContent,
            fragmentShader: document.getElementById('particleFragmentShader').textContent
        });
        material.extensions.drawBuffers = true;
        var particles = new THREE.Points(this.geometry, material);
        particles.matrixAutoUpdate = false;
        particles.position.set(-45, 90, 40);
        particles.updateMatrix();
        this.scene.add(particles);
    };
    BoxParticle.prototype.fillTextures = function (texturePosition, textureVelocity) {
        var posArray = texturePosition.image.data;
        var velArray = textureVelocity.image.data;
        var offsetrad = 0.0;
        for (var k = 0, kl = posArray.length; k < kl; k += 4) {
            offsetrad += 0.01;
            var x, y, z;
            var rad = 100;
            x = Math.cos(offsetrad) * rad;
            z = Math.sin(offsetrad) * rad;
            y = Math.sin(offsetrad * 0.3) * rad * 0.3;
            var range = 100;
            x = Math.random() * range - range / 2;
            y = Math.random() * range - range / 2;
            y = Math.random() * 500;
            z = Math.random() * range - range / 2;
            posArray[k + 0] = x;
            posArray[k + 1] = y;
            posArray[k + 2] = z;
            posArray[k + 3] = Math.random() * 100;
            velArray[k + 0] = Math.random() * 2 - 1;
            velArray[k + 1] = Math.random() * 2 - 1;
            velArray[k + 2] = Math.random() * 2 - 1;
            velArray[k + 3] = Math.random() * 2 - 1;
        }
    };
    BoxParticle.prototype.loadModel = function () {
        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
        };
        var gridHelper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
        this.scene.add(gridHelper);
        var onError = function (xhr) { };
        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('obj/');
        var _scene = this.scene;
        mtlLoader.load('female_head.mtl', function (materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('obj/');
            objLoader.load('female_head.obj', function (object) {
                object.position.y = -95;
                console.log(object.children[0]);
                object.position.y = 30;
                object.children[0].material.shading = THREE.FlatShading;
                _scene.add(object);
            }, onProgress, onError);
        });
    };
    BoxParticle.prototype.click = function () {
    };
    BoxParticle.prototype.keyDown = function (keycode) {
    };
    BoxParticle.prototype.getCameraConstant = function (camera) {
        return window.innerHeight / (Math.tan(THREE.Math.DEG2RAD * 0.5 * camera.fov) / camera.zoom);
    };
    BoxParticle.prototype.update = function () {
        this.time += 0.01;
        this.gpuCompute.compute();
        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
        this.velocityVariable.material.uniforms.time.value = this.time;
        this.positionVariable.material.uniforms.time.value = this.time;
        var scale = 10.0;
        this.positionVariable.material.uniforms.pre_emitterPos.value = this.positionVariable.material.uniforms.emitterPos.value;
        this.positionVariable.material.uniforms.emitterPos.value = new THREE.Vector3(this.simplex.noise3D(this.time, 0, 0) * scale, this.simplex.noise3D(0, this.time, 0) * scale, this.simplex.noise3D(0, 0, this.time) * scale);
    };
    return BoxParticle;
}());
//# sourceMappingURL=BoxParticle.js.map