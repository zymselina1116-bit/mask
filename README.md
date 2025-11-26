# Cultural Mask AR Filter

A browser-based augmented reality face filter that overlays cultural masks on your face in real-time and allows you to switch between masks using hand gestures.

## Features

- **Real-time face tracking** using MediaPipe Face Mesh (478 facial landmarks)
- **AR mask overlay** that follows head movement, rotation, and scaling
- **Hand gesture control** - Swipe your hand across your face to switch masks
- **5 cultural masks** from different traditions around the world
- **Smooth animations** and visual feedback
- **Automatic placeholder generation** if mask images are missing

## Cultural Masks Included

1. Japanese Noh Mask
2. African Tribal Mask
3. Venetian Carnival Mask
4. Beijing Opera Mask
5. Mexican Day of the Dead Skull

## Installation & Setup

### 1. Clone or Download

```bash
git clone <repository-url>
cd mask
```

### 2. Add Mask Images (Optional)

Place your mask PNG files in `assets/masks/` directory:
- japanese_noh.png
- african_tribal.png
- venetian.png
- beijing_opera.png
- mexican_dod.png

**Note**: If you don't have mask images, the app will auto-generate placeholders!

### 3. Run Local Server

The app requires a local server (camera access won't work with `file://` protocol).

**Using Python 3:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx serve
```

**Using PHP:**
```bash
php -S localhost:8000
```

### 4. Open in Browser

Navigate to: `http://localhost:8000`

## Usage

1. Click "Enable Camera" to grant camera permission
2. Wait for face and hand tracking to initialize
3. Your face will be detected and a mask will appear
4. To switch masks: **Swipe your hand across your face** (left to right or right to left)
5. Current mask name is displayed in the bottom-right corner

## Customization

All customization options are in `script.js`:

### Adjust Mask Position & Size

```javascript
const MASK_CONFIG = {
    scaleMultiplier: 2.8,       // Make bigger/smaller
    verticalOffset: -0.15,      // Move up/down
    horizontalOffset: 0,        // Move left/right
    rotationSensitivity: 0.5,   // Head tilt response
};
```

### Adjust Gesture Sensitivity

```javascript
const GESTURE_CONFIG = {
    minSwipeDistance: 100,      // Minimum swipe distance (pixels)
    maxSwipeTime: 600,          // Maximum swipe time (ms)
    minSwipeTime: 300,          // Minimum swipe time (ms)
    cooldownTime: 1000,         // Delay between switches (ms)
};
```

### Add More Masks

Edit the `MASKS` array in `script.js`:

```javascript
const MASKS = [
    { id: 'new_mask', label: 'New Mask Name', path: 'assets/masks/new_mask.png' },
    // ... existing masks
];
```

## Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Logic and interactivity
- **MediaPipe Face Mesh** - Face detection and landmark tracking
- **MediaPipe Hands** - Hand detection and gesture recognition
- **Canvas API** - Mask rendering

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 14.3+)

**Requirements:**
- Modern browser with WebRTC support
- Camera access
- HTTPS or localhost

## File Structure

```
mask/
├── index.html          # Main HTML file
├── style.css           # Styles and animations
├── script.js           # Application logic
├── assets/
│   └── masks/
│       ├── README.md
│       └── (mask PNG files)
└── README.md
```

## Troubleshooting

**Camera not working?**
- Ensure you're using `http://localhost` or `https://`
- Check camera permissions in browser settings
- Make sure no other app is using the camera

**Masks not appearing?**
- Face must be clearly visible and well-lit
- Keep your face centered in the frame
- Try adjusting `MASK_CONFIG` values in script.js

**Gesture not working?**
- Swipe your entire palm across your face
- Move at a moderate speed (not too fast/slow)
- Make sure hand is clearly visible
- Adjust `GESTURE_CONFIG` values for sensitivity

## Performance Tips

- Good lighting improves tracking accuracy
- Close other browser tabs for better performance
- Reduce video resolution if experiencing lag

## Credits

Built with:
- [MediaPipe](https://google.github.io/mediapipe/) by Google
- Face Mesh and Hands models

## License

This project is open source and available for educational purposes.
