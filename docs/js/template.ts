/// <reference path="typings/index.d.ts" />

// *********** ひとつめのシーン *********** //
class SceneTemplate{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private timer:number = 0;


    constructor() {

        this.createScene();

    }

    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(){

        // シーンを作る
        this.scene = new THREE.Scene();
        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );


    }
    public click()
    {

    }
    public keyDown(e:string)
    {

    }

    public keyUp(e:KeyboardEvent)
    {

    }

    // ワンフレームごとの処理
    public update() {

        // ❑の横運動
        this.timer += 0.1;

    }



}
