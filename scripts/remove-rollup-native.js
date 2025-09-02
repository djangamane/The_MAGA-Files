import { existsSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Remove rollup native modules that cause issues on Vercel
const modulesToRemove = [
  '@rollup/rollup-linux-x64-gnu',
  '@rollup/rollup-linux-arm64-gnu',
  '@rollup/rollup-linux-x64-musl',
  '@rollup/rollup-linux-arm64-musl'
];

console.log('Removing problematic rollup native modules...');

let removedCount = 0;
for (const module of modulesToRemove) {
  const modulePath = join('node_modules', module);
  try {
    if (existsSync(modulePath)) {
      rmSync(modulePath, { recursive: true });
      console.log(`Removed ${module}`);
      removedCount++;
    } else {
      console.log(`Module ${module} not found, skipping...`);
    }
  } catch (e) {
    console.log(`Failed to remove ${module}: ${e.message}`);
  }
}

console.log(`Removed ${removedCount} problematic modules`);

// Also try to remove from package-lock.json
try {
  const packageLockPath = join('package-lock.json');
  if (existsSync(packageLockPath)) {
    const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
    
    // Remove optional dependencies entries
    if (packageLock.packages) {
      for (const [pkgPath, pkgInfo] of Object.entries(packageLock.packages)) {
        if (pkgPath.includes('@rollup') && pkgPath.includes('linux')) {
          delete packageLock.packages[pkgPath];
          console.log(`Removed ${pkgPath} from package-lock.json`);
        }
      }
    }
    
    // Remove from dependencies
    if (packageLock.dependencies && packageLock.dependencies.vite) {
      const viteDeps = packageLock.dependencies.vite;
      if (viteDeps.requires) {
        for (const module of modulesToRemove) {
          if (viteDeps.requires[module]) {
            delete viteDeps.requires[module];
            console.log(`Removed ${module} from vite dependencies`);
          }
        }
      }
    }
    
    writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
    console.log('Updated package-lock.json');
  }
} catch (e) {
  console.log(`Failed to update package-lock.json: ${e.message}`);
}

console.log('Rollup native module removal completed.');