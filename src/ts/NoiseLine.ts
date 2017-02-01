/// <reference path="typings/index.d.ts" />

class NoiseLine{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private timer:number = 0;
    private renderer:THREE.WebGLRenderer;
    private noise:Object;
    private time:number;

    private lineGeo:THREE.BufferGeometry;

    private positions:Float32Array;
    private indices_array:number[] = [];
    private colors:Float32Array;

    constructor(renderer:THREE.WebGLRenderer) {

        // renderer.setClearColor(0xffffff);
        this.renderer = renderer;
        this.createScene();
    }

    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(){

        this.time = 0.0;
        this.noise = new SimplexNoise();

        // シーンを作る
        this.scene = new THREE.Scene();
        // this.scene.fog = new THREE.FogExp2( 0xf98989, 0.002 );
        // this.renderer.setClearColor(this.scene.fog.color);s

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 100;
        this.camera.position.y = 20;

        this.renderer.setClearColor(new THREE.Color(0x000000));
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.shadowMap.enabled = true;

        let light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        this.scene.add( light );
        let light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( -1, -1, -1 );
        this.scene.add( light );
        //
        // let light = new THREE.SpotLight( 0xf8ffc0,1.0 );
        // light.position.set( 0, 100, 0 );
        // this.scene.add( light );
        //
        // let light = new THREE.SpotLight( 0xffffff,1.0 );
        // light.position.set( 0, 90, 0 );
        // this.scene.add( light );
        //
        //
        // light = new THREE.DirectionalLight( 0xffffff );
        // light.position.set( -1, -1, -1 );
        // this.scene.add( light );

        let amblight = new THREE.AmbientLight( 0xffffff );
        this.scene.add( amblight );



        //
        // for (let i = 0; i < 100; i{{}}) {
        //     if (next_positions_index == 0xffff) throw new Error("Too many points");
        //
        //     return next_positions_index++;
        // }


        this.lineGeo = new THREE.BufferGeometry();






        let yStep = 11;
        let lineSize = 10;
        for(let y = 0; y < lineSize; y++)
        {

            // let _y = yStep *  y - (yStep/2) * lineSize;
            let _y = 50 * Math.cos(Math.PI*2/lineSize*y - Math.PI);

            let geometry = new THREE.BufferGeometry();
            let size = 300;

            let material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors,
                linewidth:2});
            this.positions = new Float32Array( size * 3 );
            this.colors = new Float32Array( size * 3 );

            let r = 50*Math.sin(Math.PI/(lineSize-1) * y);

            let count = 0;
            let timer = 0.0;
            let radiusRange = r/15;

            for ( var i = 0; i < size; i ++ ) {

                timer += 0.01 + _y*0.01;

                let noiseScale = 0.05;
                if(i != 0){
                    r = 50*Math.sin(Math.PI/(lineSize-1) * y) + radiusRange* this.noise.noise3D
                        (
                            this.positions[ (i-1) * 3 ]*noiseScale,
                            timer,
                            this.positions[ (i-1) * 3 ]*noiseScale
                        );
                } else {
                    r = 50*Math.sin(Math.PI/(lineSize-1) * y) + radiusRange* this.noise.noise3D
                        (
                            0,
                            timer,
                            0
                        );

                }


                let offsetRad = Math.PI*2 /(size-1)*i;
                var x = Math.cos(offsetRad) * r;
                var height = _y;//Math.random() * r - r / 2;
                var z = Math.sin(offsetRad) * r;//Math.random() * r - r / 2;


                // positions
                this.positions[ count * 3 ] = x;
                this.positions[ count * 3 + 1 ] = height;
                this.positions[ count * 3 + 2 ] = z;
                // colors
                this.colors[ count * 3 ] = 1.0;
                this.colors[ count * 3 + 1 ] = 1.0;
                this.colors[ count * 3 + 2 ] = 1.0;

                count++;
            }




            // positions
            this.positions[ count * 3 ] = this.positions[0] ;
            this.positions[ count * 3 + 1 ] = this.positions[1] ;
            this.positions[ count * 3 + 2 ] = this.positions[2] ;
            // colors
            this.colors[ count * 3 ] = 1.0;
            this.colors[ count * 3 + 1 ] = 1.0;
            this.colors[ count * 3 + 2 ] = 1.0;



            // this.lineGeo.setIndex( new THREE.BufferAttribute( new Uint16Array( this.indices_array ), 1 ) );
            geometry.addAttribute( 'position', new THREE.BufferAttribute( this.positions , 3 ) );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( this.colors , 3 ) );
            geometry.computeBoundingSphere();

            let mesh = new THREE.Line(geometry, material);
            this.scene.add(mesh);

        }


        //
        // this.tubeGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),10,3,10,false);
        // // this.scene.add(tubeGeometry);
        // let meshMaterial = new THREE.MeshNormalMaterial({
        //     transparent: true,
        //     opacity: 0.7
        // });
        //
        // //  meshMaterial.side = THREE.DoubleSide;
        // let wireFrameMat = new THREE.MeshBasicMaterial();
        // wireFrameMat.wireframe = true;
        //
        // // create a multimaterial
        // let mesh = THREE.SceneUtils.createMultiMaterialObject(this.tubeGeometry, [meshMaterial]);
        // this.scene.add(mesh);
        //
        //
        // console.log(this.tubeGeometry);
        //
        let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    //



    }


    // ワンフレームごとの処理
    public update() {

        // for(var i = 0; i < this.rotations.length; i++)
        // {
        //     this.rotations[i].x += 0.001;
        //     this.rotations[i].y += 0.001;
        //     this.rotations[i].z += 0.001;
        //
        //     this.objs[i].rotation.set(this.rotations[i].x,this.rotations[i].y,this.rotations[i].z);
        //
        //     this.tetValues[i].radian += 0.001;
        //     let radisu  =Math.sin(this.timer*100)*100 + this.tetValues[i].radius;
        //
        //     let x = Math.cos(this.tetValues[i].radian)*radisu;
        //     let z = Math.sin(this.tetValues[i].radian)*radisu;
        //     // let y = Math.sin(Math.random()*Math.PI*2) * 10;
        //
        //     this.objs[i].position.x = x;
        //     this.objs[i].position.z = z;
        //
        //
        //
        //     var noise = this.noise.noise3D(this.objs[i].position.x*0.01,this.objs[i].position.y*0.01,this.time*0.01+this.objs[i].position.z*0.01);
        //
        //     this.objs[i].position.y = noise*20;
        //
        //
        // }




        this.time += 0.003;

        // for(var i = 0; i < this.planeGeo.vertices.length;i++)
        // {
        //     let vert = this.planeGeo.vertices[i];
        //     var value = this.noise.noise3D(vert.x*0.5,vert.y*0.5,this.time);
        //     this.planeGeo.vertices[i].z = value*30.0;
        // }
        // this.planeGeo.verticesNeedUpdate = true;
    }


}


