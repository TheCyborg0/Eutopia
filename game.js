// 🌍 Setup Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🔦 Lighting & Environment
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// 🌱 Ground Setup
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 🏃 Player Setup
const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
scene.add(player);
camera.position.set(0, 5, 10);
camera.lookAt(player.position);

// 🎮 Player Controls
const keys = { left: false, right: false, forward: false, backward: false, jump: false };
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowUp") keys.forward = true;
    if (e.key === "ArrowDown") keys.backward = true;
    if (e.key === " ") keys.jump = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowUp") keys.forward = false;
    if (e.key === "ArrowDown") keys.backward = false;
    if (e.key === " ") keys.jump = false;
});

// 📦 Blocks System
const blocks = [];
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const block = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    block.position.set(player.position.x, player.position.y - 1, player.position.z);
    blocks.push(block);
    scene.add(block);
});
document.addEventListener("click", (event) => {
    if (blocks.length > 0) {
        let lastBlock = blocks.pop();
        scene.remove(lastBlock);
    }
});

// 🛠️ Crafting System
let inventory = { wood: 0, stone: 0 };
function updateInventory() {
    document.getElementById("inventory").innerHTML = `Inventory: Wood (${inventory.wood}), Stone (${inventory.stone})`;
}

// ⚡ Magic Attacks
document.addEventListener("keydown", (event) => {
    if (event.key === "f") castMagic("fireball");
    if (event.key === "i") castMagic("ice");
});
function castMagic(type) {
    let color = type === "fireball" ? 0xff4500 : 0x00bfff;
    let spell = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshBasicMaterial({ color: color })
    );
    spell.position.copy(player.position);
    scene.add(spell);
    let velocity = new THREE.Vector3(0, 0, -0.2);
    function moveSpell() {
        spell.position.add(velocity);
        if (spell.position.z < -10) scene.remove(spell);
        else requestAnimationFrame(moveSpell);
    }
    moveSpell();
}

// ❤️ Health System
let health = 100;
function updateHealth(amount) {
    health += amount;
    document.getElementById("health").innerText = `Health: ${health}`;
    if (health <= 0) triggerGameOver();
}

// ☠️ Player Death & Restart
function triggerGameOver() {
    document.getElementById("restartScreen").style.display = "block";
}
document.getElementById("restartButton").addEventListener("click", () => {
    health = 100;
    inventory = { wood: 0, stone: 0 };
    player.position.set(0, 2, 0);
    blocks.forEach(block => scene.remove(block));
    blocks.length = 0;
    document.getElementById("restartScreen").style.display = "none";
    updateHealth(0);
    updateInventory();
});

// 🌪️ Storms & Spiders (Spiders damage player)
function spawnSpider() {
    let spider = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    spider.position.set(Math.random() * 20 - 10, 0.5, Math.random() * 20 - 10);
    scene.add(spider);
    setInterval(() => {
        if (spider.position.distanceTo(player.position) < 1.5) updateHealth(-10);
    }, 2000);
}
setInterval(() => { if (Math.random() > 0.7) spawnSpider(); }, 5000);

// 🏰 Castles with Bosses
function spawnCastle() {
    let castle = new THREE.Group();
    let tower = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 10, 12),
        new THREE.MeshStandardMaterial({ color: 0x6a0dad })
    );
    castle.add(tower);
    scene.add(castle);
    spawnBoss(tower.position);
}
function spawnBoss(position) {
    let boss = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 2),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    boss.position.copy(position);
    boss.position.y += 3;
    scene.add(boss);
    setInterval(() => {
        if (boss.position.distanceTo(player.position) < 2) updateHealth(-20);
    }, 3000);
}
setTimeout(spawnCastle, 10000);

// 🕹️ Game Loop
function gameLoop() {
    if (keys.left) player.position.x -= 0.1;
    if (keys.right) player.position.x += 0.1;
    if (keys.forward) player.position.z -= 0.1;
    if (keys.backward) player.position.z += 0.1;
    if (keys.jump) player.position.y += 0.1;
    player.position.y = Math.max(1, player.position.y - 0.05);
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}
gameLoop();
