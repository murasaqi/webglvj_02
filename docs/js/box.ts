

class FloatingBox {

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private geometry: THREE.Geometry;
    private material: THREE.Material;
    private cube: THREE.Mesh;
    private objs:any[] = [];

    private timer:number = 0.0;
    private objects:THREE.Mesh[] = [];
    private radius:number = 400;
    private position_origin:number[] = [];
    private animateVector:THREE.Vector3[] = [];
    private pre_sec;
    private cameraNextPos:THREE.Vector3;
    private cameraNextLookAt:THREE.Vector3;
    private cameraLookAt:THREE.Vector3;
    public UPDATE:boolean = true;
    private normalMap;
    private map;
    private displacementMap;
    private simplex:Object;

    private settings:Object = {
        metalness: 0.1,
        roughness: 0.2,
        ambientIntensity: 0.1,
        aoMapIntensity: 1.0,
        envMapIntensity: 1.0,
        displacementScale: 2.436143, // from original model
        normalScale: 1.0
    };

    public END:boolean = false;

    constructor(renderer:THREE.WebGLRenderer) {

        // レンダラーを作成
        //this.createRenderer();
        // シーンを作成
        this.renderer = renderer;
        this.createScene();

    }
    public remove()
    {

        while(this.scene.children.length != 0)
        {
            this.scene.remove(this.scene.children[0]);
            if(this.scene.children[0] == THREE.Mesh){
                this.scene.children[0].geometry.dispose();
                this.scene.children[0].material.dispose();
            }
        };



    }

    private createRenderer(){


        // WebGL レンダラーを作成
        this.renderer = new THREE.WebGLRenderer();
        // サイズの設定
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.sortObjects = false;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;


        document.body.appendChild( this.renderer.domElement );


    }

    private createScene(){

        this.simplex = new SimplexNoise();
        this.scene = new THREE.Scene();

        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var textureLoader = new THREE.TextureLoader();



        var normalMap = textureLoader.load( "texture/nomalmap.png" );
        //var map = textureLoader.load( "textures/tilemap.png" );
        var displacementMap = textureLoader.load( "texture/bumpmap.jpg" );

        var cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            roughness: this.settings.roughness,
            metalness: this.settings.metalness,

            normalMap: normalMap,
            normalScale: new THREE.Vector2( 1, - 1 ), // why does the normal map require negation in this case?

            displacementMap: displacementMap,
            displacementScale: this.settings.displacementScale,
            displacementBias: - 0.428408, // from original model
        });

        this.material =  new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            roughness: this.settings.roughness,
            metalness: this.settings.metalness,

            normalMap: normalMap,
            normalScale: new THREE.Vector2( 1, - 1 ), // why does the normal map require negation in this case?

            displacementMap: displacementMap,
            displacementScale: this.settings.displacementScale,
            displacementBias: - 0.428408, // from original model
        });

        this.cube = new THREE.Mesh( this.geometry, cubeMaterial );
        this.scene.add( this.cube );

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000,-500,2500);

        var ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);


        var light = new THREE.SpotLight( 0xffffff );
        light.position.set( 0, 1000, 0 );
        light.castShadow = true;

        light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 400, 20000 ) );
        light.shadow.bias = - 0.00022;
//
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        this.scene.add(light);


        var light02 = new THREE.SpotLight( 0xffffff,0.4 );
        light02.position.set( 0, 10, 0 );
        this.scene.add(light02);



        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.name = 'Dir. Light';
        dirLight.position.set( 0, 100, 0 );
        this.scene.add(dirLight);


        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );


        this.camera.position.z = 1000;

        this.cameraNextPos = new THREE.Vector3(
            Math.random()*30-30,
            Math.random()*30-30,
            Math.random()*30-30+1000);

        this.cameraNextLookAt = new THREE.Vector3(
            Math.random()*30-30,
            Math.random()*30-30,
            Math.random()*30-30);
        this.cameraLookAt= new THREE.Vector3(
            Math.random()*40-20,
            Math.random()*40-20,
            Math.random()*40-40);


        var settings = {
            metalness: 0.1,
            roughness: 0.2,
            ambientIntensity: 0.1,
            aoMapIntensity: 1.0,
            envMapIntensity: 1.0,
            displacementScale: 2.436143, // from original model
            normalScale: 1.0
        };



        this.normalMap = textureLoader.load( "texture/comp/tilenormalmap.png" );
        this.map = textureLoader.load( "texture/comp/tilemap.png" );
        this.displacementMap = textureLoader.load( "texture/comp/tilehightmap.jpg" );


        var planeGeo = new THREE.PlaneGeometry(6000,6000,10,10);
        var planeMaterial = new THREE.MeshStandardMaterial({
            color:0xffffff,
            roughness: settings.roughness,
            metalness: settings.metalness,
            normalMap: this.normalMap,
            normalScale: new THREE.Vector2( 1, - 1 ), // why does the normal map require negation in this case?
            displacementMap: this.displacementMap,
            displacementScale: settings.displacementScale,
            displacementBias: - 0.428408, // from original model
            map:this.map,
            side: THREE.DoubleSide
        });
        var planeWireMaterial = new THREE.MeshPhongMaterial({
            color:0x000000,
            wireframe:true
        });

        planeGeo.rotateX(-Math.PI/2);
        var obj = new THREE.Mesh(planeGeo,planeMaterial);
        obj.position.y = -600;
        obj.position.z = 1000;
        obj.castShadow= true;
        obj.receiveShadow = true;
        this.scene.add(obj);
        var geometry = new THREE.BoxGeometry( 40, 40, 40 );
        var material = new THREE.MeshPhongMaterial( {
            color:  0x111111,
            // color:  0xffffff,
            specular: 0x555555,
            shininess: 10,
            shading:THREE.FlatShading
        } );



        for ( var i = 0; i < 700; i ++ ) {

            var theta = Math.random()*Math.PI*2;
            var phi = Math.random()*Math.PI*2;
            var object = new THREE.Mesh( geometry, this.material);
            object.position.x = Math.sin(theta) * Math.cos(phi) * this.radius;
            object.position.y = Math.cos(theta) * this.radius;
            object.position.z = Math.sin(theta) * Math.sin(phi) * this.radius;

            this.position_origin.push(new THREE.Vector3(object.position.x,object.position.y,object.position.z));
            vec = new THREE.Vector3(theta,phi,0);
            this.animateVector.push(vec);

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;
            object.castShadow = true;
            object.receiveShadow = true;

            this.scene.add( object );

            this.objects.push( object );

        }

        var points = [];
        for(var i = 0; i < 10; i++)
        {
            var randomx = -20 + Math.round(Math.random()*200);
            var randomy = -15 + Math.round(Math.random()*400);
            var randomz = -20 + Math.round(Math.random()*400);
            points.push(new THREE.Vector3(randomx,randomy,randomz));
        }

        console.log(this.scene);

        //window.addEventListener( 'resize', this.onWindowResize, false );

    }

    public onWindowResize() {

        // this.camera.aspect = window.innerWidth / window.innerHeight;
        // this.camera.updateProjectionMatrix();
        //
        // this.renderer.setSize( window.innerWidth, window.innerHeight );

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

        let s  = this.simplex.noise3D( x.x,x.y,x.z );
        let s1 = this.simplex.noise3D( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 );
        let s2 = this.simplex.noise3D( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 );
        let c = new THREE.Vector3( s , s1 , s2 );
        return c;

    }

    private curlNoise( p:THREE.Vector3)
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

    public endEnabled()
    {
        this.UPDATE = false;
    }


    public update()
    {
        this.renderer.setClearColor(this.scene.fog.color);

        //console.log(this.END);
        if(this.UPDATE == false)
        {
            //this.scene.remove(this.scene.children[0]);
            this.remove();
            if(this.scene.children.length == 0)
            {
                this.END = true;
            }

        }
        var date = new Date();

        if(this.cameraNextPos.distanceTo(this.camera.position) < 0.01) {


            var dist = 800;
            this.cameraNextPos = new THREE.Vector3(
                Math.random() * dist - dist / 2,
                Math.random() * dist - dist / 2,
                Math.random() *2000-1000
            );
            this.cameraNextLookAt= new THREE.Vector3(
                Math.random()*40-20,
                Math.random()*40-20,
                Math.random()*40-40);
        }


        this.timer += 0.01;


        for(var i = 0; i < this.objects.length; i++)
        {
            // this.objects[i].rotation.x += 0.01;
            // this.objects[i].rotation.y += 0.01;
            // this.objects[i].rotation.z += 0.01;
            // var _radius = 200 * Math.sin(this.timer) + this.radius;
            // this.animateVector[i].x += 0.01;
            // this.animateVector[i].y += 0.01;

            // this.objects[i].position.x = Math.sin(this.animateVector[i].x) * Math.cos(this.animateVector[i].y) * _radius;
            // this.objects[i].position.y = Math.cos(this.animateVector[i].x) * _radius;
            // this.objects[i].position.z = Math.sin(this.animateVector[i].x) * Math.sin(this.animateVector[i].y) * _radius;

            let p = this.objects[i].position;
            let scale = 0.001;
            let vec = this.curlNoise(new THREE.Vector3(p.x*scale,p.y*scale,p.z*scale));


            this.objects[i].position.x +=vec.x;
            this.objects[i].position.y +=vec.y;
            this.objects[i].position.z +=vec.z;

            let v = new THREE.Vector3(p.x,p.y,p.z);
            this.objects[i].position.add(v.normalize());

            let dist = this.objects[i].position.distanceTo(new THREE.Vector3(0,0,0));


            let maxDist = 700;
            if(dist <= maxDist)
            {
                this.objects[i].scale.set(1.0-dist/maxDist,1.0-dist/maxDist,1.0-dist/maxDist);
            } else {

                let newpos = this.getSpherePosition(10);
                newpos.x += Math.sin(this.timer*5) * this.radius;
                newpos.y += Math.cos(this.timer*3) * this.radius;
                newpos.z += Math.sin(this.timer*7) * this.radius;
                this.objects[i].position.set(newpos.x,newpos.y,newpos.z);

            }


        }


        var speed = 0.008;
        this.camera.position.x += (this.cameraNextPos.x-this.camera.position.x)*speed;
        this.camera.position.y += (this.cameraNextPos.y-this.camera.position.y)*speed;
        this.camera.position.z += (this.cameraNextPos.z-this.camera.position.z)*speed;

        this.cameraLookAt.x += (this.cameraNextLookAt.x-this.cameraLookAt.x)*speed;
        this.cameraLookAt.y += (this.cameraNextLookAt.y-this.cameraLookAt.y)*speed;
        this.cameraLookAt.z += (this.cameraNextLookAt.z-this.cameraLookAt.z)*speed;


        var lookat = new THREE.Vector3(
            this.cameraLookAt.x * Math.sin(this.timer),
            this.cameraLookAt.y * Math.sin(this.timer),
            this.cameraLookAt.z * Math.sin(this.timer)
        );

        this.camera.lookAt(lookat);

    }



    // public render(){
    //     this.renderer.render(this.scene, this.camera);
    //
    // }

}

