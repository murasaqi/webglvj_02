/// <reference path="typings/index.d.ts" />

// *********** ひとつめのシーン *********** //
class Scene05{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private timer:number = 0;
    private renderer:THREE.WebGLRenderer;
    private groups:THREE.Group[] = [];
    private simplex:Object;




    constructor(renderer:THREE.WebGLRenderer) {


        this.renderer = renderer;
        this.createScene();


    }

    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(){

        // シーンを作る
        this.scene = new THREE.Scene();

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 100;

        let ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);






        let dLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dLight.position.set(0,100,0);
        this.scene.add(dLight);


        let dLight02 = new THREE.DirectionalLight(0xffffff, 0.4);
        dLight02.position.set(0,0,100);
        this.scene.add(dLight02);




        let material = new THREE.MeshPhongMaterial({
            color:0x491e5b,
            specular: 0xa0f8ff,
            shininess: 10,
            shading: THREE.FlatShading,
            side:THREE.DoubleSide

        });


        let wireMaterial = new THREE.MeshLambertMaterial({
            color:0xffffff,
            wireframe:true

        });


        let convexSize = 10;
        for(let i = 0; i < convexSize; i++)
        {

            let points = [];

            let group = new THREE.Group();

            let range = 50;

            for (let j = 0; j < 8; j++)
            {
                let randomx = -range + Math.round(Math.random()*range*3);
                let randomy = -range + Math.round(Math.random()*range*3);
                let randomz = -range*0.5 + Math.round(Math.random()*range*2);

                points.push(new THREE.Vector3(randomx,randomy,randomz));

            }

            //let convexGeometry = new THREE.ConvexGeometry(points);
            let mesh = this.createConvexMesh(40*2,80*2,30*2,material);

            let wireMesh = new THREE.Mesh(mesh.geometry,wireMaterial);
            let meshScale = 1.001;
            wireMesh.scale.set(meshScale,meshScale,meshScale);
            wireMesh.material.wireframe = true;


            let rad = 600;
            let x = Math.cos(Math.PI*2/(convexSize)*i) * rad;
            let z = Math.sin(Math.PI*2/(convexSize)*i) * rad;
            let y = Math.sin((Math.PI*2/(convexSize)*i * 4) * 40;

            group.add(mesh);
            group.add(wireMesh);
            group.position.set(x,y,z);

            this.groups.push(group);
            // this.scene.add(group);


        }



        for(let k = 0; k < 30; k++)
        {

            let lineGeo = new THREE.BufferGeometry();

            this.simplex = new SimplexNoise();
            let segments = 50;
            let positions = new Float32Array( segments * 3 );
            let colors = new Float32Array( segments * 3 );

            let noiseCounter = 0.0;
            let noiseStep = 0.001+Math.random()*0.01;
            let x = 0.0 + Math.random()*20-10;
            let y = 0.0 + Math.random()*20-10;
            let z = 0.0 + Math.random()*20-10;
            let xStep = 1.0;
            let noiseRange = 40.0;
            let noiseScale = 0.002;
            let curveStep = 0.0;
            let startRad = Math.PI*2 * Math.random();

            var point = new THREE.Vector3();
            var direction = new THREE.Vector3();
            var lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors,
                linewidth: 7
            });



            let colorNum = 0.0;

            for ( var i = 0; i < segments; i ++ ) {
                // noiseCounter += noiseStep;
                // x = xStep*i - (xStep * segments)/2;
                // y = Math.sin(this.simplex.noise4D(x*noiseScale, y*noiseScale, z*noiseScale, noiseCounter))*1;
                // z = Math.cos(this.simplex.noise4D(x*noiseScale, z*noiseScale, z*noiseScale, noiseCounter))*1;
                // curveStep += 0.015;
                //
                // x += Math.cos(startRad+curveStep) * 400;
                // z += Math.sin(startRad+curveStep) * 400;
                // positions


                direction.x += Math.random() - 0.5 + Math.sin(i*0.02);
                direction.y += Math.random() - 0.5 + Math.sin(i*0.01);
                direction.z += Math.random() - 0.5 + Math.cos(i*0.03);
                direction.normalize().multiplyScalar( 10 );
                point.add( direction );
                // if(i > 0)
                // {

                positions[ i * 3 ] = point.x;
                positions[ i * 3 + 1 ] = point.y;
                positions[ i * 3 + 2 ] = point.z;
                // colors
                colors[ i * 3 ]     = Math.sin(i*0.01);
                colors[ i * 3 + 1 ] = Math.sin(i*0.01);
                colors[ i * 3 + 2 ] = Math.sin(i*0.01);
                // colors[ i * 3 ]     = 1.0/segments * 1;
                // colors[ i * 3 + 1 ] = 1.0/segments * 1;
                // colors[ i * 3 + 2 ] = 1.0/segments * 1;
                // }

            }

            lineGeo.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            lineGeo.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
            lineGeo.computeBoundingSphere();

            let _group = new THREE.Group();
            for(let j = 0; j < 8; j++)
            {
                // (r sinsθ cosΦ, r cosθ, r sinθ sinΦ)


                let mesh = new THREE.Line( lineGeo, lineMaterial );
                let phi = Math.random()*Math.PI*2;
                let theta = Math.random()*Math.PI*2;
                let r = 40;
                //mesh.position.set(r*Math.sin(theta)*Math.cos(phi), r*Math.cos(theta), r*Math.sin(theta)*Math.sin(theta));

                mesh.position.set(0, r*Math.cos(theta), r*Math.sin(theta));
                let randomRotate = Math.random()*1;
                mesh.rotation.set(
                    Math.random()*randomRotate-randomRotate/2,
                    Math.random()*randomRotate-randomRotate/2,
                    Math.random()*randomRotate-randomRotate/2);
                //mesh.scale.set(10,10,10);
                _group.add(mesh)

            }

            // _group.scale.set(5,5,5);

            //this.scene.add( _group );
        }



        let boxGeo = new THREE.BoxBufferGeometry(10,10,10,2,2,2);
        let boxMaterial = new THREE.MeshLambertMaterial({color:0x000000});

        let xStep = 10;
        let yStep = 0.5;
        let size = 100;
        let rad = 100;
        for(var i = 0; i < size; i++)
        {
            let x = xStep * i - (xStep*size)/2;
            let y = Math.cos(yStep * i) * rad*Math.sin(Math.PI*2/size * i);
            let z = Math.sin(yStep * i) * rad;

            let mesh = new THREE.Mesh(boxGeo,boxMaterial);
            mesh.position.set(x,y,z);

            this.scene.add(mesh);

        }






        let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    //

    }

    public createConvexMesh( width, height, depth, material)
    {
        var points = [];
        for (var i = 0; i < 6; i++)
        {
            var randomX = -width/2 + Math.round(Math.random()*width);
            var randomY = -height/2 + Math.round(Math.random()*height);
            var randomZ = -depth/2 + Math.round(Math.random()*depth);
            points.push(new THREE.Vector3(randomX,randomY,randomZ));
        }

        var cvGeo = new THREE.ConvexGeometry(points);
        var cvMesh = new THREE.Mesh(cvGeo,material);

        return cvMesh;

    }

    public click()
    {

    }
    public keyDown(keyCode:string)
    {

    }

    // ワンフレームごとの処理
    public update() {

    }


}


