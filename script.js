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

// Layer Reveal gesture settings - Left hand forward motion
const LAYER_REVEAL_CONFIG = {
    minZDepthChange: 0.08,      // Minimum Z-depth decrease to trigger (0-1 scale)
    maxRevealTime: 400,         // Maximum time for forward motion (milliseconds)
    minRevealTime: 200,         // Minimum time for forward motion (milliseconds)
    cooldownTime: 1000,         // Cooldown between layer reveals (milliseconds)
    animationDuration: 1000,    // Total animation duration (milliseconds)
    leftSideThreshold: 0.5,     // Hand must be on left half of screen (0-1)
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

// Gesture tracking (right-hand swipe)
let swipeStartX = null;
let swipeStartTime = null;
let lastSwitchTime = 0;
let isSwipeInProgress = false;

// Layer Reveal tracking (left-hand forward motion)
let leftHandStartZ = null;
let leftHandStartTime = null;
let lastLayerRevealTime = 0;
let isLayerRevealInProgress = false;
let layerRevealAnimation = {
    active: false,
    startTime: 0,
    progress: 0
};

// DOM Elements
let webcamElement;
let canvasElement;
let canvasCtx;
let maskNameElement;
let swipeFeedbackElement;
let loadingIndicator;
let layerRevealFeedbackElement;

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
    layerRevealFeedbackElement = document.getElementById('layer-reveal-feedback');
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
        maxNumHands: 2,  // Track both hands
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onHandResults);
}

function onHandResults(results) {
    lastHandData = results;
    if (!isTracking) return;

    // Separate left and right hands
    let leftHand = null;
    let rightHand = null;

    if (results.multiHandLandmarks && results.multiHandedness) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const handedness = results.multiHandedness[i].label; // "Left" or "Right"
            const landmarks = results.multiHandLandmarks[i];

            // Note: MediaPipe uses mirrored labels for front camera
            // "Left" means user's right hand, "Right" means user's left hand
            if (handedness === 'Right') {  // User's left hand
                leftHand = landmarks;
            } else if (handedness === 'Left') {  // User's right hand
                rightHand = landmarks;
            }
        }
    }

    // Detect left-hand forward motion for layer reveal
    if (leftHand) {
        detectLayerReveal(leftHand);
    } else {
        resetLayerRevealTracking();
    }

    // Detect right-hand swipe for mask switching
    if (rightHand) {
        detectHandSwipe(rightHand);
    } else {
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

    // Update layer reveal animation progress
    if (layerRevealAnimation.active) {
        const elapsed = Date.now() - layerRevealAnimation.startTime;
        layerRevealAnimation.progress = Math.min(elapsed / LAYER_REVEAL_CONFIG.animationDuration, 1);

        if (layerRevealAnimation.progress >= 1) {
            layerRevealAnimation.active = false;
            layerRevealAnimation.progress = 0;
        }
    }

    // Draw mask with layer reveal effect if active
    canvasCtx.save();
    canvasCtx.translate(maskX, maskY);
    canvasCtx.rotate(angle);

    if (layerRevealAnimation.active) {
        // Draw mask with layer deconstruction effect
        drawMaskWithLayers(currentMask, maskWidth, maskHeight, layerRevealAnimation.progress);
    } else {
        // Draw normal mask
        canvasCtx.drawImage(
            currentMask,
            -maskWidth / 2,
            -maskHeight / 2,
            maskWidth,
            maskHeight
        );
    }

    canvasCtx.restore();
}

// ============================================================
// LAYER REVEAL RENDERING
// ============================================================

function drawMaskWithLayers(maskImage, maskWidth, maskHeight, progress) {
    // Layer reveal progresses in 3 stages:
    // Stage 1 (0.0 - 0.33): Remove outer decorations/patterns
    // Stage 2 (0.33 - 0.66): Remove mid-layer patterns
    // Stage 3 (0.66 - 1.0): Show only base shape/color

    const stage1 = Math.min(progress / 0.33, 1);  // 0 to 1 in first third
    const stage2 = Math.max(0, Math.min((progress - 0.33) / 0.33, 1));  // 0 to 1 in second third
    const stage3 = Math.max(0, Math.min((progress - 0.66) / 0.34, 1));  // 0 to 1 in final third

    // Draw full mask first
    canvasCtx.globalAlpha = 1.0;
    canvasCtx.drawImage(
        maskImage,
        -maskWidth / 2,
        -maskHeight / 2,
        maskWidth,
        maskHeight
    );

    // Create visual layer peeling effect
    if (progress > 0) {
        // Outer decoration layer - fade and slide off
        if (stage1 > 0) {
            canvasCtx.save();
            canvasCtx.globalAlpha = Math.max(0, 0.4 - stage1 * 0.4);
            canvasCtx.globalCompositeOperation = 'destination-out';

            // Create gradient mask for outer layer
            const gradient = canvasCtx.createRadialGradient(0, 0, 0, 0, 0, maskWidth * 0.6);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(stage1 * 0.8, `rgba(255, 255, 255, ${stage1 * 0.3})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${stage1 * 0.8})`);

            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(-maskWidth / 2, -maskHeight / 2, maskWidth, maskHeight);
            canvasCtx.restore();
        }

        // Mid-pattern layer - desaturate and fade
        if (stage2 > 0) {
            canvasCtx.save();
            canvasCtx.globalAlpha = stage2 * 0.5;
            canvasCtx.globalCompositeOperation = 'destination-out';

            const gradient2 = canvasCtx.createRadialGradient(0, 0, 0, 0, 0, maskWidth * 0.45);
            gradient2.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient2.addColorStop(stage2 * 0.6, `rgba(255, 255, 255, ${stage2 * 0.4})`);
            gradient2.addColorStop(1, `rgba(255, 255, 255, ${stage2 * 0.7})`);

            canvasCtx.fillStyle = gradient2;
            canvasCtx.fillRect(-maskWidth / 2, -maskHeight / 2, maskWidth, maskHeight);
            canvasCtx.restore();
        }

        // Base layer - show simplified silhouette
        if (stage3 > 0) {
            canvasCtx.save();
            canvasCtx.globalAlpha = stage3 * 0.6;
            canvasCtx.globalCompositeOperation = 'destination-out';

            const gradient3 = canvasCtx.createRadialGradient(0, 0, 0, 0, 0, maskWidth * 0.3);
            gradient3.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient3.addColorStop(stage3 * 0.5, `rgba(255, 255, 255, ${stage3 * 0.3})`);
            gradient3.addColorStop(1, `rgba(255, 255, 255, ${stage3 * 0.5})`);

            canvasCtx.fillStyle = gradient3;
            canvasCtx.fillRect(-maskWidth / 2, -maskHeight / 2, maskWidth, maskHeight);
            canvasCtx.restore();
        }

        // Add glowing outline effect during reveal
        canvasCtx.save();
        canvasCtx.globalAlpha = Math.sin(progress * Math.PI) * 0.6;  // Pulse effect
        canvasCtx.globalCompositeOperation = 'source-over';
        canvasCtx.strokeStyle = '#00FFFF';
        canvasCtx.lineWidth = 3;
        canvasCtx.shadowBlur = 15;
        canvasCtx.shadowColor = '#00FFFF';

        // Draw outline around mask
        const outlineScale = 1 - progress * 0.15;
        canvasCtx.strokeRect(
            -maskWidth / 2 * outlineScale,
            -maskHeight / 2 * outlineScale,
            maskWidth * outlineScale,
            maskHeight * outlineScale
        );
        canvasCtx.restore();
    }

    canvasCtx.globalAlpha = 1.0;
    canvasCtx.globalCompositeOperation = 'source-over';
}

// ============================================================
// GESTURE DETECTION
// ============================================================

// Left-hand forward motion detection for layer reveal
function detectLayerReveal(handLandmarks) {
    // Get palm center (landmark 9)
    const palmCenter = handLandmarks[9];
    const palmX = palmCenter.x;
    const palmZ = palmCenter.z;  // Z-depth (negative = closer to camera)

    const now = Date.now();

    // Check cooldown
    if (now - lastLayerRevealTime < LAYER_REVEAL_CONFIG.cooldownTime) {
        return;
    }

    // Check if hand is on left side of screen
    if (palmX > LAYER_REVEAL_CONFIG.leftSideThreshold) {
        resetLayerRevealTracking();
        return;
    }

    // Start tracking forward motion
    if (!isLayerRevealInProgress) {
        leftHandStartZ = palmZ;
        leftHandStartTime = now;
        isLayerRevealInProgress = true;
        return;
    }

    // Calculate Z-depth change (negative = moving forward)
    const zDepthChange = leftHandStartZ - palmZ;
    const duration = now - leftHandStartTime;

    // Check if forward motion is valid
    if (
        zDepthChange >= LAYER_REVEAL_CONFIG.minZDepthChange &&
        duration >= LAYER_REVEAL_CONFIG.minRevealTime &&
        duration <= LAYER_REVEAL_CONFIG.maxRevealTime
    ) {
        // Trigger layer reveal
        triggerLayerReveal();
        resetLayerRevealTracking();
    }

    // Reset if motion takes too long
    if (duration > LAYER_REVEAL_CONFIG.maxRevealTime) {
        resetLayerRevealTracking();
    }
}

function resetLayerRevealTracking() {
    leftHandStartZ = null;
    leftHandStartTime = null;
    isLayerRevealInProgress = false;
}

function triggerLayerReveal() {
    // Start the layer reveal animation
    layerRevealAnimation.active = true;
    layerRevealAnimation.startTime = Date.now();
    layerRevealAnimation.progress = 0;
    lastLayerRevealTime = Date.now();

    // Show UI feedback
    showLayerRevealFeedback();
}

function showLayerRevealFeedback() {
    if (layerRevealFeedbackElement) {
        layerRevealFeedbackElement.classList.add('show');
        setTimeout(() => {
            layerRevealFeedbackElement.classList.remove('show');
        }, LAYER_REVEAL_CONFIG.animationDuration + 200);
    }
}

// Right-hand swipe detection for mask switching
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

3. ADJUSTING RIGHT-HAND SWIPE GESTURE SENSITIVITY:
   - Modify GESTURE_CONFIG object values:
     * minSwipeDistance: Increase for longer swipes required
     * maxSwipeTime: Increase to allow slower swipes
     * cooldownTime: Time between allowed mask switches

4. ADJUSTING LEFT-HAND LAYER REVEAL SENSITIVITY:
   - Modify LAYER_REVEAL_CONFIG object values:
     * minZDepthChange: Increase for more forward motion required (0-1 scale)
     * maxRevealTime: Maximum time for forward motion (milliseconds)
     * minRevealTime: Minimum time for forward motion (milliseconds)
     * animationDuration: How long the reveal animation lasts
     * leftSideThreshold: Screen position threshold for left hand (0-1)

5. ADDING MORE MASKS:
   - Simply add more objects to the MASKS array following the same format
   - The app will automatically cycle through all masks

6. CHANGING FACE LANDMARKS FOR POSITIONING:
   - See MediaPipe Face Mesh landmark documentation:
     https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
   - Modify the landmark indices in updateMaskPosition() function

GESTURE INTERACTIONS:
- RIGHT HAND: Swipe across face to switch to next mask
- LEFT HAND: Push forward toward camera to trigger layer reveal animation
  (reveals mask construction from decorations → patterns → base shape)
*/
