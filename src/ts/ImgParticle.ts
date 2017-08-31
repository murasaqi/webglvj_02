

/// <reference path="typings/index.d.ts" />

// *********** ひとつめのシーン *********** //
class ImgParticle{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private timer:number = 0;

    private WIDTH:number =200;
    private PARTICLES = this.WIDTH * this.WIDTH;

    private stats:Object;
    private geometry:THREE.BufferGeometry;
    private controls:Object;

    private gpuCompute:Object;
    private velocityVariable:any;
    private positionVariable:any;
    private positionUniforms:any;
    private velocityUniforms:any;
    private particleUniforms:any;
    private effectController:Object;
    private renderer:THREE.WebGLRenderer;

    private imgWidth:number = 80;
    private imgHeight:number = 100;
    private enableControls:boolean = false;


    private speed:number = 1.0;

    private isSpeedDown:boolean = false;



    constructor(renderer:THREE.WebGLRenderer) {

        this.renderer = renderer;
        this.createScene();


        this.initComputeRenderer();
        this.initPosition();



    }



    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(){

        // シーンを作る
        this.scene = new THREE.Scene();
        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 100;


        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

    }

    private initComputeRenderer() {

        console.log(this.renderer);
        // gpgpuオブジェクトのインスタンスを格納
        this.gpuCompute = new GPUComputationRenderer( this.WIDTH, this.WIDTH, this.renderer );

        // 今回はパーティクルの位置情報と、移動方向を保存するテクスチャを2つ用意します
        var dtPosition = this.gpuCompute.createTexture();
        var dtVelocity = this.gpuCompute.createTexture();
        var dtColor = this.gpuCompute.createTexture();

        // テクスチャにGPUで計算するために初期情報を埋めていく
        this.fillTextures( dtPosition, dtVelocity,dtColor );

        // shaderプログラムのアタッチ
        this.velocityVariable = this.gpuCompute.addVariable( "textureVelocity", document.getElementById( 'computeShaderVelocity' ).textContent, dtVelocity );
        this.positionVariable = this.gpuCompute.addVariable( "texturePosition", document.getElementById( 'computeShaderPosition' ).textContent, dtPosition );

        // 一連の関係性を構築するためのおまじない
        this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.positionVariable, this.velocityVariable ] );
        this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.positionVariable, this.velocityVariable ] );


        // uniform変数を登録したい場合は以下のように作る

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.velocityUniforms = this.velocityVariable.material.uniforms;

        this.velocityUniforms.time = { value: 0.0 };
        this.positionUniforms.time = { Value: 0.0 };
        this.positionUniforms.timeStep = { Value: 1.0 };



        // error処理
        var error = this.gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }
    }

    // private restartSimulation() {
    //     var dtPosition = this.gpuCompute.createTexture();
    //     var dtVelocity = this.gpuCompute.createTexture();
    //     this.fillTextures( dtPosition, dtVelocity );
    //     this.gpuCompute.renderTexture( dtPosition, this.positionVariable.renderTargets[ 0 ] );
    //     this.gpuCompute.renderTexture( dtPosition, this.positionVariable.renderTargets[ 1 ] );
    //     this.gpuCompute.renderTexture( dtVelocity, this.velocityVariable.renderTargets[ 0 ] );
    //     this.gpuCompute.renderTexture( dtVelocity, this.velocityVariable.renderTargets[ 1 ] );
    // }

    // ②パーティクルそのものの情報を決めていく。
    private initPosition() {

        // 最終的に計算された結果を反映するためのオブジェクト。
        // 位置情報はShader側(texturePosition, textureVelocity)
        // で決定されるので、以下のように適当にうめちゃってOK

        this.geometry = new THREE.BufferGeometry();
        var positions = new Float32Array( this.PARTICLES * 3 );
        var p = 0;
        for ( var i = 0; i < this.PARTICLES; i++ ) {
            positions[ p++ ] = 0;
            positions[ p++ ] = 0;
            positions[ p++ ] = 0;
        }

        // uv情報の決定。テクスチャから情報を取り出すときに必要
        var uvs = new Float32Array( this.PARTICLES * 2 );
        p = 0;
        for ( var j = 0; j < this.WIDTH; j++ ) {
            for ( var i = 0; i < this.WIDTH; i++ ) {
                uvs[ p++ ] = i / ( this.WIDTH - 1 );
                uvs[ p++ ] = j / ( this.WIDTH - 1 );
            }
        }

        // attributeをgeometryに登録する
        this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        this.geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );


        // uniform変数をオブジェクトで定義
        // 今回はカメラをマウスでいじれるように、計算に必要な情報もわたす。
        this.particleUniforms = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
            cameraConstant: { value: this.getCameraConstant( ) },
            map : {value:new THREE.TextureLoader().load( "texture/MonaLisa.jpg" )},
            texImgWidth : {value:this.imgWidth},
            texImgHeight : {value:this.imgHeight}
        };



        // Shaderマテリアル これはパーティクルそのものの描写に必要なシェーダー
        var material = new THREE.ShaderMaterial( {
            uniforms:       this.particleUniforms,
            vertexShader:   document.getElementById( 'particleVertexShader' ).textContent,
            fragmentShader: document.getElementById( 'particleFragmentShader' ).textContent
        });
        material.extensions.drawBuffers = true;
        var particles = new THREE.Points( this.geometry, material );
        particles.matrixAutoUpdate = false;
        particles.updateMatrix();

        particles.frustumCulled = false;

        // パーティクルをシーンに追加
        this.scene.add( particles );
    }


    private fillTextures( texturePosition, textureVelocity,dtColor ) {

        // textureのイメージデータをいったん取り出す
        var posArray = texturePosition.image.data;
        var velArray = textureVelocity.image.data;

        // パーティクルの初期の位置は、ランダムなXZに平面おく。
        // 板状の正方形が描かれる

        let xCounter = 1;
        let yCounter = 1;

        for ( var k = 0, kl = posArray.length; k < kl; k += 4 ) {
            // Position
            xCounter ++;
            if(xCounter % this.WIDTH == 0)
            {
                yCounter++;
            }
            var x, y, z;
            x = (-0.5 + (xCounter%this.WIDTH)/this.WIDTH)*this.imgWidth;
            z = (-0.5 + (yCounter%this.WIDTH)/this.WIDTH)*this.imgHeight;
            // x = Math.random()*10-5;
            // z = Math.random()*10-5;
            y = Math.random()*10.0;
            // posArrayの実態は一次元配列なので
            // x,y,z,wの順番に埋めていく。
            // wは今回は使用しないが、配列の順番などを埋めておくといろいろ使えて便利
            posArray[ k + 0 ] = x;
            posArray[ k + 1 ] = y;
            posArray[ k + 2 ] = z;
            posArray[ k + 3 ] = Math.random()*30.0+Math.random()*20.0;

            // 移動する方向はとりあえずランダムに決めてみる。
            // これでランダムな方向にとぶパーティクルが出来上がるはず。
            velArray[ k + 0 ] = Math.random()*2-1;
            velArray[ k + 1 ] = Math.random()*2-1;
            velArray[ k + 2 ] = Math.random()*2-1;
            velArray[ k + 3 ] = Math.random()*2-1;

            dtColor[ k + 0 ] = Math.random()*2-1;
            dtColor[ k + 1 ] = Math.random()*2-1;
            dtColor[ k + 2 ] = Math.random()*2-1;
            dtColor[ k + 3 ] = Math.random()*2-1;
        }
    }

    private getCameraConstant( ) {
        return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * this.camera.fov ) / this.camera.zoom );
    }

    
    // 画面がリサイズされたときの処理
    // ここでもシェーダー側に情報を渡す。
    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.particleUniforms.cameraConstant.value = this.getCameraConstant( );
    }

    public click()
    {

    }
    public keyDown(e:KeyboardEvent)
    {

        if(e.code == "Space")
        {
            console.log('s');
            this.isSpeedDown = !this.isSpeedDown;
        }

        if(e.key == "c")
        {
            this.enableControls = !this.enableControls;
        }


    }

    public keyUp(e:KeyboardEvent)
    {
        // this.isSpeedDown = false;
    }

    // ワンフレームごとの処理
    public update() {




        this.gpuCompute.compute();

        this.renderer.setClearColor(0x000000);


        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
        this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;


        this.velocityUniforms.time.value += 0.01*this.speed;
        this.positionUniforms.time.value += 0.01*this.speed;


        if(this.enableControls)
        {
            this.controls.enabled = true;
        } else {
            this.controls.enabled = false;
            if(this.isSpeedDown)
            {
                this.speed = 0.5;
            } else
            {
                this.speed = 2.0;
            }
            let step = 0.01;
            this.timer += step*this.speed;
            let rad = 30;

            this.camera.position.x = Math.cos(this.timer) * rad;
            this.camera.position.z = Math.sin(this.timer) * rad + 30*Math.cos(this.timer*0.5);

            this.camera.position.y = Math.sin(this.timer*0.5) * rad*0.8;



            let lookat = new THREE.Vector3(0,0,0);

            lookat.x = Math.cos(this.timer*0.4)*1;
            lookat.y = Math.sin(this.timer*0.2)*1;
            lookat.z = Math.cos(this.timer*0.3)*1;
            this.camera.lookAt(new THREE.Vector3(0,0,0));
        }




    }


}




