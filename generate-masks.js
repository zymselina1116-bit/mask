/**
 * Mask Generator Script
 * Generates culturally-accurate mask images with authentic colors and patterns
 *
 * Run with: node generate-masks.js
 * Requires: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './assets/masks';
const MASK_SIZE = 1000;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function drawOval(ctx, x, y, w, h, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawEyeHole(ctx, x, y, w, h) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
}

function saveCanvas(canvas, filename) {
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Created: ${filepath}`);
}

// ============================================================
// JAPANESE NOH MASK
// ============================================================

function createJapaneseNohMask() {
    const canvas = createCanvas(MASK_SIZE, MASK_SIZE);
    const ctx = canvas.getContext('2d');

    // Background transparent
    ctx.clearRect(0, 0, MASK_SIZE, MASK_SIZE);

    // Main face - pale white/ivory
    ctx.fillStyle = '#F5F0E8';
    ctx.beginPath();
    ctx.ellipse(500, 520, 320, 400, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle shading on sides
    const gradient = ctx.createRadialGradient(500, 500, 100, 500, 500, 400);
    gradient.addColorStop(0, 'rgba(230, 220, 210, 0)');
    gradient.addColorStop(1, 'rgba(200, 190, 180, 0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(500, 520, 320, 400, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye holes - narrow and angled
    drawEyeHole(ctx, 400, 450, 40, 25);
    drawEyeHole(ctx, 600, 450, 40, 25);

    // Eyebrows - thin, arched (black)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(400, 400, 60, 0.8, 2.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(600, 400, 60, 0.8, 2.3);
    ctx.stroke();

    // Small mouth - subtle red
    ctx.fillStyle = '#B8504A';
    ctx.beginPath();
    ctx.ellipse(500, 650, 35, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose - subtle shadow lines
    ctx.strokeStyle = 'rgba(150, 140, 130, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(500, 500);
    ctx.lineTo(500, 600);
    ctx.stroke();

    saveCanvas(canvas, 'japanese_noh.png');
}

// ============================================================
// AFRICAN TRIBAL MASK
// ============================================================

function createAfricanTribalMask() {
    const canvas = createCanvas(MASK_SIZE, MASK_SIZE);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, MASK_SIZE, MASK_SIZE);

    // Main face - rich dark wood brown
    ctx.fillStyle = '#4A2511';
    ctx.beginPath();
    ctx.ellipse(500, 500, 280, 450, 0, 0, Math.PI * 2);
    ctx.fill();

    // Forehead section - terracotta
    ctx.fillStyle = '#C1440E';
    ctx.beginPath();
    ctx.ellipse(500, 300, 250, 150, 0, 0, Math.PI);
    ctx.fill();

    // Geometric patterns - white tribal markings
    ctx.strokeStyle = '#F5F5DC';
    ctx.lineWidth = 12;

    // Vertical lines on forehead
    for (let x = 350; x <= 650; x += 75) {
        ctx.beginPath();
        ctx.moveTo(x, 250);
        ctx.lineTo(x, 400);
        ctx.stroke();
    }

    // Horizontal stripes on cheeks
    ctx.fillStyle = '#F5F5DC';
    for (let y = 550; y <= 750; y += 50) {
        ctx.fillRect(300, y, 400, 15);
    }

    // Eye holes - large almond shaped
    drawEyeHole(ctx, 400, 480, 50, 70);
    drawEyeHole(ctx, 600, 480, 50, 70);

    // Nose - geometric triangle
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(500, 520);
    ctx.lineTo(470, 600);
    ctx.lineTo(530, 600);
    ctx.closePath();
    ctx.fill();

    // Mouth area - rectangular with teeth pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(420, 680, 160, 80);

    // Teeth marks
    ctx.fillStyle = '#F5F5DC';
    for (let x = 430; x <= 570; x += 30) {
        ctx.fillRect(x, 680, 15, 40);
    }

    // Decorative dots around border
    ctx.fillStyle = '#FFD700';
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
        const x = 500 + Math.cos(angle) * 320;
        const y = 500 + Math.sin(angle) * 480;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    saveCanvas(canvas, 'african_tribal.png');
}

// ============================================================
// VENETIAN CARNIVAL MASK
// ============================================================

function createVenetianMask() {
    const canvas = createCanvas(MASK_SIZE, MASK_SIZE);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, MASK_SIZE, MASK_SIZE);

    // Main mask - rich gold
    const goldGradient = ctx.createLinearGradient(0, 0, MASK_SIZE, MASK_SIZE);
    goldGradient.addColorStop(0, '#FFD700');
    goldGradient.addColorStop(0.5, '#FFA500');
    goldGradient.addColorStop(1, '#FF8C00');

    ctx.fillStyle = goldGradient;
    ctx.beginPath();
    ctx.ellipse(500, 450, 350, 300, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ornate top extension
    ctx.beginPath();
    ctx.moveTo(500, 100);
    ctx.quadraticCurveTo(400, 150, 350, 250);
    ctx.lineTo(650, 250);
    ctx.quadraticCurveTo(600, 150, 500, 100);
    ctx.fill();

    // White base layer with gold outline
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(500, 480, 300, 250, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye holes - elegant cat-eye shape
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(380, 450, 60, 45, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(620, 450, 60, 45, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Gold filigree patterns
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 4;

    // Swirls around eyes
    for (let side = 0; side < 2; side++) {
        const xBase = side === 0 ? 320 : 680;
        const direction = side === 0 ? -1 : 1;

        ctx.beginPath();
        ctx.arc(xBase, 450, 80, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(xBase + direction * i * 30, 400 - i * 20, 60 - i * 15, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Decorative gems
    const gemColors = ['#FF0000', '#0000FF', '#00FF00', '#FF00FF'];
    gemColors.forEach((color, i) => {
        ctx.fillStyle = color;
        const angle = (i / gemColors.length) * Math.PI + Math.PI / 2;
        const x = 500 + Math.cos(angle) * 250;
        const y = 450 + Math.sin(angle) * 200;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Gem highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Gold border
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(500, 450, 350, 300, 0, 0, Math.PI * 2);
    ctx.stroke();

    saveCanvas(canvas, 'venetian.png');
}

// ============================================================
// BEIJING OPERA MASK
// ============================================================

function createBeijingOperaMask() {
    const canvas = createCanvas(MASK_SIZE, MASK_SIZE);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, MASK_SIZE, MASK_SIZE);

    // Main face - bold red (represents bravery/loyalty)
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.ellipse(500, 520, 330, 420, 0, 0, Math.PI * 2);
    ctx.fill();

    // White center stripe (forehead to chin)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(450, 150, 100, 700);

    // Black eyebrow patterns - dramatic swooping lines
    ctx.fillStyle = '#000000';

    // Left eyebrow - thick dramatic arch
    ctx.beginPath();
    ctx.moveTo(350, 380);
    ctx.quadraticCurveTo(320, 320, 380, 280);
    ctx.lineTo(420, 320);
    ctx.quadraticCurveTo(380, 360, 370, 400);
    ctx.closePath();
    ctx.fill();

    // Right eyebrow - mirrored
    ctx.beginPath();
    ctx.moveTo(650, 380);
    ctx.quadraticCurveTo(680, 320, 620, 280);
    ctx.lineTo(580, 320);
    ctx.quadraticCurveTo(620, 360, 630, 400);
    ctx.closePath();
    ctx.fill();

    // Eye holes
    drawEyeHole(ctx, 400, 450, 45, 50);
    drawEyeHole(ctx, 600, 450, 45, 50);

    // White accent around eyes
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(400, 450, 60, 65, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(600, 450, 60, 65, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Nose - black geometric shape
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(500, 480);
    ctx.lineTo(460, 580);
    ctx.lineTo(500, 600);
    ctx.lineTo(540, 580);
    ctx.closePath();
    ctx.fill();

    // Mouth area - black with white teeth/fangs
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(500, 700, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // White fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(450, 680);
    ctx.lineTo(440, 720);
    ctx.lineTo(470, 700);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(550, 680);
    ctx.lineTo(560, 720);
    ctx.lineTo(530, 700);
    ctx.closePath();
    ctx.fill();

    // Gold decorative patterns on forehead
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(500, 250, 40, 0, Math.PI * 2);
    ctx.fill();

    // Decorative swirls on cheeks
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(320, 600, 40, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(680, 600, 40, Math.PI * 0.5, Math.PI * 2);
    ctx.stroke();

    saveCanvas(canvas, 'beijing_opera.png');
}

// ============================================================
// MEXICAN DAY OF THE DEAD SKULL
// ============================================================

function createDayOfTheDeadSkull() {
    const canvas = createCanvas(MASK_SIZE, MASK_SIZE);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, MASK_SIZE, MASK_SIZE);

    // Main skull - white
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(500, 520, 330, 400, 0, 0, Math.PI * 2);
    ctx.fill();

    // Large decorative eye sockets - black
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(400, 420, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(600, 420, 80, 0, Math.PI * 2);
    ctx.fill();

    // Colorful flower patterns around eyes
    const colors = ['#FF1493', '#FF4500', '#FFD700', '#00CED1', '#9370DB'];

    // Left eye flowers
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = 400 + Math.cos(angle) * 100;
        const y = 420 + Math.sin(angle) * 100;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Flower center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Right eye flowers
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = 600 + Math.cos(angle) * 100;
        const y = 420 + Math.sin(angle) * 100;
        ctx.fillStyle = colors[(i + 2) % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Nose - heart shape
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(500, 580);
    ctx.lineTo(470, 540);
    ctx.lineTo(500, 520);
    ctx.lineTo(530, 540);
    ctx.closePath();
    ctx.fill();

    // Colorful forehead pattern - Mexican flower design
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(500, 280, 60, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 500 + Math.cos(angle) * 80;
        const y = 280 + Math.sin(angle) * 80;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Teeth - vertical rectangles
    ctx.fillStyle = '#000000';
    const teethCount = 10;
    const teethWidth = 500 / teethCount;
    for (let i = 0; i < teethCount; i++) {
        const x = 250 + i * (500 / teethCount);
        ctx.fillRect(x, 750, teethWidth - 5, 80);
    }

    // Decorative swirls on cheeks
    ctx.strokeStyle = '#00CED1';
    ctx.lineWidth = 8;

    // Left cheek swirl
    ctx.beginPath();
    ctx.arc(320, 620, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(320, 620, 70, 0, Math.PI * 1.5);
    ctx.stroke();

    // Right cheek swirl
    ctx.beginPath();
    ctx.arc(680, 620, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(680, 620, 70, Math.PI * 0.5, Math.PI * 2);
    ctx.stroke();

    // Colorful dots as decoration
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 150;
        const x = 500 + Math.cos(angle) * radius;
        const y = 520 + Math.sin(angle) * radius;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.arc(x, y, 5 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
    }

    saveCanvas(canvas, 'mexican_dod.png');
}

// ============================================================
// GENERATE ALL MASKS
// ============================================================

console.log('🎭 Generating cultural masks...\n');

createJapaneseNohMask();
createAfricanTribalMask();
createVenetianMask();
createBeijingOperaMask();
createDayOfTheDeadSkull();

console.log('\n✨ All masks generated successfully!');
console.log(`📁 Saved to: ${OUTPUT_DIR}/`);
console.log('\n🎨 Cultural Masks Created:');
console.log('  1. Japanese Noh Mask - Pale ivory with subtle features');
console.log('  2. African Tribal Mask - Dark wood with geometric patterns');
console.log('  3. Venetian Carnival Mask - Gold with ornate decorations');
console.log('  4. Beijing Opera Mask - Bold red/black dramatic design');
console.log('  5. Mexican Day of the Dead - Colorful floral skull\n');
