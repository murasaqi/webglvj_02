var ImgParticle = (function () {
    function ImgParticle(renderer) {
        this.timer = 0;
        this.WIDTH = 500;
        this.PARTICLES = this.WIDTH * this.WIDTH;
        this.renderer = renderer;
        this.createScene();
        this.initPosition();
        this.initComputeRenderer();
    }
    ImgParticle.prototype.createScene = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 100;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    };
    ImgParticle.prototype.initComputeRenderer = function () {
        console.log(this.renderer);
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
    ImgParticle.prototype.initPosition = function () {
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
            cameraConstant: { value: this.getCameraConstant() }
        };
        var material = new THREE.ShaderMaterial({
            uniforms: this.particleUniforms,
            vertexShader: document.getElementById('particleVertexShader').textContent,
            fragmentShader: document.getElementById('particleFragmentShader').textContent
        });
        material.extensions.drawBuffers = true;
        var particles = new THREE.Points(this.geometry, material);
        particles.matrixAutoUpdate = false;
        particles.updateMatrix();
        this.scene.add(particles);
    };
    ImgParticle.prototype.fillTextures = function (texturePosition, textureVelocity) {
        var posArray = texturePosition.image.data;
        var velArray = textureVelocity.image.data;
        var xCounter = 1;
        var yCounter = 1;
        var imgWidth = 100;
        var imgHeight = 100;
        for (var k = 0, kl = posArray.length; k < kl; k += 4) {
            xCounter++;
            if (xCounter % this.WIDTH == 0) {
                yCounter++;
            }
            var x, y, z;
            x = (-0.5 + (xCounter % this.WIDTH) / this.WIDTH) * imgWidth;
            z = (-0.5 + (yCounter % this.WIDTH) / this.WIDTH) * imgHeight;
            y = 0;
            posArray[k + 0] = x;
            posArray[k + 1] = y;
            posArray[k + 2] = z;
            posArray[k + 3] = 0;
            velArray[k + 0] = Math.random() * 2 - 1;
            velArray[k + 1] = Math.random() * 2 - 1;
            velArray[k + 2] = Math.random() * 2 - 1;
            velArray[k + 3] = Math.random() * 2 - 1;
        }
    };
    ImgParticle.prototype.getCameraConstant = function () {
        return window.innerHeight / (Math.tan(THREE.Math.DEG2RAD * 0.5 * this.camera.fov) / this.camera.zoom);
    };
    ImgParticle.prototype.onWindowResize = function () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.particleUniforms.cameraConstant.value = this.getCameraConstant();
    };
    ImgParticle.prototype.click = function () {
    };
    ImgParticle.prototype.keyDown = function (e) {
    };
    ImgParticle.prototype.keyUp = function (e) {
    };
    ImgParticle.prototype.update = function () {
        this.renderer.setClearColor(0x000000);
        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
    };
    return ImgParticle;
}());
//# sourceMappingURL=ImgParticle.js.map