/// <reference path="typings/index.d.ts" />

class ShadowBoxs{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private timer:number = 0;
    private renderer:THREE.WebGLRenderer;
    private objs:THREE.Mesh[] = [];
    private  group:THREE.Group;
    private rotations:THREE.Vector3[] = [];
    private planeGeo:THREE.PlaneGeometry;
    private noise:Object;
    private time:number;
    private pointLight:THREE.PointLight;
    private pointLight2:THREE.PointLight;
    private torusKnot:THREE.Mesh;

    private objs:THREE.Group[] = [];
    private  group:THREE.Group;
    private rotations:THREE.Vector3[] = [];
    private planeGeo:THREE.PlaneGeometry;
    private noise:Object;
    private timer:number;
    private tetValues:Object[] = [];
    private vec:THREE.Vector3[] = [];
    private rotate:THREE.Vector3[] = [];
    private limitDist:number = 60;

    private pointLight01:THREE.PointLight;
    private pointLight02:THREE.PointLight;

    private isSlowDown:boolean = false;

    private speed:number = 0.0;
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
        this.time = 0.0;
        this.noise = new SimplexNoise();

        // シーンを作る
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0x9400ff, 0.003 );
        this.renderer.setClearColor(this.scene.fog.color);

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 10;
        this.camera.position.y = 10;



        // let spotLight = new THREE.SpotLight( 0xffffff,0.3 );
        // spotLight.name = 'Spot Light';
        // spotLight.angle = Math.PI / 5;
        // spotLight.penumbra = 0.3;
        // spotLight.position.set( 0, 200, 0 );
        // spotLight.castShadow = true;
        // spotLight.shadow.camera.near = 8;
        // spotLight.shadow.camera.far = 100;
        // spotLight.shadow.mapSize.width = 1024*2;
        // spotLight.shadow.mapSize.height = 1024*2;
        // this.scene.add( spotLight );
        this.pointLight01 = this.createLight( 0xfaff6b );
        this.pointLight01.position.set(30,30,0);
        this.scene.add( this.pointLight01 );
        // this.scene.add( pointLight2 );



        this.pointLight02 = this.createLight( 0x6bf0ff );
        this.pointLight02.position.set(-30,30,0);
        this.scene.add( this.pointLight02 );
        // let pointLight2 = this.createLight( 0xff0000 );
        //
        let dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.name = 'Dir. Light';
        dirLight.position.set( 0, 100, 0 );
        // dirLight.castShadow = true;
        // dirLight.shadow.camera.near = 1;
        // dirLight.shadow.camera.far = 1000;
        // dirLight.shadow.camera.right = 15;
        // dirLight.shadow.camera.left = - 15;
        // dirLight.shadow.camera.top	= 15;
        // dirLight.shadow.camera.bottom = - 15;
        // dirLight.shadow.mapSize.width = 1024*2;
        // dirLight.shadow.mapSize.height = 1024*2;
        // this.scene.add( dirLight );

        let ambLight = new THREE.AmbientLight(0xffffff,0.5);
        this.scene.add(ambLight);



        // var geometry = new THREE.BoxBufferGeometry( 1, 1, 1, 2,2,2 );
        // var material = new THREE.MeshPhongMaterial( {
        //     color: 0xff0000,
        //     shininess: 100,
        //     specular: 0xeaeaea
        // } );
        // this.torusKnot = new THREE.Mesh( geometry, material );
        // this.torusKnot.position.set( 0, 0, 0 );
        // this.torusKnot.castShadow = true;
        // this.torusKnot.receiveShadow = true;
        // // this.scene.add( this.torusKnot );
        //
        this.planeGeo = new THREE.PlaneGeometry(1000,1000,2,2);
        var material = new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            // shininess: 10,
            // specular: 0xd8d4e1,
            // shading: THREE.SmoothShading
        } );
        var receiveshadowmesh = new THREE.Mesh( this.planeGeo, material );
        receiveshadowmesh.rotateX(-Math.PI/2);
        receiveshadowmesh.position.y = 0.1;
        receiveshadowmesh.receiveShadow = true;
        // this.scene.add( receiveshadowmesh );

        let clipping = new THREE.Plane(new THREE.Vector3(0,1,0),0);
        // this.renderer.clippingPlanes.push(clipping);


        // let clipping02 = new THREE.Plane(new THREE.Vector3(0,-1,0),30);
        // clipping02.position.set(0,20,0);
        // this.renderer.clippingPlanes.push(clipping02);

        this.planeGeo = new THREE.PlaneGeometry(1000,1000,300,300);
        let planematerial = new THREE.MeshLambertMaterial({
            color:0x9400ff,
            shininess: 10,
            specular: 0x9400ff,
            side:THREE.DoubleSide,
            // shading:THREE.FlatShading,

        });



        let planemesh = new THREE.Mesh(this.planeGeo,planematerial);
        planemesh.rotateX(-Math.PI/2);
        planemesh.position.set(0,0.1,0);
        planemesh.receiveShadow = true;
        this.scene.add(planemesh);


        var geometry = new THREE.PlaneGeometry( 10, 10);
        var material = new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            // shininess: 10,
            // specular: 0x111111,
            side: THREE.DoubleSide
        } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.rotateX(-Math.PI/2);
        mesh.position.set(0,-20,0);
        mesh.receiveShadow = true;
        // this.scene.add( mesh );


        for(var i = 0; i < this.planeGeo.vertices.length;i++)
        {
            let dist =this.planeGeo.vertices[i].distanceTo(new THREE.Vector3(0,0,0));
            // console.log(dist);
            // console.log(dist/ 720);
        }


        this.group = new THREE.Group();
        let radian = 0.0;
        let _radius = 10;
        let radius = 60;
        for(var i = 0; i < 300; i++) {

            let tetGeometry = new THREE.SphereBufferGeometry(2,20,20);
            let tetMaterial = new THREE.MeshLambertMaterial({
                color:0x9400ff,
                shading:THREE.FlatShading,
                transparent:true,
                // opacity:0.2
            });

            //(r sinsθ cosΦ, r cosθ, r sinθ sinΦ)

            let tetMesh = new THREE.Mesh(tetGeometry, tetMaterial);

            radian += 0.1+Math.random()*0.1;
            let vec3 = this.getSpherePosition(Math.random()*this.limitDist);
            let x = Math.random()*100 -50;//vec3.x;
            let z = Math.random()*this.limitDist -1;vec3.y;//Math.sin(radian)*radius;
            let y = Math.random()*100 -50;//vec3.z;//Math.sin(Math.random()*Math.PI*2) * 2;
            tetMesh.position.set(x,y,z);

            var r = new THREE.Vector3(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2);
            this.rotations.push(r);
            tetMesh.rotation.set(r.x,r.y,r.z);
            tetMesh.castShadow = true;


            // tetMesh.receiveShadow = true;

            this.vec.push(new THREE.Vector3(x,y,z).normalize());
            this.rotate.push(new THREE.Vector3(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2));
            this.objs.push(tetMesh);
            this.group.add(tetMesh);

            this.tetValues.push({
                radian:radian,
                radius:radius,
                pos:tetMesh.position

            })
        }

        // this.group.rotateZ(0.6);
        // this.group.rotateX(0.3);
        this.scene.add(this.group);



        // let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
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

        // console.log(keycode);
        if(keycode.key == "s")
        {
            console.log("stop");
            this.isSlowDown = true;
        }

    }

    public keyUp(e:KeyboardEvent)
    {

        this.isSlowDown = false;
    }

    // ワンフレームごとの処理
    public update() {

        this.renderer.setClearColor(0x9400ff);

        let rad = 100;

        if(this.isSlowDown)
        {
            this.speed = 0.001;

        } else {
            this.speed = 0.02;

        }

        this.time += this.speed;


        let noiseSpeed = 10;





        for(let i = 0; i < this.objs.length; i++)
        {



            let pos = this.objs[i].position;
            let speed = 0.01;
            let vector = new THREE.Vector3(this.vec[i].x,this.vec[i].y,this.vec[i].z);
            // vector.multiplyScalar(0.1);
            pos.add(vector.normalize().multiplyScalar(this.speed));

            let noiseScale = 0.02;// + Math.random()*0.05;
            let noiseValueX = this.noise.noise3D(pos.x*noiseScale,pos.z*noiseScale,this.time+0.1365143);
            let noiseValueY = this.noise.noise3D(pos.y*noiseScale,pos.x*noiseScale,this.time+1.21688);
            let noiseValueZ = this.noise.noise3D(pos.z*noiseScale,pos.y*noiseScale,this.time+2.5564);

            let noiseVec = new THREE.Vector3(noiseValueX,noiseValueY,noiseValueZ);

            noiseVec.y = 1.0;
            pos.add(noiseVec.multiplyScalar(this.speed*10));


            let dist = pos.distanceTo(new THREE.Vector3(0,0,0));
            //let maxDist = pos.distanceTo(new THREE.Vector3(0,0,0));

            if(dist > this.limitDist)
            {
                let newpos = this.getSpherePosition(Math.random()*6);

                let x = Math.random()*90 -45;//vec3.x;
                let z = Math.random()*90 -45;//vec3.y;//Math.sin(radian)*radius;
                let y = Math.random()*-1;//vec3.z;//Math.sin(Math.random()*Math.PI*2) * 2;

                pos.set(x,y,z);

                this.vec[i] = new THREE.Vector3(pos.x,pos.y,pos.z);
            }

            let scale = (1.0 - dist/this.limitDist)*0.7;

            let c = Math.max(Math.floor((1.0 - dist/this.limitDist)*255),255);
            let g = Math.floor(c*0.5);
            // console.log(c);

            // console.log("rgb(" + c + "," + "0.0" + "," + c + ")");
            // this.objs[i].material.color.set(
            //     new THREE.Color("rgb(" + c + "," + g + "," + c + ")")
            //     );

            this.objs[i].scale.set(scale,scale,scale);

            // this.rotate[i].x += this.rotate[i].x*0.002;
            // this.rotate[i].y += this.rotate[i].y*0.002;
            // this.rotate[i].z += this.rotate[i].z*0.002;

            this.objs[i].rotation.set(this.rotate[i].x*2,this.rotate[i].y*2,this.rotate[i].z*2);



        }
        //
        // let x = 0.0;
        // let y = 0.0;
        // let z = 0.0;
        // for(var i = 0; i < this.rotations.length; i++)
        // {
        //     this.rotations[i].x += 0.003;
        //     this.rotations[i].y += 0.003;
        //     this.rotations[i].z += 0.003;
        //
        //     this.objs[i].rotation.set(this.rotations[i].x,this.rotations[i].y,this.rotations[i].z);
        //
        //     this.tetValues[i].radian += 0.002;
        //
        //     let radisu  = 100+Math.random()*100;
        //
        //     x = Math.cos(this.tetValues[i].radian)*radisu;
        //     z = Math.sin(this.tetValues[i].radian)*radisu;
        //     y = Math.sin(Math.random()*Math.PI*2) * 10;
        //
        //     this.objs[i].position.x = x;
        //     this.objs[i].position.z = z;
        //
        //
        //
        //     var noise = this.noise.noise3D(this.objs[i].position.x*0.04,this.objs[i].position.y*0.04,this.time*0.04+this.objs[i].position.z*0.04);
        //
        //     this.objs[i].position.y = noise*4;
        //
        //
        // }


        // this.renderer.setClearColor(this.scene.fog.color);

        this.time += 0.003;
        //
        for(var i = 0; i < this.planeGeo.vertices.length;i++)
        {
            let vert = this.planeGeo.vertices[i];
            var value = this.noise.noise3D(vert.x*0.01,vert.y*0.01,this.time * 0.1);

            let dist =this.planeGeo.vertices[i].distanceTo(new THREE.Vector3(0,0,0));
            let height =  0.9-dist/720;
            // console.log(height);
            // this.planeGeo.vertices[i].z = value + height;
            this.planeGeo.vertices[i].z = value *20;
        }
        this.planeGeo.verticesNeedUpdate = true;


        let camX = Math.cos(this.time*0.5) * 30;
        let camZ = Math.sin(this.time*0.5) * 30;
        let camY = 60 + Math.sin(this.time*0.8)*30;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.camera.position.set(camX,camY,camZ)


        this.pointLight02.position.z = Math.cos(this.time) * 10;
        this.pointLight02.position.x = Math.sin(this.time) * 10;


        this.pointLight01.position.z = Math.cos(this.time+Math.PI) * 10;
        this.pointLight01.position.x = Math.sin(this.time+Math.PI) * 10;

    }





}


