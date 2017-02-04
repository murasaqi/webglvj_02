/// <reference path="typings/index.d.ts" />

class InstancingBalls{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private renderer:THREE.WebGLRenderer;
    private noise:Object;
    private time:Float32Array;

    private geometry:THREE.InstancedBufferGeometry;
    private material:THREE.RawShaderMaterial;
    private mesh:THREE.Mesh;
    private translateArray:Float32Array;
    private particleCount:number;



    private WIDTH:number;
    private PARTICLES:number;



    private gpuCompute:any;
    private velocityVariable:any;
    private positionVariable:any;
    private positionUniforms:any;
    private velocityUniforms:any;
    private particleUniforms:any;
    private effectController:any;

    private translateArray:number[] = [];


    constructor(renderer:THREE.WebGLRenderer) {

        // renderer.setClearColor(0xffffff);
        this.renderer = renderer;
        this.createScene();

        let width = 100;
        this.WIDTH = width;
        this.PARTICLES =  width * width;

        this.initPosition();
        this.initComputeRenderer();







    }

    private initComputeRenderer()
    {



        // gpgpuオブジェクトのインスタンスを格納
        this.gpuCompute = new GPUComputationRenderer( this.WIDTH, this.WIDTH, this.renderer );

        // 今回はパーティクルの位置情報と、移動方向を保存するテクスチャを2つ用意します
        var dtPosition = this.gpuCompute.createTexture();
        var dtVelocity = this.gpuCompute.createTexture();

        // テクスチャにGPUで計算するために初期情報を埋めていく
        this.fillTextures( dtPosition, dtVelocity );

        // shaderプログラムのアタッチ
        this.velocityVariable = this.gpuCompute.addVariable( "textureVelocity", document.getElementById( 'computeShaderVelocity' ).textContent, dtVelocity );
        this.positionVariable = this.gpuCompute.addVariable( "texturePosition", document.getElementById( 'computeShaderPosition' ).textContent, dtPosition );

        // 一連の関係性を構築するためのおまじない
        this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.positionVariable, this.velocityVariable ] );
        this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.positionVariable, this.velocityVariable ] );

        var error = this.gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }

    }

    private initPosition() {
        // this.geometry = new THREE.BufferGeometry();
        // var positions = new Float32Array( this.PARTICLES * 3 );
        // var p = 0;
        // for ( var i = 0; i < this.PARTICLES; i++ ) {
        //     positions[ p++ ] = 0;
        //     positions[ p++ ] = 0;
        //     positions[ p++ ] = 0;
        // }
        //
        // // uv情報の決定。テクスチャから情報を取り出すときに必要
        // var uvs = new Float32Array( this.PARTICLES * 2 );
        // p = 0;
        // for ( var j = 0; j < this.WIDTH; j++ ) {
        //     for ( var i = 0; i < this.WIDTH; i++ ) {
        //         uvs[ p++ ] = i / ( this.WIDTH - 1 );
        //         uvs[ p++ ] = j / ( this.WIDTH - 1 );
        //     }
        // }
        //
        // // attributeをgeometryに登録する
        // this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        // this.geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
        //
        //
        // // uniform変数をオブジェクトで定義
        // // 今回はカメラをマウスでいじれるように、計算に必要な情報もわたす。
        // this.particleUniforms = {
        //     texturePosition: { value: null },
        //     textureVelocity: { value: null },
        //     cameraConstant: { value: this.getCameraConstant( this.camera ) },
        //     map: { value: new THREE.TextureLoader().load( "texture/circle.png" ) },
        // };
        //
        //
        //
        // // Shaderマテリアル これはパーティクルそのものの描写に必要なシェーダー
        // var material = new THREE.ShaderMaterial( {
        //     uniforms:       this.particleUniforms,
        //     vertexShader:   document.getElementById( 'particleVertexShader' ).textContent,
        //     fragmentShader: document.getElementById( 'particleFragmentShader' ).textContent
        // });
        // material.extensions.drawBuffers = true;
        // var particles = new THREE.Points( this.geometry, material );
        // particles.matrixAutoUpdate = false;
        // particles.updateMatrix();

        // パーティクルをシーンに追加
        // this.scene.add( particles );

        var uvs = new Float32Array( this.PARTICLES * 2 );
        var p = 0;
        for ( var j = 0; j < this.WIDTH; j++ ) {
            for ( var i = 0; i < this.WIDTH; i++ ) {
                uvs[ p++ ] = i / ( this.WIDTH - 1 );
                uvs[ p++ ] = j / ( this.WIDTH - 1 );
            }
        }



        this.particleUniforms = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
            time: { value: 0.0 },
            cameraConstant: { value: this.getCameraConstant( this.camera ) },
            map: { value: new THREE.TextureLoader().load( "texture/circle.png" ) },
        };


        this.geometry = new THREE.InstancedBufferGeometry();
        this.geometry.copy( new THREE.BoxBufferGeometry( 1, 1,1,2,2 ) );
        // var particleCount = 75000;
        this.translateArray = new Float32Array( this.PARTICLES * 4 );
        for ( var i = 0, i3 = 0, l = this.PARTICLES; i < l; i ++, i3 += 4 ) {
            this.translateArray[ i3 + 0 ] = (Math.random() * 2 - 1)*500;
            this.translateArray[ i3 + 1 ] = (Math.random() * 2 - 1)*500;
            this.translateArray[ i3 + 2 ] = (Math.random() * 2 - 1)*500;
            this.translateArray[ i3 + 3 ] = 0;
        }
        this.geometry.addAttribute( "translate", new THREE.InstancedBufferAttribute( this.translateArray, 4, 1 ) );
        this.geometry.addAttribute( 'uv_gpu', new THREE.InstancedBufferAttribute( uvs, 2 ) );
        this.material = new THREE.RawShaderMaterial( {
            uniforms:this.particleUniforms,
            vertexShader: document.getElementById( 'vshader_billboard' ).textContent,
            fragmentShader: document.getElementById( 'fshader_billboard' ).textContent,
            depthTest: true,
            depthWrite: true,
            // transparent:true,
            // blending:THREE[ "NormalBlending" ]
        } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        // this.mesh.scale.set( 500, 500, 500 );
        this.scene.add( this.mesh );

    }

    private fillTextures( texturePosition, textureVelocity ) {

        // textureのイメージデータをいったん取り出す
        var posArray = texturePosition.image.data;
        var velArray = textureVelocity.image.data;

        // パーティクルの初期の位置は、ランダムなXZに平面おく。
        // 板状の正方形が描かれる

        for ( var k = 0, kl = posArray.length; k < kl; k += 4 ) {
            // Position
            var _x, _y, _z, _w;
            _x = this.translateArray[k];
            _z = this.translateArray[k+1];
            _y = this.translateArray[k+2];
            _w = this.translateArray[k+3];
            // posArrayの実態は一次元配列なので
            // x,y,z,wの順番に埋めていく。
            // console.log(_x);
            // wは今回は使用しないが、配列の順番などを埋めておくといろいろ使えて便利
            posArray[ k + 0 ] = _x;
            posArray[ k + 1 ] = _y;
            posArray[ k + 2 ] = _z;
            posArray[ k + 3 ] = 50.0;

            // 移動する方向はとりあえずffffffランダムに決めてみる。
            // これでランダムな方向にとぶパーティクルが出来上がるはず。
            let randomVelRange = 100;
            velArray[ k + 0 ] = Math.random()*randomVelRange-randomVelRange/2;
            velArray[ k + 1 ] = Math.random()*randomVelRange-randomVelRange/2;
            velArray[ k + 2 ] = Math.random()*randomVelRange-randomVelRange/2;
            velArray[ k + 3 ] = Math.random()*randomVelRange-randomVelRange/2;
        }
    }

    private getCameraConstant( camera ) {
        return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );
    }


    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(){

        this.time = new Float32Array(1);
        this.time[0] = 0.0;
        this.noise = new SimplexNoise();


        // シーンを作る
        this.scene = new THREE.Scene();

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 1400;
        // this.camera.position.y = 20;

        this.renderer.setClearColor(new THREE.Color(0x000000));


        // this.geometry = new THREE.InstancedBufferGeometry();
        // this.geometry.copy( new THREE.CircleBufferGeometry( 1, 6 ) );
        //
        // this.particleCount = 10000;
        //
        // this.translateArray = new Float32Array( this.particleCount * 4 );
        //
        //
        // // (r sinsθ cosΦ, r cosθ, r sinθ sinΦ)
        // // var theta = Math.PI*2*Math.random();
        // // var phi = Math.PI*2*Math.random();
        // let r = 0.1;
        //
        // for ( let i = 0, i3 = 0, l = this.particleCount; i < l; i ++, i3 += 4 ) {
        //     var theta = Math.PI*2*Math.random();
        //     var phi = Math.PI*2*Math.random();
        //     let x = r * Math.sin(theta) * Math.cos(phi);
        //     let y = r * Math.cos(theta);
        //     let z = r * Math.sin(theta) * Math.sin(phi);
        //
        //     this.translateArray[ i3 + 0 ] = x;
        //     this.translateArray[ i3 + 1 ] = y;
        //     this.translateArray[ i3 + 2 ] = z;
        //     this.translateArray[ i3 + 3 ] = 0.0;
        //
        // }
        //
        // this.geometry.addAttribute( "translate", new THREE.InstancedBufferAttribute( this.translateArray, 4, 1 ) );
        //
        // this.material = new THREE.RawShaderMaterial( {
        //     uniforms: {
        //         map: { value: new THREE.TextureLoader().load( "texture/circle.png" ) },
        //         time: { value: 0.0 }
        //     },
        //     vertexShader: document.getElementById( 'vshader_billbords' ).textContent,
        //     fragmentShader: document.getElementById( 'fshader_billbords' ).textContent,
        //     depthTest: true,
        //     depthWrite: true
        //
        //
        // } );
        //
        //
        // // this.geometry.addAttribute.translate.dynamic = true;
        //
        // this.mesh = new THREE.Mesh( this.geometry, this.material );
        // this.mesh.scale.set( 500, 500, 500 );
        // this.scene.add( this.mesh );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );


        let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );


        // console.log(this.geometry);


    }


    public click()
    {

    }

    public keyDown()
    {

    }
    // ワンフレームごとの処理
    public update() {



        // this.time[0] = performance.now()* 0.0005;
        //
        // this.material.uniforms.time.value = this.time[0];
        //
        // // this.mesh.rotation.x = this.time * 0.2;
        // // this.mesh.rotation.y = this.time * 0.4;
        //
        // this.geometry.attributes.translate.dynamic = true;
        // let _array = this.geometry.attributes.translate.array;
        // for ( let i = 0, i3 = 0, l = _array.length; i < l; i ++, i3 += 4 ) {
        //     // var theta = Math.PI*2*Math.random();
        //     // var phi = Math.PI*2*Math.random();
        //     // let x = r * Math.sin(theta) * Math.cos(phi);
        //     // let y = r * Math.cos(theta);
        //     // let z = r * Math.sin(theta) * Math.sin(phi);
        //
        //     // translateArray[ i3 + 0 ] = x;
        //     // translateArray[ i3 + 1 ] = y;
        //
        //     _array[ i3 + 3 ] += 0.0001;
        //     // console.log(_array[ i3 + 0 ]);
        //
        // }
        //
        // this.geometry.attributes.translate.needsUpdate = true;

        this.gpuCompute.compute();

        // Three.js用のGPGPUライブラリでは、以下のように情報を更新することができる。
        // 現在の情報を、保存用のメモリに格納するおまじない。
        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
        this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;
        // renderer.render( scene, camera );
        this.particleUniforms.time.value += 0.01;




    }


}


