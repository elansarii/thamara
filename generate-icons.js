const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const logoPath = path.join(__dirname, 'public', 'thamara_logo.svg');
  const appDir = path.join(__dirname, 'src', 'app');
  
  try {
    // Generate icon.png (Next.js will use this automatically)
    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(appDir, 'icon.png'));
    
    console.log('✓ Generated icon.png (180x180)');
    
    // Generate apple-icon.png (specific for Apple Touch Icon)
    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(appDir, 'apple-icon.png'));
    
    console.log('✓ Generated apple-icon.png (180x180)');
    
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
