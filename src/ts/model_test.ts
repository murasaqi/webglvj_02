/// <reference path="typings/index.d.ts" />

// *********** ひとつめのシーン *********** //
class ModelTest{

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
        this.camera.position.z = 250;
        this.camera.position.y = 150;
        // this.camera

        let ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambLight);


        let dLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dLight.position.set(0,100,0);
        this.scene.add(dLight);


        let dLight02 = new THREE.DirectionalLight(0xffffff, 0.4);
        dLight02.position.set(0,0,100);
        this.scene.add(dLight02);



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











        let controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    //

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


