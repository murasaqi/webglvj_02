var VThree = (function () {
    function VThree(startAlpha, transparent) {
        var _this = this;
        this.NUM = 0;
        this.scenes = [];
        this.opacityStep = 0.1;
        this.opacity = 1.0;
        this.transparent = false;
        this.key_sceneNext = "ArrowRight";
        this.key_scenePrev = "ArrowLeft";
        this.isOrbitControls = false;
        this.onWindowResize = function () {
            var windowHalfX = window.innerWidth / 2;
            var windowHalfY = window.innerHeight / 2;
            _this.scenes[_this.NUM].camera.aspect = window.innerWidth / window.innerHeight;
            _this.scenes[_this.NUM].camera.updateProjectionMatrix();
            _this.renderer.setSize(window.innerWidth, window.innerHeight);
            console.log("resize");
        };
        this.checkNum = function () {
            if (_this.NUM < 0) {
                _this.NUM = _this.scenes.length - 1;
            }
            if (_this.NUM >= _this.scenes.length) {
                _this.NUM = 0;
            }
            if (_this.NUM == 1) {
                $(".sceneinfo").html("change animation [SPACE_KEY]<br>"
                    + "speed down [S]<br>"
                    + "change FOV[D]");
            }
            if (_this.NUM == 2) {
                $(".sceneinfo").text("speed down [SPACE_KEY]");
            }
            if (_this.NUM == 3) {
                $(".sceneinfo").text("change mesh [SPACE_KEY]");
            }
            if (_this.NUM == 4) {
                $(".sceneinfo").text(" ");
                $(".sceneinfo").html("speed down [SPACE_KEY]<br>"
                    + "enable mouse control [C]");
            }
            if (_this.NUM == 5) {
                $(".sceneinfo").text(" ");
            }
            if (_this.NUM == 6) {
                $(".sceneinfo").html("reset noise value [R]<br>"
                    + "change texture [T]<br>"
                    + "speed Up or Down [A]<br>"
                    + "change vector [V]<br>"
                    + "change FOV [D]<br>"
                    + "rotate img [C]<br>");
            }
            if (_this.NUM == 0) {
                $(".sceneinfo").text(" ");
            }
        };
        this.onClick = function () {
            _this.scenes[_this.NUM].click();
        };
        this.onKeyUp = function (e) {
            _this.scenes[_this.NUM].keyUp(e);
        };
        this.onKeyDown = function (e) {
            console.log(e);
            if (e.key == _this.key_sceneNext) {
                _this.NUM++;
                _this.checkNum();
            }
            if (e.key == _this.key_scenePrev) {
                _this.NUM--;
                _this.checkNum();
            }
            if (e.key == "ArrowUp") {
                _this.opacity += _this.opacityStep;
                if (_this.opacity > 1.0) {
                    _this.opacity = 1.0;
                }
                _this.updateCanvasAlpha();
            }
            if (e.key == "ArrowDown") {
                _this.opacity -= _this.opacityStep;
                if (_this.opacity < 0.0) {
                    _this.opacity = 0.0;
                }
                _this.updateCanvasAlpha();
            }
            console.log(_this.NUM);
            _this.scenes[_this.NUM].keyDown(e);
        };
        this.opacity = startAlpha;
        this.transparent = transparent;
        this.init();
        window.addEventListener('resize', this.onWindowResize, false);
        window.addEventListener('click', this.onClick, false);
        document.addEventListener("keydown", this.onKeyDown, true);
        document.addEventListener("keyup", this.onKeyUp, true);
    }
    VThree.prototype.enableOrbitControls = function () {
    };
    VThree.prototype.initOrbitContorols = function () {
    };
    VThree.prototype.init = function () {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.sortObjects = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.domElement.id = "main";
        document.body.appendChild(this.renderer.domElement);
        this.updateCanvasAlpha();
    };
    VThree.prototype.addScene = function (scene) {
        this.scenes.push(scene);
    };
    VThree.prototype.updateCanvasAlpha = function () {
        if (this.transparent) {
            this.renderer.domElement.style.opacity = this.opacity;
        }
    };
    VThree.prototype.draw = function () {
        this.scenes[this.NUM].update();
        this.renderer.render(this.scenes[this.NUM].scene, this.scenes[this.NUM].camera);
        requestAnimationFrame(this.draw.bind(this));
    };
    return VThree;
}());
//# sourceMappingURL=VThree.js.map