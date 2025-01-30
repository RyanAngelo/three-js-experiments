import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Environment } from './environment.js';

let camera, scene, renderer;
let tree;
let environment;
let windTime = 0;
let treeGroup;
let windStrength = 0.5;
let sun, sunLight;
let sunAzimuth = 45;
let sunElevation = 60;

// Pre-calculate reusable objects
const matrix = new THREE.Matrix4();
const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
const position = new THREE.Vector3();
const scale = new THREE.Vector3();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
});

function createRoot(radius, height) {
    const group = new THREE.Group();
    
    // Create a single root geometry and material to reuse
    const rootGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.8, height, 8);
    const rootMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d2316,
        roughness: 1,
        metalness: 0
    });
    
    // Pre-calculate angles
    const angleStep = (Math.PI * 2) / 5;
    
    for (let i = 0; i < 5; i++) {
        const root = new THREE.Mesh(rootGeometry, rootMaterial);
        root.position.y = height / 2;
        
        const angle = i * angleStep;
        root.position.x = Math.cos(angle) * radius * 0.5;
        root.position.z = Math.sin(angle) * radius * 0.5;
        root.rotation.x = Math.random() * 0.2;
        root.rotation.z = Math.random() * 0.2;
        group.add(root);
    }
    
    return group;
}

function createBranch(length, thickness, level, maxLevels) {
    const group = new THREE.Group();
    
    // Reuse geometries for same-level branches
    if (!createBranch.geometries) createBranch.geometries = new Map();
    if (!createBranch.materials) createBranch.materials = new Map();
    
    const geoKey = `${length}-${thickness}`;
    let geometry = createBranch.geometries.get(geoKey);
    if (!geometry) {
        geometry = new THREE.CylinderGeometry(thickness * 0.7, thickness, length, 8);
        createBranch.geometries.set(geoKey, geometry);
    }
    
    const matKey = level === 0 ? 'trunk' : 'branch';
    let material = createBranch.materials.get(matKey);
    if (!material) {
        material = new THREE.MeshStandardMaterial({ 
            color: level === 0 ? 0x3d2316 : 0x4d2926,
            roughness: 1,
            metalness: 0
        });
        createBranch.materials.set(matKey, material);
    }
    
    const branch = new THREE.Mesh(geometry, material);
    branch.position.y = length / 2;
    
    if (level > 0) {
        branch.rotation.z = (Math.random() - 0.5) * 0.2;
        branch.rotation.x = (Math.random() - 0.5) * 0.2;
    }
    
    group.add(branch);
    
    // Store initial rotation in userData
    group.userData.initialRotation = {
        x: group.rotation.x,
        y: group.rotation.y,
        z: group.rotation.z
    };
    group.userData.level = level;
    
    // Create leaves
    if (level > maxLevels - 2) {
        // Reuse leaf geometry and material
        if (!createBranch.leafGeometry) {
            createBranch.leafGeometry = new THREE.SphereGeometry(1, 8, 8);
            createBranch.leafMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x2d5a27,
                roughness: 0.8,
                metalness: 0.1
            });
        }
        
        const leafSize = thickness * 3;
        const numLeaves = 8;
        
        for (let i = 0; i < numLeaves; i++) {
            const leaf = new THREE.Mesh(
                createBranch.leafGeometry,
                createBranch.leafMaterial
            );
            
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = leafSize * 2;
            
            leaf.position.x = radius * Math.sin(theta) * Math.cos(phi);
            leaf.position.y = length + radius * Math.cos(theta);
            leaf.position.z = radius * Math.sin(theta) * Math.sin(phi);
            
            const scale = 0.8 + Math.random() * 0.4;
            leaf.scale.set(scale * leafSize, scale * leafSize, scale * leafSize);
            
            group.add(leaf);
        }
    }
    
    // Create branches
    if (level < maxLevels) {
        const numBranches = level === 0 ? 6 : 4;
        const branchLength = length * (level === 0 ? 0.8 : 0.75);
        const branchThickness = thickness * 0.65;
        
        const angleStep = (Math.PI * 2) / numBranches;
        
        for (let i = 0; i < numBranches; i++) {
            const subBranch = createBranch(branchLength, branchThickness, level + 1, maxLevels);
            subBranch.position.y = length;
            
            const spreadFactor = level === 0 ? 0.6 : 0.9;
            const branchAngle = i * angleStep;
            
            subBranch.rotation.y = branchAngle;
            subBranch.rotation.x = (Math.random() * 0.5 + 0.3) * spreadFactor;
            subBranch.rotation.z += (Math.random() - 0.5) * 0.2;
            
            subBranch.userData.initialRotation = {
                x: subBranch.rotation.x,
                y: subBranch.rotation.y,
                z: subBranch.rotation.z
            };
            
            group.add(subBranch);
        }
    }
    
    return group;
}

function updateSunPosition() {
    // Convert angles to radians
    const azimuthRad = sunAzimuth * Math.PI / 180;
    const elevationRad = sunElevation * Math.PI / 180;
    
    // Calculate sun position using spherical coordinates
    const distance = 100;
    const x = distance * Math.cos(elevationRad) * Math.cos(azimuthRad);
    const y = distance * Math.sin(elevationRad);
    const z = distance * Math.cos(elevationRad) * Math.sin(azimuthRad);
    
    // Update sun and light positions
    sun.position.set(x, y, z);
    sunLight.position.copy(sun.position);
    
    // Update light target
    sunLight.target.position.set(0, 0, 0);
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 15, 0);
    
    // Create sun sphere
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Sun directional light
    sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.castShadow = true;
    
    // Enhance shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.001;
    
    // Add light target
    sunLight.target = new THREE.Object3D();
    scene.add(sunLight.target);
    scene.add(sunLight);
    
    // Initialize sun position
    updateSunPosition();
    
    // Create environment (ground and grass)
    environment = new Environment(scene);
    
    // Create tree group
    treeGroup = new THREE.Group();
    
    // Add root system
    const roots = createRoot(2, 1.2);
    roots.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
    treeGroup.add(roots);
    
    // Create main tree
    tree = createBranch(15, 2, 0, 5);
    tree.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
    treeGroup.add(tree);
    
    scene.add(treeGroup);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;

    // Setup control event listeners
    setupControlListeners();
}

function setupControlListeners() {
    const windSlider = document.getElementById('wind-slider');
    const sunAzimuthSlider = document.getElementById('sun-azimuth');
    const sunElevationSlider = document.getElementById('sun-elevation');
    
    if (windSlider) {
        windSlider.addEventListener('input', function(e) {
            windStrength = parseFloat(e.target.value);
            document.getElementById('wind-value').textContent = windStrength.toFixed(1);
        });
    }
    
    if (sunAzimuthSlider) {
        sunAzimuthSlider.addEventListener('input', function(e) {
            sunAzimuth = parseFloat(e.target.value);
            document.getElementById('sun-azimuth-value').textContent = sunAzimuth;
            updateSunPosition();
        });
    }
    
    if (sunElevationSlider) {
        sunElevationSlider.addEventListener('input', function(e) {
            sunElevation = parseFloat(e.target.value);
            document.getElementById('sun-elevation-value').textContent = sunElevation;
            updateSunPosition();
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    windTime += 0.005;
    
    if (treeGroup) {
        // Pre-calculate values used in the loop
        const timeVal = windTime * 0.8;
        const sinTime = Math.sin(timeVal);
        const cosTime = Math.cos(timeVal);
        
        treeGroup.traverse((object) => {
            if (object instanceof THREE.Group && object.userData.initialRotation) {
                const level = object.userData.level || 0;
                if (level === 0) return;
                
                const height = object.position.y;
                const distanceFromCenter = Math.sqrt(
                    object.position.x * object.position.x + 
                    object.position.z * object.position.z
                );
                
                const heightFactor = Math.min(1, height / 15);
                const distanceFactor = Math.min(1, distanceFromCenter / 10);
                
                const windEffect = sinTime * windStrength * heightFactor * distanceFactor;
                
                // Use pre-calculated objects for rotation
                euler.set(
                    object.userData.initialRotation.x + windEffect,
                    object.userData.initialRotation.y,
                    object.userData.initialRotation.z + cosTime * windEffect
                );
                object.setRotationFromEuler(euler);
            }
        });
    }
    
    if (environment) {
        environment.animate(windTime, windStrength);
    }
    
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
