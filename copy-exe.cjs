const fs = require('fs');
const path = require('path');

const packageJson = require('./package.json');
const appName = packageJson.productName || packageJson.name;
const exeName = `${appName}.exe`;

const distElectron = path.join(__dirname, 'dist-electron');
const srcPath = path.join(distElectron, exeName);
const destPath = path.join(__dirname, exeName);

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${path.basename(dir)}/`);
  }
}

function cleanBuildArtifacts() {
  if (!fs.existsSync(distElectron)) return;

  for (const entry of fs.readdirSync(distElectron, { withFileTypes: true })) {
    const fullPath = path.join(distElectron, entry.name);
    if (entry.isDirectory() && entry.name.startsWith('win-unpacked')) {
      removeDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.7z') || entry.name.endsWith('.blockmap'))) {
      fs.unlinkSync(fullPath);
      console.log(`Removed ${entry.name}`);
    }
  }

  removeDir(path.join(__dirname, 'dist-electron-build'));
}

if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, destPath);
  console.log(`Successfully copied ${exeName} to root folder!`);
  cleanBuildArtifacts();
} else {
  const altSrcPath = path.join(__dirname, 'dist', exeName);
  if (fs.existsSync(altSrcPath)) {
    fs.copyFileSync(altSrcPath, destPath);
    console.log(`Successfully copied ${exeName} to root folder!`);
    cleanBuildArtifacts();
  } else {
    console.error(`Could not find compiled executable at ${srcPath} or ${altSrcPath}`);
    process.exit(1);
  }
}
