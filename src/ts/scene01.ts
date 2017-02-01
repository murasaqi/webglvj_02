/// <reference path="typings/index.d.ts" />
class FontTest00{

    public scene: THREE.Scene;
    public camera: THREE.Camera;
    private object:THREE.Line;
    private uniforms:Object;

    constructor(font) {

        this.createScene( font );

    }

    // シーンを作る。ここでオブジェクトを格納していく。
    private createScene(font){

        // シーンを作る
        this.scene = new THREE.Scene();

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
        this.camera.position.z = 200;

        this.uniforms = {
            amplitude: { value: 5.0 },
            opacity:   { value: 0.3 },
            color:     { value: new THREE.Color( 0xff0000 ) }
        };

        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms:       this.uniforms,
            vertexShader:   document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
            blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true
        });

        let geometry = new THREE.TextGeometry( 'three.js', {
            font: font,
            size: 50,
            height: 15,
            curveSegments: 10,
            bevelThickness: 1,
            bevelSize: 1,
            bevelEnabled: false,
            // bevelSegments: 1,
            // steps: 40
        } );



        geometry.center();
        let vertices = geometry.vertices;
        let buffergeometry = new THREE.BufferGeometry();

        let position = new THREE.Float32BufferAttribute(vertices.length * 3, 3).copyVector3sArray( vertices );
        buffergeometry.addAttribute( 'position', position );

        let displacement = new THREE.Float32BufferAttribute( vertices.length * 3, 3 );
        buffergeometry.addAttribute( 'displacement', displacement );

        let customColor = new THREE.Float32BufferAttribute( vertices.length * 3, 3 );
        buffergeometry.addAttribute( 'customColor', customColor );

        let color = new THREE.Color( 0xffffff );


        for( var i = 0, l = customColor.count; i < l; i ++ ) {
            color.setHSL( i / l, 0.5, 0.5 );
            color.toArray( customColor.array, i * customColor.itemSize );
        }
        this.object = new THREE.Line( buffergeometry, shaderMaterial );
        this.object.rotation.x = 0.2;
        this.scene.add( this.object );

    }

    // ワンフレームごとの処理
    public update() {
        var time = Date.now() * 0.001;
        this.object.rotation.y = 0.25 * time;
        this.uniforms.amplitude.value = Math.sin( 0.5 * time );
        this.uniforms.color.value.offsetHSL( 0.0005, 0, 0 );
        var attributes = this.object.geometry.attributes;
        var array = attributes.displacement.array;
        for ( var i = 0, l = array.length; i < l; i += 3 ) {
            array[ i     ] += 0.3 * ( 0.5 - Math.random() );
            array[ i + 1 ] += 0.3 * ( 0.5 - Math.random() );
            array[ i + 2 ] += 0.3 * ( 0.5 - Math.random() );
        }
        attributes.displacement.needsUpdate = true;
    }


}


