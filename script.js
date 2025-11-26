// ============================================================
// CONFIGURATION
// ============================================================

// Mask collection - Replace these paths with your actual mask images
const MASKS = [
    { id: 'japanese_noh', label: 'Japanese Noh Mask', path: 'assets/masks/japanese_noh.png' },
    { id: 'african_tribal', label: 'African Tribal Mask', path: 'assets/masks/african_tribal.png' },
    { id: 'venetian', label: 'Venetian Carnival Mask', path: 'assets/masks/venetian.png' },
    { id: 'beijing_opera', label: 'Beijing Opera Mask', path: 'assets/masks/beijing_opera.png' },
    { id: 'mexican_dod', label: 'Mexican Day of the Dead Skull', path: 'assets/masks/mexican_dod.png' },
];

// Gesture sensitivity settings - Adjust these values to fine-tune swipe detection
const GESTURE_CONFIG = {
    minSwipeDistance: 100,      // Minimum horizontal distance for swipe (pixels)
    maxSwipeTime: 600,          // Maximum time for swipe (milliseconds)
    minSwipeTime: 300,          // Minimum time for swipe (milliseconds)
    cooldownTime: 1000,         // Cooldown between mask switches (milliseconds)
};

// Mask positioning and scaling - Adjust these for mask fit
const MASK_CONFIG = {
    scaleMultiplier: 2.8,       // Overall mask size multiplier
    verticalOffset: -0.15,      // Vertical position adjustment (-0.3 to 0.3)
    horizontalOffset: 0,        // Horizontal position adjustment
    rotationSensitivity: 0.5,   // How much mask rotates with head tilt (0-1)
};

// ============================================================
// GLOBAL STATE
// ============================================================

let currentMaskIndex = 0;
let maskImages = [];
let faceMesh = null;
let hands = null;
let camera = null;
let isTracking = false;
let lastFaceData = null;
let lastHandData = null;

// Gesture tracking
let swipeStartX = null;
let swipeStartTime = null;
let lastSwitchTime = 0;
let isSwipeInProgress = false;

// DOM Elements
let webcamElement;
let canvasElement;
let canvasCtx;
let maskNameElement;
let swipeFeedbackElement;
let loadingIndicator;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    webcamElement = document.getElementById('webcam');
    canvasElement = document.getElementById('mask-canvas');
    canvasCtx = canvasElement.getContext('2d');
    maskNameElement = document.getElementById('mask-name');
    swipeFeedbackElement = document.getElementById('swipe-feedback');
    loadingIndicator = document.getElementById('loading-indicator');

    // Setup button listeners
    document.getElementById('enable-camera-btn').addEventListener('click', initCamera);
    document.getElementById('retry-btn').addEventListener('click', () => {
        hideError();
        initCamera();
    });

    // Preload mask images
    preloadMasks();
});

// Preload all mask images
function preloadMasks() {
    MASKS.forEach((mask, index) => {
        const img = new Image();
        img.src = mask.path;
        img.onerror = () => {
            // If mask image fails to load, create a placeholder
            console.warn(`Failed to load mask: ${mask.path}. Using placeholder.`);
            const placeholder = createPlaceholderMask(mask.label);
            maskImages[index] = placeholder;
        };
        img.onload = () => {
            maskImages[index] = img;
        };
        maskImages[index] = img;
    });
}

// Create placeholder mask if image doesn't exist
function createPlaceholderMask(label) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Draw a simple mask placeholder
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(200, 200, 150, 180, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye holes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(150, 180, 25, 35, 0, 0, Math.PI * 2);
    ctx.ellipse(250, 180, 25, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, 200, 350);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
}

// ============================================================
// CAMERA INITIALIZATION
// ============================================================

async function initCamera() {
    try {
        // Hide permission screen
        document.getElementById('permission-screen').style.display = 'none';
        document.getElementById('ar-view').style.display = 'block';

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        webcamElement.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            webcamElement.onloadedmetadata = () => {
                resolve();
            };
        });

        // Set canvas size to match video
        canvasElement.width = webcamElement.videoWidth;
        canvasElement.height = webcamElement.videoHeight;

        // Initialize tracking
        await initFaceTracking();
        await initHandTracking();

        // Start camera loop
        startTracking();

        // Update UI
        updateMaskName();

    } catch (error) {
        console.error('Camera initialization error:', error);
        showError('Failed to access camera. Please ensure you have granted camera permissions and are using HTTPS or localhost.');
    }
}

// ============================================================
// FACE TRACKING
// ============================================================

async function initFaceTracking() {
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceResults);
}

function onFaceResults(results) {
    lastFaceData = results;
    if (!isTracking) return;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw mask if face detected
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        updateMaskPosition(landmarks);
    }

    canvasCtx.restore();
}

// ============================================================
// HAND TRACKING
// ============================================================

async function initHandTracking() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onHandResults);
}

function onHandResults(results) {
    lastHandData = results;
    if (!isTracking) return;

    // Detect hand swipe gesture
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const handLandmarks = results.multiHandLandmarks[0];
        detectHandSwipe(handLandmarks);
    } else {
        // Reset swipe tracking when hand is not detected
        resetSwipeTracking();
    }
}

// ============================================================
// TRACKING LOOP
// ============================================================

function startTracking() {
    isTracking = true;
    loadingIndicator.style.display = 'none';

    async function trackingLoop() {
        if (!isTracking) return;

        // Send video frame to face mesh
        if (faceMesh && webcamElement.readyState === 4) {
            await faceMesh.send({ image: webcamElement });
        }

        // Send video frame to hand tracking
        if (hands && webcamElement.readyState === 4) {
            await hands.send({ image: webcamElement });
        }

        requestAnimationFrame(trackingLoop);
    }

    trackingLoop();
}

// ============================================================
// MASK POSITIONING AND RENDERING
// ============================================================

function updateMaskPosition(landmarks) {
    const currentMask = maskImages[currentMaskIndex];
    if (!currentMask || !currentMask.complete) return;

    // Key facial landmarks for positioning
    const noseTip = landmarks[1];           // Nose tip
    const leftEye = landmarks[33];          // Left eye outer corner
    const rightEye = landmarks[263];        // Right eye outer corner
    const foreheadTop = landmarks[10];      // Forehead top
    const chinBottom = landmarks[152];      // Chin bottom
    const leftCheek = landmarks[234];       // Left cheek
    const rightCheek = landmarks[454];      // Right cheek

    // Convert normalized coordinates to canvas coordinates
    const width = canvasElement.width;
    const height = canvasElement.height;

    const nose = { x: noseTip.x * width, y: noseTip.y * height };
    const leftEyePos = { x: leftEye.x * width, y: leftEye.y * height };
    const rightEyePos = { x: rightEye.x * width, y: rightEye.y * height };
    const forehead = { x: foreheadTop.x * width, y: foreheadTop.y * height };
    const chin = { x: chinBottom.x * width, y: chinBottom.y * height };
    const leftCheekPos = { x: leftCheek.x * width, y: leftCheek.y * height };
    const rightCheekPos = { x: rightCheek.x * width, y: rightCheek.y * height };

    // Calculate face dimensions
    const faceWidth = Math.abs(rightCheekPos.x - leftCheekPos.x);
    const faceHeight = Math.abs(chin.y - forehead.y);
    const eyeDistance = Math.abs(rightEyePos.x - leftEyePos.x);

    // Calculate mask size based on face width
    const maskWidth = faceWidth * MASK_CONFIG.scaleMultiplier;
    const maskHeight = (maskWidth / currentMask.width) * currentMask.height;

    // Calculate center point between eyes for mask anchor
    const centerX = (leftEyePos.x + rightEyePos.x) / 2;
    const centerY = (leftEyePos.y + rightEyePos.y) / 2;

    // Apply offsets
    const maskX = centerX + (MASK_CONFIG.horizontalOffset * faceWidth);
    const maskY = centerY + (faceHeight * MASK_CONFIG.verticalOffset);

    // Calculate rotation based on eye positions
    const angle = Math.atan2(
        rightEyePos.y - leftEyePos.y,
        rightEyePos.x - leftEyePos.x
    ) * MASK_CONFIG.rotationSensitivity;

    // Draw mask
    canvasCtx.save();
    canvasCtx.translate(maskX, maskY);
    canvasCtx.rotate(angle);
    canvasCtx.drawImage(
        currentMask,
        -maskWidth / 2,
        -maskHeight / 2,
        maskWidth,
        maskHeight
    );
    canvasCtx.restore();
}

// ============================================================
// GESTURE DETECTION
// ============================================================

function detectHandSwipe(handLandmarks) {
    // Get palm center (landmark 9 is middle finger base, good palm center proxy)
    const palmCenter = handLandmarks[9];
    const palmX = palmCenter.x * canvasElement.width;
    const palmY = palmCenter.y * canvasElement.height;

    // Check if cooldown period has passed
    const now = Date.now();
    if (now - lastSwitchTime < GESTURE_CONFIG.cooldownTime) {
        return;
    }

    // Check if face is detected to compare with palm position
    if (!lastFaceData || !lastFaceData.multiFaceLandmarks || lastFaceData.multiFaceLandmarks.length === 0) {
        return;
    }

    const faceLandmarks = lastFaceData.multiFaceLandmarks[0];
    const faceLeftEdge = faceLandmarks[234];  // Left cheek
    const faceRightEdge = faceLandmarks[454]; // Right cheek
    const faceTop = faceLandmarks[10];        // Forehead
    const faceBottom = faceLandmarks[152];    // Chin

    const faceLeft = faceLeftEdge.x * canvasElement.width;
    const faceRight = faceRightEdge.x * canvasElement.width;
    const faceTopY = faceTop.y * canvasElement.height;
    const faceBottomY = faceBottom.y * canvasElement.height;

    // Check if palm is near face vertically
    const isNearFaceVertically = palmY >= faceTopY - 100 && palmY <= faceBottomY + 100;

    if (!isNearFaceVertically) {
        resetSwipeTracking();
        return;
    }

    // Start tracking swipe
    if (!isSwipeInProgress) {
        swipeStartX = palmX;
        swipeStartTime = now;
        isSwipeInProgress = true;
        return;
    }

    // Calculate swipe distance and duration
    const swipeDistance = Math.abs(palmX - swipeStartX);
    const swipeDuration = now - swipeStartTime;

    // Check if swipe is valid
    if (
        swipeDistance >= GESTURE_CONFIG.minSwipeDistance &&
        swipeDuration >= GESTURE_CONFIG.minSwipeTime &&
        swipeDuration <= GESTURE_CONFIG.maxSwipeTime
    ) {
        // Determine swipe direction
        const isLeftToRight = palmX > swipeStartX;
        const isRightToLeft = palmX < swipeStartX;

        // Check if swipe crossed the face
        const crossedFace =
            (isLeftToRight && swipeStartX < faceLeft && palmX > faceRight) ||
            (isRightToLeft && swipeStartX > faceRight && palmX < faceLeft);

        if (crossedFace) {
            switchMask();
            resetSwipeTracking();
        }
    }

    // Reset if swipe takes too long
    if (swipeDuration > GESTURE_CONFIG.maxSwipeTime) {
        resetSwipeTracking();
    }
}

function resetSwipeTracking() {
    swipeStartX = null;
    swipeStartTime = null;
    isSwipeInProgress = false;
}

// ============================================================
// MASK SWITCHING
// ============================================================

function switchMask() {
    // Update mask index
    currentMaskIndex = (currentMaskIndex + 1) % MASKS.length;

    // Update UI
    updateMaskName();
    showSwipeFeedback();

    // Update last switch time
    lastSwitchTime = Date.now();

    // Add animation class to canvas
    canvasElement.classList.add('mask-switch');
    setTimeout(() => {
        canvasElement.classList.remove('mask-switch');
    }, 400);
}

function updateMaskName() {
    maskNameElement.textContent = MASKS[currentMaskIndex].label;
}

function showSwipeFeedback() {
    swipeFeedbackElement.classList.add('show');
    setTimeout(() => {
        swipeFeedbackElement.classList.remove('show');
    }, 800);
}

// ============================================================
// ERROR HANDLING
// ============================================================

function showError(message) {
    document.getElementById('ar-view').style.display = 'none';
    document.getElementById('error-screen').style.display = 'flex';
    document.getElementById('error-message').textContent = message;
    isTracking = false;
}

function hideError() {
    document.getElementById('error-screen').style.display = 'none';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Calculate distance between two points
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// ============================================================
// CUSTOMIZATION NOTES
// ============================================================

/*
CUSTOMIZATION GUIDE:

1. REPLACING MASK FILES:
   - Add your mask PNG files to the assets/masks/ directory
   - Update the MASKS array at the top of this file with new paths
   - Masks should be PNG format with transparent backgrounds
   - Recommended size: 800x800 pixels or larger

2. ADJUSTING MASK POSITION AND SCALE:
   - Modify MASK_CONFIG object values:
     * scaleMultiplier: Make mask bigger (>2.8) or smaller (<2.8)
     * verticalOffset: Move mask up (negative) or down (positive)
     * horizontalOffset: Move mask left (negative) or right (positive)
     * rotationSensitivity: Increase (>0.5) for more rotation, decrease for less

3. ADJUSTING GESTURE SENSITIVITY:
   - Modify GESTURE_CONFIG object values:
     * minSwipeDistance: Increase for longer swipes required
     * maxSwipeTime: Increase to allow slower swipes
     * cooldownTime: Time between allowed mask switches

4. ADDING MORE MASKS:
   - Simply add more objects to the MASKS array following the same format
   - The app will automatically cycle through all masks

5. CHANGING FACE LANDMARKS FOR POSITIONING:
   - See MediaPipe Face Mesh landmark documentation:
     https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
   - Modify the landmark indices in updateMaskPosition() function
*/
