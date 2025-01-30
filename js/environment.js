import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        
        // Pre-calculate reusable objects
        this.matrix = new THREE.Matrix4();
        this.quaternion = new THREE.Quaternion();
        this.euler = new THREE.Euler();
        this.position = new THREE.Vector3();
        this.scale = new THREE.Vector3();
        
        // Reusable geometry and material for grass
        this.grassGeometry = new THREE.CylinderGeometry(0.02, 0.01, 1, 4);
        this.grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b7a3b,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.grassInstances = [];
        this.createGround();
        this.createGrass();
    }
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b5323,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        
        // Ensure ground is slightly below grass level to prevent z-fighting
        this.ground.position.y = -0.01;
        
        this.scene.add(this.ground);
    }
    
    createGrass() {
        const numGrassBlades = 8000;
        const radius = 80;
        
        // Pre-calculate values
        const TWO_PI = Math.PI * 2;
        
        for (let i = 0; i < numGrassBlades; i++) {
            const r = Math.pow(Math.random(), 0.5) * radius;
            const angle = Math.random() * TWO_PI;
            
            const x = Math.cos(angle) * r + (Math.random() - 0.5) * 5;
            const z = Math.sin(angle) * r + (Math.random() - 0.5) * 5;
            
            const distanceFromCenter = Math.sqrt(x * x + z * z);
            if (distanceFromCenter < 3) continue;
            
            const height = 0.8 + Math.random() * 0.4;
            const grass = new THREE.Mesh(this.grassGeometry, this.grassMaterial);
            grass.scale.y = height;
            grass.position.set(x, height / 2, z);
            
            grass.rotation.y = Math.random() * TWO_PI;
            
            grass.userData.initialPosition = grass.position.clone();
            grass.userData.initialRotation = {
                x: (Math.random() - 0.5) * 0.2,
                y: grass.rotation.y,
                z: (Math.random() - 0.5) * 0.2
            };
            
            grass.castShadow = true;
            grass.receiveShadow = true;
            
            this.grassInstances.push(grass);
            this.scene.add(grass);
        }
    }
    
    animate(time, windStrength) {
        // Pre-calculate values used in the loop
        const timeVal = time * 0.8;
        const sinTime = Math.sin(timeVal);
        const cosTime = Math.cos(timeVal);
        
        for (const grass of this.grassInstances) {
            const { initialPosition, initialRotation } = grass.userData;
            
            // Calculate distance-based factors once
            const distanceFromCenter = Math.sqrt(
                initialPosition.x * initialPosition.x + 
                initialPosition.z * initialPosition.z
            );
            const distanceFactor = Math.min(1, distanceFromCenter / 80);
            
            // Calculate wind effect
            const windEffect = sinTime * windStrength * distanceFactor;
            const secondaryEffect = cosTime * windStrength * distanceFactor * 0.5;
            
            // Update position
            this.position.copy(initialPosition);
            this.position.x += windEffect * 0.2;
            this.position.z += secondaryEffect * 0.2;
            grass.position.copy(this.position);
            
            // Update rotation using pre-calculated euler
            this.euler.set(
                initialRotation.x + windEffect,
                initialRotation.y,
                initialRotation.z + secondaryEffect
            );
            grass.setRotationFromEuler(this.euler);
        }
    }
} 
