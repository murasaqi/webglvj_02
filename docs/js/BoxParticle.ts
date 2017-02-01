/// <reference path="typings/index.d.ts" />
// *********** ひとつめのシーン *********** //
class BoxParticle{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private Box:THREE.Mesh;
    private time:number = 0.0;
    private renderer:THREE.WebGLRenderer;
    private geometry:THREE.BufferGeometry;
    private controls:any;

    private WIDTH:number = 100;
    private PARTICLES:number = this.WIDTH * this.WIDTH;
    private gpuCompute:any;
    private velocityVariable:any;
    private positionVariable:any;
    private positionUniforms:any;
    private velocityUniforms:any;
    private particleUniforms:any;
    private effectController:any;

    private simplex:Object;


    constructor(renderer:THREE.WebGLRenderer) {

        this.time = 0.0;

        this.simplex = new SimplexNoise();
        this.scene = new THREE.Scene();
        this.renderer = renderer;
        this.renderer.setClearColor( 0xffffff );
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 1000;
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

        this.initPosition();
        this.initComputeRenderer();

        this.createScene();



        // ②particle 初期化


    }

    private createScene()
    {
        let ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);


        let dLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dLight.position.set(0,100,0);
        this.scene.add(dLight);


        let dLight02 = new THREE.DirectionalLight(0xffffff, 0.4);
        dLight02.position.set(0,0,100);
        this.scene.add(dLight02);


        this.loadModel();
    }

    private initComputeRenderer() {

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


        let velocityUniforms = this.velocityVariable.material.uniforms;
        let positionUniforms = this.positionVariable.material.uniforms;

        velocityUniforms.time = { value: 0.0 };
        positionUniforms.time = { value: 0.0 };

        positionUniforms.emitterPos = { value: new THREE.Vector3(0,0,0) };
        positionUniforms.pre_emitterPos = { value: new THREE.Vector3(0,0,0) };


        // error処理
        var error = this.gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }
    }

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
            cameraConstant: { value: this.getCameraConstant( this.camera ) },
            map: { value: new THREE.TextureLoader().load( "texture/circle.png" ) }
        };



        // Shaderマテリアル これはパーティクルそのものの描写に必要なシェーダー
        var material = new THREE.ShaderMaterial( {
            uniforms:       this.particleUniforms,
            // transparent:true,
            // blending : THREE[ "AdditiveBlending" ],
            vertexShader:   document.getElementById( 'particleVertexShader' ).textContent,
            fragmentShader: document.getElementById( 'particleFragmentShader' ).textContent
        });
        material.extensions.drawBuffers = true;
        var particles = new THREE.Points( this.geometry, material );
        particles.matrixAutoUpdate = false;
        particles.position.set(-45,90,40);
        particles.updateMatrix();

        // パーティクルをシーンに追加
        this.scene.add( particles );
    }


    private fillTextures( texturePosition, textureVelocity ) {

        // textureのイメージデータをいったん取り出す
        var posArray = texturePosition.image.data;
        var velArray = textureVelocity.image.data;

        // パーティクルの初期の位置は、ランダムなXZに平面おく。
        // 板状の正方形が描かれる

        let offsetrad = 0.0;
        for ( var k = 0, kl = posArray.length; k < kl; k += 4 ) {
            // Position
            offsetrad += 0.01;
            var x, y, z;
            // x = Math.random()*500-250;
            // z = Math.random()*500-250;
            // y = 0;

            let rad = 100;
            x = Math.cos(offsetrad) * rad;
            z = Math.sin(offsetrad) * rad;
            y = Math.sin(offsetrad*0.3) * rad * 0.3;

            let range = 100;
            x = Math.random()*range-range/2;
            y = Math.random()*range-range/2;
            y = Math.random()*500;
            z = Math.random()*range-range/2;
            // posArrayの実態は一次元配列なので
            // x,y,z,wの順番に埋めていく。
            // wは今回は使用しないが、配列の順番などを埋めておくといろいろ使えて便利
            posArray[ k + 0 ] = x;
            posArray[ k + 1 ] = y;
            posArray[ k + 2 ] = z;
            posArray[ k + 3 ] = Math.random()*100;

            // 移動する方向はとりあえずランダムに決めてみる。
            // これでランダムな方向にとぶパーティクルが出来上がるはず。
            velArray[ k + 0 ] = Math.random()*2-1;
            velArray[ k + 1 ] = Math.random()*2-1;
            velArray[ k + 2 ] = Math.random()*2-1;
            velArray[ k + 3 ] = Math.random()*2-1;
        }
    }

    public loadModel()
    {
        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };

        var gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
        // gridHelper.position.y = - 150;
        // gridHelper.position.x = - 150;
        this.scene.add( gridHelper );

        // var material = new THREE.Material({
        //     shading:THREE.FlatShading
        // })
        var onError = function ( xhr ) { };
        THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'obj/' );
        var _scene = this.scene;
        mtlLoader.load ( 'female_head.mtl', function ( materials ) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'obj/' );
            objLoader.load( 'female_head.obj', function ( object:THREE.Mesh ) {
                object.position.y = - 95;
                console.log(object.children[0]);
                object.position.y = 30;
                object.children[0].material.shading = THREE.FlatShading;
                // for(let i = 0; i < object.children[0].material.materials.length; i++)
                // {
                //     object.children[0].material.materials[i].wireframe = true;
                // }

                // object.children[0].drawMode = 3;
                // object.material.wireframe = true;
                // object.children[0].
                _scene.add( object);
            }, onProgress, onError );
        });
    }

    public click()
    {

    }

    public keyDown(keycode)
    {

    }


    private getCameraConstant( camera:THREE.Camera ) {
        return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );
    }


    // ワンフレームごとの処理
    public update() {
        this.time += 0.01;
        this.gpuCompute.compute();
        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
        this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;
        this.velocityVariable.material.uniforms.time.value = this.time;
        this.positionVariable.material.uniforms.time.value = this.time;
        let scale = 10.0;
        this.positionVariable.material.uniforms.pre_emitterPos.value = this.positionVariable.material.uniforms.emitterPos.value;
        this.positionVariable.material.uniforms.emitterPos.value = new THREE.Vector3(this.simplex.noise3D(this.time, 0, 0)*scale,this.simplex.noise3D(0, this.time, 0)*scale,this.simplex.noise3D(0, 0, this.time)*scale);

    }


}

