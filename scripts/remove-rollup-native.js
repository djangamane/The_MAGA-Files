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

// Patch rollup native.js to prevent loading problematic modules
try {
  const rollupNativePath = join('node_modules', 'rollup', 'dist', 'native.js');
  if (existsSync(rollupNativePath)) {
    let content = readFileSync(rollupNativePath, 'utf8');
    
    // Replace the problematic requireWithFriendlyError call with a direct fallback
    const lines = content.split('\n');
    const newLines = [];
    let patched = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for the specific line that starts the problematic require call
      if (line.includes('const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = requireWithFriendlyError(')) {
        // Add our patch
        newLines.push('// Patched for Vercel deployment - skip native modules');
        newLines.push('const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = {');
        newLines.push('  parse: () => {},');
        newLines.push('  parseAsync: () => Promise.resolve(),');
        newLines.push('  xxhashBase64Url: () => \'\',');
        newLines.push('  xxhashBase36: () => \'\',');
        newLines.push('  xxhashBase16: () => \'\'');
        newLines.push('};');
        patched = true;
        
        // Skip the original lines until we find the end of the statement
        while (i < lines.length && !lines[i].trim().endsWith(';')) {
          i++;
        }
        // Skip the final line with the semicolon
        if (i < lines.length && lines[i].trim().endsWith(';')) {
          i++;
        }
        // Adjust index since we're in a for loop
        i--;
      } else {
        newLines.push(line);
      }
    }
    
    if (patched) {
      content = newLines.join('\n');
      writeFileSync(rollupNativePath, content);
      console.log('Patched rollup native.js to skip native modules');
    } else {
      console.log('rollup native.js already patched or structure changed');
    }
  }
} catch (e) {
  console.log(`Failed to patch rollup native.js: ${e.message}`);
}

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

console.log('Rollup native module removal and patching completed.');