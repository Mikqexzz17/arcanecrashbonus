const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xdddddd, 0.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// White Box (Room)
const roomSize = 50;
const roomGeometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
const roomMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.BackSide });
const room = new THREE.Mesh(roomGeometry, roomMaterial);
room.position.y = roomSize / 2;
scene.add(room);

// Player
const playerHeight = 2;
const playerGeometry = new THREE.BoxGeometry(1, playerHeight, 1);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, playerHeight / 2, 0);
scene.add(player);

// State
let isFPS = false;
const keys = { w: false, a: false, s: false, d: false, space: false };
const playerSpeed = 10;
let velocityY = 0;
const gravity = -30;
const jumpForce = 12;
let isGrounded = true;
let yaw = 0;

// Event Listeners
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = true;
    if (key === 'a') keys.a = true;
    if (key === 's') keys.s = true;
    if (key === 'd') keys.d = true;
    if (key === ' ' || key === 'spacebar') keys.space = true;
    if (key === 'g') isFPS = !isFPS;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 'a') keys.a = false;
    if (key === 's') keys.s = false;
    if (key === 'd') keys.d = false;
    if (key === ' ' || key === 'spacebar') keys.space = false;
});

// Pointer Lock for Mouse Look
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.003;
    }
});

document.body.addEventListener('click', () => {
    if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Clock for delta time
const clock = new THREE.Clock();

function updateCamera() {
    if (isFPS) {
        player.visible = false;
        camera.position.set(player.position.x, player.position.y + playerHeight / 2 - 0.2, player.position.z);
        const lookAtTarget = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        lookAtTarget.add(camera.position);
        camera.lookAt(lookAtTarget);
    } else {
        player.visible = true;
        const offset = new THREE.Vector3(0, 2.5, 5).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        camera.position.copy(player.position).add(offset);

        const lookAtTarget = player.position.clone();
        lookAtTarget.y += 1;
        camera.lookAt(lookAtTarget);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1); // Cap delta to avoid huge jumps

    // Rotation
    player.rotation.y = yaw;

    // Movement
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    if (keys.w) {
        player.position.addScaledVector(forward, playerSpeed * delta);
    }
    if (keys.s) {
        player.position.addScaledVector(forward, -playerSpeed * delta);
    }
    if (keys.a) {
        player.position.addScaledVector(right, -playerSpeed * delta);
    }
    if (keys.d) {
        player.position.addScaledVector(right, playerSpeed * delta);
    }

    // Boundaries
    const halfRoom = roomSize / 2;
    const halfPlayer = 0.5;

    if (player.position.x < -halfRoom + halfPlayer) player.position.x = -halfRoom + halfPlayer;
    if (player.position.x > halfRoom - halfPlayer) player.position.x = halfRoom - halfPlayer;
    if (player.position.z < -halfRoom + halfPlayer) player.position.z = -halfRoom + halfPlayer;
    if (player.position.z > halfRoom - halfPlayer) player.position.z = halfRoom - halfPlayer;

    // Jumping & Gravity
    if (keys.space && isGrounded) {
        velocityY = jumpForce;
        isGrounded = false;
    }

    velocityY += gravity * delta;
    player.position.y += velocityY * delta;

    // Floor collision
    if (player.position.y <= playerHeight / 2) {
        player.position.y = playerHeight / 2;
        velocityY = 0;
        isGrounded = true;
    }

    updateCamera();

    renderer.render(scene, camera);
}

animate();
