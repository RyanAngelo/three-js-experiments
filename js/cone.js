import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

var camera, scene, renderer;
var cone;

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 0, 35 );

    var ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    scene.add( ambient );

    RectAreaLightUniformsLib.init();

    rectLight = new THREE.RectAreaLight( 0xffffff, 1, 10, 10 );
    rectLight.position.set( 5, 5, 0 );
    scene.add( rectLight );
    var rectLightMesh = new THREE.Mesh( new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial( { side: THREE.BackSide } ) );
    rectLightMesh.scale.x = rectLight.width;
    rectLightMesh.scale.y = rectLight.height;
    rectLight.add( rectLightMesh );
    var rectLightMeshBack = new THREE.Mesh( new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial( { color: 0x080808 } ) );
    rectLightMesh.add( rectLightMeshBack );

    var matStdObjects = new THREE.MeshStandardMaterial( { color: 0x0000FF, roughness: 0, metalness: 0 } );
    var coneGeometry = new THREE.ConeGeometry( 10, 10, 32 );
    var mshStdCone = new THREE.Mesh( coneGeometry, matStdObjects );
    mshStdCone.position.set( 5, 5, 0 );
    mshStdCone.castShadow = true;
    mshStdCone.receiveShadow = true;
    scene.add( mshStdCone )

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
    controls.target.copy( mshStdCone.position );
    controls.update();
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
