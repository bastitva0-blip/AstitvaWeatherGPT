import sharp from "sharp";
import { mkdirSync } from "fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#020B14"/>
  <path d="M160 300a76 76 0 0 1 8-151 96 96 0 0 1 184-24 84 84 0 0 1-12 167H160z" fill="#00D4AA"/>
  <path d="M240 340l-36 64h44l-20 60 80-88h-46l28-36z" fill="#F5A524"/>
</svg>`;

mkdirSync("public/icons", { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`icon-${size}.png`);
}
