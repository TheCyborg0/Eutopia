const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 50;  // Size of each block (tile)
const CHUNK_SIZE = 10; // Number of blocks per chunk (to simulate "chunks" of the world)

let player = { x: 100, y: 100, width: TILE_SIZE, height: TILE_SIZE, dx: 0, dy: 0, speed: 5, sword: null };
let inventory = [];
let mobs = [];  // Array to hold mobs
let gameRunning = true;
let showInventory = false;

let world = {}; // Store chunks here
let playerChunkX = 0;
let playerChunkY = 0;

// Sword class to represent different swords
class Sword {
    constructor(name, damage) {
        this.name = name;
        this.damage = damage;
    }
}

// Mob class with health
class Mob {
    constructor(x, y, width, height, health) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
    }

    // Draw the mob and its health bar
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.drawHealthBar();
    }

    // Draw the health bar above the mob
    drawHealthBar() {
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercentage = this.health / this.maxHealth;

        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth, barHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth * healthPercentage, barHeight);
    }

    // Take damage
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    // Check if a point is within the mob's bounds
    isClicked(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}

// World generation (a chunk-based approach)
function generateWorldChunk(chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;
    if (world[chunkKey]) return; // Skip if this chunk is already generated

    // Generate random terrain (grass or dirt for example)
    const chunk = [];
    for (let i = 0; i < CHUNK_SIZE; i++) {
        for (let j = 0; j < CHUNK_SIZE; j++) {
            chunk.push({
                x: chunkX * CHUNK_SIZE * TILE_SIZE + i * TILE_SIZE,
                y: chunkY * CHUNK_SIZE * TILE_SIZE + j * TILE_SIZE,
                type: Math.random() > 0.8 ? 'tree' : 'grass'  // Randomly add trees
            });
        }
    }
    world[chunkKey] = chunk;  // Store the chunk in the world object
}

// Draw the world (chunks) on the canvas
function drawWorld() {
    const chunkX = Math.floor(player.x / (CHUNK_SIZE * TILE_SIZE));
    const chunkY = Math.floor(player.y / (CHUNK_SIZE * TILE_SIZE));

    // Load adjacent chunks around the player
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const offsetX = chunkX + i;
            const offsetY = chunkY + j;
            generateWorldChunk(offsetX, offsetY); // Generate if not already generated
            const chunk = world[`${offsetX},${offsetY}`];

            // Draw blocks
            chunk.forEach(block => {
                if (block.type === 'tree') {
                    ctx.fillStyle = 'green';
                    ctx.fillRect(block.x, block.y, TILE_SIZE, TILE_SIZE);  // Drawing trees
                } else {
                    ctx.fillStyle = 'brown';
                    ctx.fillRect(block.x, block.y, TILE_SIZE, TILE_SIZE);  // Drawing grass
                }
            });
        }
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWorld(); // Draw the world

    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw mobs
    mobs.forEach(mob => mob.draw());

    // Player movement
    player.x += player.dx;
    player.y += player.dy;

    // Update chunk based on player position
    playerChunkX = Math.floor(player.x / (CHUNK_SIZE * TILE_SIZE));
    playerChunkY = Math.floor(player.y / (CHUNK_SIZE * TILE_SIZE));

    // Loop the game
    requestAnimationFrame(gameLoop);
}

// Inventory display
function toggleInventory() {
    showInventory = !showInventory;
    document.getElementById('inventory').style.display = showInventory ? 'block' : 'none';
    if (showInventory) {
        const inventoryDiv = document.getElementById('inventory');
        inventoryDiv.innerHTML = '';
        inventory.forEach(item => {
            let itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerText = item.name;
            itemDiv.addEventListener('click', function() {
                equipSword(item);
            });
            inventoryDiv.appendChild(itemDiv);
        });
    }
}

// Equip a sword
function equipSword(sword) {
    player.sword = sword;
    console.log(`Equipped: ${sword.name}`);
}

// Handle key events
window.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') player.dy = -player.speed;
    if (e.key === 'ArrowDown') player.dy = player.speed;
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
    if (e.key === 'i' || e.key === 'I') toggleInventory();
});

window.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

// Mouse click for damaging mobs
canvas.addEventListener('mousedown', function(e) {
    const x = e.offsetX;
    const y = e.offsetY;

    mobs.forEach(mob => {
        if (mob.isClicked(x, y)) {
            const damage = player.sword ? player.sword.damage : 10;  // If the player has a sword, use its damage; otherwise, default to 10
            mob.takeDamage(damage);  // Deal damage to the mob
        }
    });
});

// Prevent right-click context menu
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Spawn mobs when the game starts
function spawnMobs() {
    for (let i = 0; i < 5; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let health = Math.random() * 100 + 50; // Random health between 50 and 150
        mobs.push(new Mob(x, y, 40, 40, health));  // Add a mob
    }
}

// Create some swords for the inventory
inventory.push(new Sword("Wooden Sword", 10));
inventory.push(new Sword("Iron Sword", 20));
inventory.push(new Sword("Diamond Sword", 40));

// Start the game loop
gameLoop();
