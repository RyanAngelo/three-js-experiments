    import * as THREE from '../node_modules/three/build/three.module.js';
    import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
    import { RectAreaLightUniformsLib } from '../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js';

    var camera, scene, renderer;
    var cone;
    var material;
    var geometry;

    var targetRotation = 0;
    var rectLight;
    var param = {};

    var origin = new THREE.Vector3();

    init();
    animate();

function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 0, 35 );

    var ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    scene.add( ambient );

    RectAreaLightUniformsLib.init();

    rectLight = new THREE.RectAreaLight( 0xffffff, 1, 10, 10 );
    rectLight.position.set( 5, 5, 0 );
    scene.add( rectLight );
    var rectLightMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { side: THREE.BackSide } ) );
    rectLightMesh.scale.x = rectLight.width;
    rectLightMesh.scale.y = rectLight.height;
    rectLight.add( rectLightMesh );
    var rectLightMeshBack = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { color: 0x080808 } ) );
    rectLightMesh.add( rectLightMeshBack );

    geometry = new THREE.ConeGeometry( 10, 10, 32 );
    material = new THREE.MeshBasicMaterial( {color: 0x0000FF} );
    cone = new THREE.Mesh( geometry, material );
    cone.castShadow = true;
    cone.receiveShadow = true;
    scene.add( cone );

    var matStdObjects = new THREE.MeshStandardMaterial( { color: 0xA00000, roughness: 0, metalness: 0 } );
    var geoKnot = new THREE.TorusKnotBufferGeometry( 1.5, 0.5, 100, 16 );
    var mshStdKnot = new THREE.Mesh( geoKnot, matStdObjects );
    mshStdKnot.position.set( 5, 5, 0 );
    mshStdKnot.castShadow = true;
    mshStdKnot.receiveShadow = true;
    scene.add( mshStdKnot )

    param = {
        motion: true,
        width: rectLight.width,
        height: rectLight.height,
        color: rectLight.color.getHex(),
        intensity: rectLight.intensity,
        'ambient': ambient.intensity,
        'object color': matStdObjects.color.getHex(),
    };

    var controls = new OrbitControls( camera, renderer.domElement );
    controls.target.copy( mshStdKnot.position );
    controls.update();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
    cone.rotation.y += ( targetRotation - cone.rotation.y ) * 0.05;
    renderer.render( scene, camera );
}

function animate() {
    requestAnimationFrame( animate );
    if ( param.motion ) {
        var t = ( Date.now() / 2000 );
        // move light in circle around center
        // change light height with sine curve
        var r = 15.0;
        var lx = r * Math.cos( t );
        var lz = r * Math.sin( t );
        var ly = 5.0 + 5.0 * Math.sin( t / 3.0 );
        rectLight.position.set( lx, ly, lz );
        rectLight.lookAt( origin );
    }
    renderer.render( scene, camera );
}
