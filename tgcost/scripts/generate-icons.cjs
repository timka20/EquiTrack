const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000" rx="80"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">Tg</text>
</svg>
`;

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const splashScreens = [
  { width: 640, height: 1136, name: 'splash-640x1136' },
  { width: 750, height: 1334, name: 'splash-750x1334' },
  { width: 1242, height: 2208, name: 'splash-1242x2208' },
  { width: 1125, height: 2436, name: 'splash-1125x2436' },
  { width: 828, height: 1792, name: 'splash-828x1792' },
  { width: 1242, height: 2688, name: 'splash-1242x2688' },
  { width: 1170, height: 2532, name: 'splash-1170x2532' },
  { width: 1284, height: 2778, name: 'splash-1284x2778' },
];

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);

  for (const size of iconSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }

  for (const { width, height, name } of splashScreens) {

    const splashSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#000000"/>
      <text x="${width/2}" y="${height/2 + 40}" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">TgCost</text>
    </svg>
    `;

    await sharp(Buffer.from(splashSvg))
      .png()
      .toFile(path.join(iconsDir, `${name}.png`));
    console.log(`✓ ${name}.png (${width}x${height})`);
  }

  console.log('\n✅ Все иконки и splash screen\'ы сгенерированы!');
}

generateIcons().catch(console.error);
