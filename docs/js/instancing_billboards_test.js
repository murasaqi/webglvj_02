var InstancingBalls = (function () {
    function InstancingBalls(renderer) {
        this.translateArray = [];
        this.renderer = renderer;
        this.createScene();
        var width = 100;
        this.WIDTH = width;
        this.PARTICLES = width * width;
        this.initPosition();
        this.initComputeRenderer();
    }
    InstancingBalls.prototype.initComputeRenderer = function () {
        this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);
        var dtPosition = this.gpuCompute.createTexture();
        var dtVelocity = this.gpuCompute.createTexture();
        this.fillTextures(dtPosition, dtVelocity);
        this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", document.getElementById('computeShaderVelocity').textContent, dtVelocity);
        this.positionVariable = this.gpuCompute.addVariable("texturePosition", document.getElementById('computeShaderPosition').textContent, dtPosition);
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
        var error = this.gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }
    };
    InstancingBalls.prototype.initPosition = function () {
        var uvs = new Float32Array(this.PARTICLES * 2);
        var p = 0;
        for (var j = 0; j < this.WIDTH; j++) {
            for (var i = 0; i < this.WIDTH; i++) {
                uvs[p++] = i / (this.WIDTH - 1);
                uvs[p++] = j / (this.WIDTH - 1);
            }
        }
        this.particleUniforms = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
            time: { value: 0.0 },
            cameraConstant: { value: this.getCameraConstant(this.camera) },
            map: { value: new THREE.TextureLoader().load("texture/circle.png") }
        };
        this.geometry = new THREE.InstancedBufferGeometry();
        this.geometry.copy(new THREE.BoxBufferGeometry(1, 1, 1, 2, 2));
        this.translateArray = new Float32Array(this.PARTICLES * 4);
        for (var i = 0, i3 = 0, l = this.PARTICLES; i < l; i++, i3 += 4) {
            this.translateArray[i3 + 0] = (Math.random() * 2 - 1) * 500;
            this.translateArray[i3 + 1] = (Math.random() * 2 - 1) * 500;
            this.translateArray[i3 + 2] = (Math.random() * 2 - 1) * 500;
            this.translateArray[i3 + 3] = 0;
        }
        this.geometry.addAttribute("translate", new THREE.InstancedBufferAttribute(this.translateArray, 4, 1));
        this.geometry.addAttribute('uv_gpu', new THREE.InstancedBufferAttribute(uvs, 2));
        this.material = new THREE.RawShaderMaterial({
            uniforms: this.particleUniforms,
            vertexShader: document.getElementById('vshader_billboard').textContent,
            fragmentShader: document.getElementById('fshader_billboard').textContent,
            depthTest: true,
            depthWrite: true
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    };
    InstancingBalls.prototype.fillTextures = function (texturePosition, textureVelocity) {
        var posArray = texturePosition.image.data;
        var velArray = textureVelocity.image.data;
        for (var k = 0, kl = posArray.length; k < kl; k += 4) {
            var _x, _y, _z, _w;
            _x = this.translateArray[k];
            _z = this.translateArray[k + 1];
            _y = this.translateArray[k + 2];
            _w = this.translateArray[k + 3];
            posArray[k + 0] = _x;
            posArray[k + 1] = _y;
            posArray[k + 2] = _z;
            posArray[k + 3] = 50.0;
            var randomVelRange = 100;
            velArray[k + 0] = Math.random() * randomVelRange - randomVelRange / 2;
            velArray[k + 1] = Math.random() * randomVelRange - randomVelRange / 2;
            velArray[k + 2] = Math.random() * randomVelRange - randomVelRange / 2;
            velArray[k + 3] = Math.random() * randomVelRange - randomVelRange / 2;
        }
    };
    InstancingBalls.prototype.getCameraConstant = function (camera) {
        return window.innerHeight / (Math.tan(THREE.Math.DEG2RAD * 0.5 * camera.fov) / camera.zoom);
    };
    InstancingBalls.prototype.createScene = function () {
        this.time = new Float32Array(1);
        this.time[0] = 0.0;
        this.noise = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 1400;
        this.renderer.setClearColor(new THREE.Color(0x000000));
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    InstancingBalls.prototype.click = function () {
    };
    InstancingBalls.prototype.keyDown = function () {
    };
    InstancingBalls.prototype.update = function () {
        this.gpuCompute.compute();
        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
        this.particleUniforms.time.value += 0.01;
    };
    return InstancingBalls;
}());
//# sourceMappingURL=instancing_billboards_test.js.map