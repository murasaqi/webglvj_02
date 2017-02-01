/// <reference path="typings/index.d.ts" />

class TetTest{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private Box:THREE.Mesh;
    private timer:number = 0;
    private renderer:THREE.WebGLRenderer;
    private objs:THREE.Mesh[] = [];
    private  group:THREE.Group;
    private rotations:THREE.Vector3[] = [];
    private planeGeo:THREE.PlaneGeometry;
    private noise:Object;
    private time:number;

    private tetValues:Object[] = [];

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
        this.scene.fog = new THREE.FogExp2( 0xf98989, 0.002 );
        this.renderer.setClearColor(this.scene.fog.color);

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 100;
        this.camera.position.y = 20;

        let light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        this.scene.add( light );
        let light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( -1, -1, -1 );
        this.scene.add( light );

        let light = new THREE.SpotLight( 0xf8ffc0,1.0 );
        light.position.set( 0, 100, 0 );
        this.scene.add( light );

        let light = new THREE.SpotLight( 0xffffff,1.0 );
        light.position.set( 0, 90, 0 );
        this.scene.add( light );


        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( -1, -1, -1 );
        this.scene.add( light );

        // light = new THREE.AmbientLight( 0xffffff );
        // this.scene.add( light );


        this.group = new THREE.Group();


        let radian = 0.0;
        let _radius = 150;
        let radius = 150;
        for(var i = 0; i < 50; i++) {

            let tetGeometry = new THREE.CylinderGeometry( 0, 18+10*Math.random()-5, 27+10*Math.random()-5, 4, 1 );
            let tetMaterial = new THREE.MeshLambertMaterial({
                color:0xffffff,
                shading:THREE.FlatShading
            });

            radius = _radius +Math.random()*100 - 50;

            let tetMesh = new THREE.Mesh(tetGeometry, tetMaterial);

            radian += 0.1+Math.random()*0.1;
            let x = Math.cos(radian)*radius;
            let z = Math.sin(radian)*radius;
            let y = Math.sin(Math.random()*Math.PI*2) * 10;
            tetMesh.position.set(x,y,z);

            var r = new THREE.Vector3(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2);
            this.rotations.push(r);
            tetMesh.rotation.set(r.x,r.y,r.z);

            this.objs.push(tetMesh);
            this.group.add(tetMesh);

            this.tetValues.push({
                radian:radian,
                radius:radius,
                pos:tetMesh.position

            })
        }

        this.group.rotateZ(0.6);
        this.group.rotateX(0.3);
        // this.scene.add(this.group);


        this.planeGeo = new THREE.PlaneGeometry(5000,5000,20,20);
        // let planeMat = new THREE.MeshLambertMaterial({
        //     color:0xffe912,
        //     wireframe:false,
        //     side:THREE.DoubleSide,
        //     transparent:true,
        //
        //     shininess: 35,
        //     specular: 0xffffff,
        //     shading: THREE.SmoothShading,
        //     blending:THREE["MultiplyBlending"]
        // });

        var planeMat = new THREE.MeshPhongMaterial( {
            color: 0xff5b32,
            shininess: 5,
            specular: 0xf8ffc0,
            shading: THREE.SmoothShading,
            side:THREE.DoubleSide,
            transparent:true,
            blending:THREE["MultiplyBlending"]
        } );

        let planeMesh = new THREE.Mesh(this.planeGeo,planeMat);
        this.scene.add(planeMesh);

        planeMesh.position.y = -40;
        planeMesh.rotateX(Math.PI/2);
        let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );


        // let planeMat_wire = new THREE.MeshLambertMaterial({
        //     color:0x000000,
        //     wireframe:true,
        //     side:THREE.DoubleSide,
        //     transparent:true,
        //     opacity:0.7,
        //     blending:THREE["MultiplyBlending"]
        // });
        // let planeMesh_wire = new THREE.Mesh(this.planeGeo,planeMat_wire);
        // planeMesh_wire.rotateX(-Math.PI/2);
        // planeMesh_wire.position.z = -10;
        // this.scene.add(planeMesh_wire);

    }


    // ワンフレームごとの処理
    public update() {

        for(var i = 0; i < this.rotations.length; i++)
        {
            this.rotations[i].x += 0.001;
            this.rotations[i].y += 0.001;
            this.rotations[i].z += 0.001;

            this.objs[i].rotation.set(this.rotations[i].x,this.rotations[i].y,this.rotations[i].z);

            this.tetValues[i].radian += 0.001;
            let radisu  =Math.sin(this.timer*100)*100 + this.tetValues[i].radius;

            let x = Math.cos(this.tetValues[i].radian)*radisu;
            let z = Math.sin(this.tetValues[i].radian)*radisu;
            // let y = Math.sin(Math.random()*Math.PI*2) * 10;

            this.objs[i].position.x = x;
            this.objs[i].position.z = z;



            var noise = this.noise.noise3D(this.objs[i].position.x*0.01,this.objs[i].position.y*0.01,this.time*0.01+this.objs[i].position.z*0.01);

            this.objs[i].position.y = noise*20;


        }




        this.time += 0.003;

        for(var i = 0; i < this.planeGeo.vertices.length;i++)
        {
            let vert = this.planeGeo.vertices[i];
            var value = this.noise.noise3D(vert.x*0.5,vert.y*0.5,this.time);
            this.planeGeo.vertices[i].z = value*30.0;
        }
        this.planeGeo.verticesNeedUpdate = true;
    }


}


