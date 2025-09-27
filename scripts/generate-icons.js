const sharp = require('sharp');

const svgContent192 = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="48" fill="black"/>
  <rect x="20" y="20" width="152" height="152" rx="38" fill="url(#gradient)"/>
  <path d="M96 60L120 84L120 108L96 132L72 108L72 84L96 60Z" fill="white" opacity="0.9"/>
  <circle cx="96" cy="96" r="8" fill="white"/>
  <defs>
    <linearGradient id="gradient" x1="20" y1="20" x2="172" y2="172" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A855F7"/>
      <stop offset="0.5" stop-color="#EC4899"/>
      <stop offset="1" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
</svg>`;

const svgContent512 = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="black"/>
  <rect x="56" y="56" width="400" height="400" rx="100" fill="url(#gradient)"/>
  <path d="M256 160L320 224L320 288L256 352L192 288L192 224L256 160Z" fill="white" opacity="0.9"/>
  <circle cx="256" cy="256" r="20" fill="white"/>
  <defs>
    <linearGradient id="gradient" x1="56" y1="56" x2="456" y2="456" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A855F7"/>
      <stop offset="0.5" stop-color="#EC4899"/>
      <stop offset="1" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
</svg>`;

// Generate 192x192 PNG
sharp(Buffer.from(svgContent192))
  .png()
  .toFile('public/icon-192.png')
  .then(() => console.log('Generated icon-192.png'))
  .catch(err => console.error('Error generating icon-192.png:', err));

// Generate 512x512 PNG
sharp(Buffer.from(svgContent512))
  .png()
  .toFile('public/icon-512.png')
  .then(() => console.log('Generated icon-512.png'))
  .catch(err => console.error('Error generating icon-512.png:', err));