# Mask Images Directory

This directory should contain your mask image files in PNG format with transparent backgrounds.

## Required Files

The application expects the following mask files:

1. `japanese_noh.png` - Japanese Noh Mask
2. `african_tribal.png` - African Tribal Mask
3. `venetian.png` - Venetian Carnival Mask
4. `beijing_opera.png` - Beijing Opera Mask
5. `mexican_dod.png` - Mexican Day of the Dead Skull

## Image Requirements

- **Format**: PNG with transparent background
- **Recommended size**: 800x800 pixels or larger
- **Aspect ratio**: Square or slightly taller than wide works best

## Adding Masks

1. Add your PNG files to this directory
2. Make sure the filenames match those listed in `script.js` MASKS array
3. If the app can't find an image, it will automatically generate a placeholder

## Note

If you don't have mask images yet, the application will still work! It will create placeholder masks automatically so you can test the face tracking and gesture detection features.
