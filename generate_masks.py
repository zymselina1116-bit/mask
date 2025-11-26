#!/usr/bin/env python3
"""
Cultural Mask Generator
Creates PNG images with culturally-authentic colors and patterns for AR face filter
"""

from PIL import Image, ImageDraw, ImageFont
import math
import random

OUTPUT_DIR = "assets/masks"
MASK_SIZE = 1000

def create_japanese_noh_mask():
    """Japanese Noh Mask - Pale ivory with subtle features"""
    img = Image.new('RGBA', (MASK_SIZE, MASK_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Main face - pale ivory
    draw.ellipse([180, 120, 820, 920], fill='#F5F0E8')

    # Subtle shading on edges
    for i in range(10):
        alpha = int(30 - i * 3)
        color = (200, 190, 180, alpha)
        draw.ellipse([180-i*5, 120-i*5, 820+i*5, 920+i*5], outline=color, width=2)

    # Eye holes - narrow and angled
    draw.ellipse([360, 425, 440, 475], fill='#000000')
    draw.ellipse([560, 425, 640, 475], fill='#000000')

    # Eyebrows - thin arched (dark gray)
    draw.arc([340, 340, 460, 460], start=30, end=150, fill='#1a1a1a', width=8)
    draw.arc([540, 340, 660, 460], start=30, end=150, fill='#1a1a1a', width=8)

    # Small mouth - subtle red
    draw.ellipse([465, 630, 535, 670], fill='#B8504A')

    # Nose line
    draw.line([(500, 500), (500, 600)], fill=(150, 140, 130, 100), width=3)

    img.save(f'{OUTPUT_DIR}/japanese_noh.png')
    print("✅ Created: Japanese Noh Mask")

def create_african_tribal_mask():
    """African Tribal Mask - Bold patterns with earth tones"""
    img = Image.new('RGBA', (MASK_SIZE, MASK_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Main face - dark wood brown
    draw.ellipse([220, 50, 780, 950], fill='#4A2511')

    # Forehead section - terracotta
    draw.pieslice([250, 150, 750, 450], start=0, end=180, fill='#C1440E')

    # Vertical lines on forehead (white tribal markings)
    for x in range(350, 651, 75):
        draw.line([(x, 250), (x, 400)], fill='#F5F5DC', width=12)

    # Horizontal stripes on cheeks
    for y in range(550, 751, 50):
        draw.rectangle([300, y, 700, y+15], fill='#F5F5DC')

    # Eye holes - large almond shaped
    draw.ellipse([350, 410, 450, 550], fill='#000000')
    draw.ellipse([550, 410, 650, 550], fill='#000000')

    # Nose - geometric triangle
    draw.polygon([(500, 520), (470, 600), (530, 600)], fill='#8B4513')

    # Mouth area - rectangular
    draw.rectangle([420, 680, 580, 760], fill='#000000')

    # Teeth marks
    for x in range(430, 571, 30):
        draw.rectangle([x, 680, x+15, 720], fill='#F5F5DC')

    # Decorative dots around border
    for angle_deg in range(0, 360, 30):
        angle = math.radians(angle_deg)
        x = 500 + math.cos(angle) * 320
        y = 500 + math.sin(angle) * 480
        draw.ellipse([x-10, y-10, x+10, y+10], fill='#FFD700')

    img.save(f'{OUTPUT_DIR}/african_tribal.png')
    print("✅ Created: African Tribal Mask")

def create_venetian_mask():
    """Venetian Carnival Mask - Gold with ornate decorations"""
    img = Image.new('RGBA', (MASK_SIZE, MASK_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Main gold base
    draw.ellipse([150, 150, 850, 750], fill='#FFD700')
    draw.ellipse([150, 150, 850, 750], outline='#FFA500', width=15)

    # Ornate top extension
    draw.polygon([(500, 100), (350, 250), (650, 250)], fill='#FFD700')

    # White inner layer
    draw.ellipse([200, 230, 800, 730], fill='#FFFFFF')

    # Eye holes - elegant cat-eye shape
    draw.ellipse([300, 395, 440, 505], fill='#000000')
    draw.ellipse([560, 395, 700, 505], fill='#000000')

    # Gold filigree patterns around eyes
    for side in [0, 1]:
        x_base = 270 if side == 0 else 730
        direction = -1 if side == 0 else 1

        # Circular patterns
        for i in range(3):
            offset = i * 30 * direction
            radius = 60 - i * 15
            draw.arc([x_base + offset - radius, 400 - i*20 - radius,
                     x_base + offset + radius, 400 - i*20 + radius],
                    start=0, end=360, fill='#DAA520', width=4)

    # Decorative gems
    gem_colors = ['#FF0000', '#0000FF', '#00FF00', '#FF00FF']
    for i, color in enumerate(gem_colors):
        angle = (i / len(gem_colors)) * math.pi + math.pi / 2
        x = 500 + math.cos(angle) * 250
        y = 450 + math.sin(angle) * 200
        draw.ellipse([x-15, y-15, x+15, y+15], fill=color)
        # Highlight
        draw.ellipse([x-20, y-20, x-10, y-10], fill=(255, 255, 255, 150))

    # Gold border
    draw.ellipse([150, 150, 850, 750], outline='#B8860B', width=8)

    img.save(f'{OUTPUT_DIR}/venetian.png')
    print("✅ Created: Venetian Carnival Mask")

def create_beijing_opera_mask():
    """Beijing Opera Mask - Bold red/black dramatic design"""
    img = Image.new('RGBA', (MASK_SIZE, MASK_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Main face - bold red (bravery/loyalty)
    draw.ellipse([170, 100, 830, 940], fill='#DC143C')

    # White center stripe (forehead to chin)
    draw.rectangle([450, 150, 550, 850], fill='#FFFFFF')

    # Black dramatic eyebrows
    # Left eyebrow
    draw.polygon([
        (350, 380), (320, 320), (380, 280),
        (420, 320), (380, 360), (370, 400)
    ], fill='#000000')

    # Right eyebrow (mirrored)
    draw.polygon([
        (650, 380), (680, 320), (620, 280),
        (580, 320), (620, 360), (630, 400)
    ], fill='#000000')

    # Eye holes
    draw.ellipse([355, 400, 445, 500], fill='#000000')
    draw.ellipse([555, 400, 645, 500], fill='#000000')

    # White accent around eyes
    draw.ellipse([340, 385, 460, 515], outline='#FFFFFF', width=10)
    draw.ellipse([540, 385, 660, 515], outline='#FFFFFF', width=10)

    # Nose - black geometric shape
    draw.polygon([(500, 480), (460, 580), (500, 600), (540, 580)], fill='#000000')

    # Mouth area
    draw.ellipse([380, 620, 620, 780], fill='#000000')

    # White fangs
    draw.polygon([(450, 680), (440, 720), (470, 700)], fill='#FFFFFF')
    draw.polygon([(550, 680), (560, 720), (530, 700)], fill='#FFFFFF')

    # Gold forehead decoration
    draw.ellipse([460, 210, 540, 290], fill='#FFD700')

    # Decorative swirls on cheeks
    draw.arc([280, 560, 360, 640], start=0, end=270, fill='#000000', width=8)
    draw.arc([640, 560, 720, 640], start=270, end=540, fill='#000000', width=8)

    img.save(f'{OUTPUT_DIR}/beijing_opera.png')
    print("✅ Created: Beijing Opera Mask")

def create_day_of_dead_skull():
    """Mexican Day of the Dead - Colorful floral skull"""
    img = Image.new('RGBA', (MASK_SIZE, MASK_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # White skull
    draw.ellipse([170, 120, 830, 920], fill='#FFFFFF')

    # Large black eye sockets
    draw.ellipse([320, 340, 480, 500], fill='#000000')
    draw.ellipse([520, 340, 680, 500], fill='#000000')

    # Colorful flower patterns around eyes
    colors = ['#FF1493', '#FF4500', '#FFD700', '#00CED1', '#9370DB']

    # Left eye flowers
    for i in range(8):
        angle = (i / 8) * 2 * math.pi
        x = 400 + math.cos(angle) * 100
        y = 420 + math.sin(angle) * 100
        draw.ellipse([x-20, y-20, x+20, y+20], fill=colors[i % len(colors)])
        # Flower center
        draw.ellipse([x-8, y-8, x+8, y+8], fill='#FFD700')

    # Right eye flowers
    for i in range(8):
        angle = (i / 8) * 2 * math.pi
        x = 600 + math.cos(angle) * 100
        y = 420 + math.sin(angle) * 100
        draw.ellipse([x-20, y-20, x+20, y+20], fill=colors[(i + 2) % len(colors)])
        draw.ellipse([x-8, y-8, x+8, y+8], fill='#FFD700')

    # Heart-shaped nose
    draw.polygon([(500, 580), (470, 540), (500, 520), (530, 540)], fill='#000000')

    # Forehead flower pattern
    draw.ellipse([440, 220, 560, 340], fill='#FF1493')
    for i in range(6):
        angle = (i / 6) * 2 * math.pi
        x = 500 + math.cos(angle) * 80
        y = 280 + math.sin(angle) * 80
        draw.ellipse([x-30, y-30, x+30, y+30], fill=colors[i % len(colors)])

    # Teeth - vertical rectangles
    teeth_count = 10
    teeth_width = 500 / teeth_count
    for i in range(teeth_count):
        x = 250 + i * (500 / teeth_count)
        draw.rectangle([x, 750, x + teeth_width - 5, 830], fill='#000000')

    # Cheek swirls
    draw.arc([270, 570, 370, 670], start=0, end=360, fill='#00CED1', width=8)
    draw.arc([250, 550, 390, 690], start=0, end=270, fill='#00CED1', width=8)

    draw.arc([630, 570, 730, 670], start=0, end=360, fill='#00CED1', width=8)
    draw.arc([610, 550, 750, 690], start=90, end=360, fill='#00CED1', width=8)

    # Decorative dots
    random.seed(42)  # For consistency
    for _ in range(30):
        angle = random.random() * 2 * math.pi
        radius = 200 + random.random() * 150
        x = 500 + math.cos(angle) * radius
        y = 520 + math.sin(angle) * radius
        size = 5 + random.random() * 10
        color = colors[int(random.random() * len(colors))]
        draw.ellipse([x-size, y-size, x+size, y+size], fill=color)

    img.save(f'{OUTPUT_DIR}/mexican_dod.png')
    print("✅ Created: Mexican Day of the Dead Skull")

if __name__ == '__main__':
    import os

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("🎭 Generating cultural masks...\n")

    create_japanese_noh_mask()
    create_african_tribal_mask()
    create_venetian_mask()
    create_beijing_opera_mask()
    create_day_of_dead_skull()

    print("\n✨ All masks generated successfully!")
    print(f"📁 Saved to: {OUTPUT_DIR}/")
    print("\n🎨 Cultural Masks Created:")
    print("  1. Japanese Noh Mask - Pale ivory with subtle features")
    print("  2. African Tribal Mask - Dark wood with geometric patterns")
    print("  3. Venetian Carnival Mask - Gold with ornate decorations")
    print("  4. Beijing Opera Mask - Bold red/black dramatic design")
    print("  5. Mexican Day of the Dead - Colorful floral skull\n")
