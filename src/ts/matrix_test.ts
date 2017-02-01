/// <reference path="typings/index.d.ts" />

import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
class MatrxTest{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private timer:number = 0;
    private renderer:THREE.WebGLRenderer;


    constructor(renderer:THREE.WebGLRenderer) {

        this.renderer = renderer;
        this.createScene();


    }

    createLight( color:any ) {
        var pointLight = new THREE.PointLight( color, 1, 60 );
        pointLight.castShadow = true;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 40;
        // pointLight.shadowCameraVisible = true;
        pointLight.shadow.bias = 0.001;
        var geometry = new THREE.SphereGeometry( 0.3, 12, 6 );
        var material = new THREE.MeshBasicMaterial( { color: color } );
        var sphere = new THREE.Mesh( geometry, material );
        // pointLight.add( sphere );
        return pointLight
    }




    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(){
        // this.time = 0.0;
        // this.noise = new SimplexNoise();


        // シーンを作る
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0xffffff, 0.001 );
        this.renderer.setClearColor({color:0xffffff});

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 1;
        // this.camera.position.y = 20;





        // **************** Objects setup ***************** //

        let pointMatrixGeometry = new THREE.BufferGeometry();
        let _width = 6;
        let _height =6;
        let _depth = 6;
        let particles = _width*_height*_depth;


        let planeGeo = new PlaneBufferGeometry(1500,1500,8,8);

        var quat = new THREE.Quaternion();

        // ベクトル(1,1,1) を回転軸とする (※正規化も実施)
        var axis = new THREE.Vector3(1,0,0).normalize();

        // 回転角は90°とする
        var angle = Math.PI / 2;

        // 回転軸axis と角度angle からクォータニオンを計算
        quat.setFromAxisAngle(axis,angle);

        let pos = planeGeo.getAttribute("position");
        let originalPos = pos.array;
        console.log(pos);

        let depthCounter = 10;

        let positions = new Float32Array( originalPos.length * depthCounter );
        let colors = new Float32Array( particles * 3 );

        // let xStep = 10;
        // let zStep = 2;
        // let yStep = 20;
        // let zCounter = 0;
        // let xCounter = 0;
        // let yCounter = 0;
        // let color = new THREE.Color();
        // let n = 1000, n2 = n / 2;
        let counter = 0;
        for ( var i = 1; i <= depthCounter; i++ ) {
            for(let j = 0; j < originalPos.length; j+=3)
            {
                positions[counter++] =   originalPos[j];
                positions[counter++] = originalPos[j+1];
                positions[counter++] = originalPos[j+2] + i * -120;

            }
        }

        // pointMatrixGeometry.addAttribute("position", pos );
        pointMatrixGeometry.addAttribute("position", new THREE.BufferAttribute( positions,3 ) );
        pointMatrixGeometry.computeBoundingBox();

        var textureLoader = new THREE.TextureLoader();
        var mapCircle = textureLoader.load( 'texture/circle.png' );

        var material = new THREE.PointsMaterial( {
            size: 5,
            transparent:true,
            color: 0x000000,
            map : mapCircle
        } );
        let points = new THREE.Points( pointMatrixGeometry, material );
        this.scene.add( points );


        let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    }


    public getSpherePosition(radius:number)
    {

        //(r sinsθ cosΦ, r cosθ, r sinθ sinΦ)

        let theta = Math.random()*Math.PI*2;
        let phi = Math.random()*Math.PI*2;
        let x = radius * Math.sin(theta)*Math.cos(phi);
        let y = radius * Math.cos(theta);
        let z = radius * Math.sin(theta)*Math.sin(phi);

        return new THREE.Vector3(x,y,z);
    }

        private snoiseVec3( x:THREE.Vector3 ){

        let s  = this.noise.noise3D( x.x,x.y,x.z );
        let s1 = this.noise.noise3D( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 );
        let s2 = this.noise.noise3D( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 );
        let c = new THREE.Vector3( s , s1 , s2 );
        return c;

    }

    private curlNoise( p:THREE.Vector3 ,time)
    {

        let e = 0.1;
        let dx = new THREE.Vector3( e   , 0.0 , 0.0 );
        let dy = new THREE.Vector3( 0.0 , e   , 0.0 );
        let dz = new THREE.Vector3( 0.0 , 0.0 , e   );


        var _p  = new THREE.Vector3(p.x,p.y,p.z).sub(dx);
        let p_x0 = this.snoiseVec3( _p);

        _p  = new THREE.Vector3(p.x,p.y,p.z).add(dx);
        let p_x1 = this.snoiseVec3( _p );

        _p = new THREE.Vector3(p.x,p.y,p.z).sub(dy);
        let p_y0 = this.snoiseVec3( _p );

        _p = new THREE.Vector3(p.x,p.y,p.z).add(dy);
        let p_y1 = this.snoiseVec3( _p );

        _p = new THREE.Vector3(p.x,p.y,p.z).sub(dz);
        let p_z0 = this.snoiseVec3( _p );

        _p = new THREE.Vector3(p.x,p.y,p.z).add(dz);
        let p_z1 = this.snoiseVec3( _p );

        let x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
        let y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
        let z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

        //console.log(p_z0);
        let divisor = 1.0 / ( 2.0 * e );
        let noisevec = new THREE.Vector3( x , y , z );
        noisevec.multiplyScalar(divisor);
        return noisevec;

    }

    public keyDown(keycode)
    {
        // if(keycode.key == "s")
        // {
        //     console.log("stop");
        // }

    }

    public keyUp(e:KeyboardEvent)
    {

    }

    // ワンフレームごとの処理
    public update() {

         this.renderer.setClearColor(0xffffff);

    }





}


