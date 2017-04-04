

class NoiseWaveLogo {

    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private geometry: THREE.PlaneGeometry;

    private timer:number = 0.0;
    private timer_camera:number = 0.0;

    public UPDATE:boolean = true;
    private normalMap;
    private cameraRotateRad:number = 2;
    private map:any[] = [];
    private displacementMap;
    private simplex:Object;
    private originalVertex:THREE.Vector3[] = [];
    private velocity:number = 1.0;
    private acceleration:number = 1.0;
    private isCameraUpdate:boolean = false;
    private image:THREE.Mesh;
    private cameraFov:number = 75;
    private textureCounter:number = 0;

    private randomNoiseSeed:number = 0.0;

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


    private createScene(){

        this.randomNoiseSeed = Math.random()*0.4-0.02;


        this.simplex = new SimplexNoise();
        // シーン (空間) を作成
        this.scene = new THREE.Scene();

        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var textureLoader = new THREE.TextureLoader();



        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000,-500,3000);

        var ambient = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambient);


        var light = new THREE.SpotLight( 0xffffff );
        light.position.set( 0, 1000, 0 );
        light.castShadow = true;

        light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 400, 20000 ) );
        light.shadow.bias = - 0.00022;
//
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        // this.scene.add(light);


        var light02 = new THREE.SpotLight( 0xffffff,0.4 );
        light02.position.set( 0, 10, 0 );
        // this.scene.add(light02);



        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.name = 'Dir. Light';
        dirLight.position.set( 0, 100, 0 );
        this.scene.add(dirLight);


        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );


        this.camera.position.z = this.cameraRotateRad;



        this.map.push(textureLoader.load( "texture/logo.jpg" ));
        this.map.push(textureLoader.load( "texture/doge.jpg" ));
        // this.map.push(textureLoader.load( "texture/IMG01.JPG" ));
        // this.map.push(textureLoader.load( "texture/IMG06.JPG" ));
        // this.map.push(textureLoader.load( "texture/IMG07.JPG" ));
        // this.map.push(textureLoader.load( "texture/IMG08.JPG" ));


        let size = 6.0;
        let mesh = 60;
        this.geometry = new THREE.PlaneGeometry(size,0.6576*size,mesh,mesh);
        var planeMaterial = new THREE.MeshStandardMaterial({
            color:0xffffff,
            map:this.map[0],
            side: THREE.DoubleSide
        });

        this.image = new THREE.Mesh(this.geometry,planeMaterial);
        this.scene.add(this.image);


        console.log(this.geometry);
        let array = this.geometry.vertices;
        for (let i = 0; i < array.length; i++) {
            let vertex = new THREE.Vector3(array[i].x,array[i].y,array[i].z);
            this.originalVertex[i] = vertex;
        }


    }

    public keyDown(e:KeyboardEvent)
    {

        if(e.key == 't')
        {
            this.textureCounter++;

            if(this.textureCounter >= this.map.length)
            {
                this.textureCounter = 0;
            }

            this.image.material.map = this.map[this.textureCounter];
            this.image.material.needsUpdate = true;
        }
        if(e.key == "r")
        {

            this.timer_camera = 0;
            this.isCameraUpdate = 0;
            // this.image.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2);
            this.image.rotation.set(0,0,0);
            console.log("down");
            let array = this.geometry.vertices;
            for (let i = 0; i < array.length; i++) {
                array[i].x = this.originalVertex[i].x;
                array[i].y = this.originalVertex[i].y;
                array[i].z = this.originalVertex[i].z;
            }

            this.geometry.verticesNeedUpdate = true;
            this.geometry.normalsNeedUpdate = true;


            this.randomNoiseSeed = Math.random()*0.9-0.3;
            console.log(this.randomNoiseSeed);
            if(Math.random() < 0.5)
            {
                this.velocity = -1;
            } else {
                this.velocity = 1.0;
            }
        }

        if(e.key == 'c')
        {
            this.isCameraUpdate = !this.isCameraUpdate;
        }

        if(e.key == "v")
        {
                this.velocity *= -1;
        }

        if(e.key == 'f')
        {
            let pre = this.camera.fov;
            while (Math.abs(pre- this.cameraFov) < 60)
            {
                this.cameraFov =  75 + Math.random()*150 - 75;
            }
        }

        if(e.key == "a")
        {
            if(this.acceleration == 1.0)
            {
                this.acceleration = 4.0;
            } else {
                this.acceleration = 1.0;
            }
        }

    }


    public onWindowResize() {

    }

    public endEnabled()
    {
        this.UPDATE = false;
    }

    private snoiseVec3( x:THREE.Vector3 ){

        let s  = this.simplex.noise3D( x.x,x.y,x.z );
        let s1 = this.simplex.noise3D( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 );
        let s2 = this.simplex.noise3D( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 );
        let c = new THREE.Vector3( s , s1 , s2 );
        return c;

    }

    private curlNoise( p:THREE.Vector3,time:number)
    {

        let e = 0.1+this.randomNoiseSeed;
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

        let divisor = 1.0 / ( 2.0 * e );
        let noisevec = new THREE.Vector3( x , y , z );
        noisevec.multiplyScalar(divisor);
        return noisevec;

    }


    public update() {
        this.renderer.setClearColor(0xffffff,0.0);

        let array = this.geometry.vertices;
        let date = new Date();
        this.timer += Math.abs(this.simplex.noise3D( date.getMilliseconds()*0.1,date.getMinutes()*0.05,date.getHours()*0.01 ))*2.0;


        let time = Math.abs(Math.sin(this.timer));
        // this.noise.noise3D(this.objs[i].position.x*0.04,this.objs[i].position.y*0.04,this.time*0.04+this.objs[i].position.z*0.04);
        for (let i = 0; i < array.length; i++) {
            let scale = this.randomNoiseSeed;
            let seed = new THREE.Vector3(array[i].x * scale, array[i].y * scale, array[i].z * scale, time);

            let noiseVec:THREE.Vector3 = this.curlNoise(seed);
            array[i].x += Math.cos(noiseVec.x) * 0.01*time*this.velocity*this.acceleration;
            array[i].y += Math.sin(noiseVec.y) * 0.01*time*this.velocity*this.acceleration;
            array[i].z += Math.sin(noiseVec.z) * 0.01*time*this.velocity*this.acceleration;
        }

        this.geometry.verticesNeedUpdate = true;
        this.geometry.normalsNeedUpdate = true;

        this.camera.fov += (this.cameraFov - this.camera.fov) * 0.1;
        this.camera.updateProjectionMatrix();

        // this.camera.position.x
        if(this.isCameraUpdate)
        {
            this.image.rotateY(0.01);
            this.timer_camera += 0.01;

            this.image.rotateX(0.01*Math.sin(this.timer_camera));

            this.camera.position.z = this.cameraRotateRad + 1 * Math.sin(this.timer_camera);
            // this.camera.position.x = Math.sin(this.timer_camera +Math.PI/2) * this.cameraRotateRad;
            // this.camera.position.z = Math.cos(this.timer_camera +Math.PI/2) * this.cameraRotateRad;
        }


    }



}

