const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

/**
 * Translation Sync Script
 * Synchronizes all locale files with en.json as the base reference
 */

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const BASE_LOCALE = 'en.json';

// Command line options
const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

function log(message, force = false) {
  if (isVerbose || force) {
    console.log(message);
  }
}

function validateJSON(content, filePath) {
  try {
    JSON.parse(content);
    return true;
  } catch (error) {
    console.error(`❌ Invalid JSON in ${filePath}: ${error.message}`);
    return false;
  }
}

function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }

    return current[key];
  }, obj);
  target[lastKey] = value;
}

function removeNestedKey(obj, keyPath) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => current?.[key], obj);
  if (target && lastKey in target) {
    delete target[lastKey];
  }
}

function createBackup(filePath) {
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  log(`📋 Backup created: ${backupPath}`);
}

function syncTranslationFile(baseContent, targetFilePath) {
  if (!fs.existsSync(targetFilePath)) {
    log(`⚠️  File not found: ${targetFilePath}`, true);
    return;
  }

  const targetContent = fs.readFileSync(targetFilePath, 'utf8');

  if (!validateJSON(targetContent, targetFilePath)) {
    return;
  }

  const baseObj = JSON.parse(baseContent);
  const targetObj = JSON.parse(targetContent);

  const baseKeys = getAllKeys(baseObj);
  const targetKeys = getAllKeys(targetObj);

  let hasChanges = false;
  const changes = {
    added: [],
    removed: [],
  };

  // Remove keys that don't exist in base
  for (const key of targetKeys) {
    if (!baseKeys.includes(key)) {
      removeNestedKey(targetObj, key);
      changes.removed.push(key);
      hasChanges = true;
    }
  }

  // Add missing keys from base
  for (const key of baseKeys) {
    if (!targetKeys.includes(key)) {
      const baseValue = getNestedValue(baseObj, key);
      setNestedValue(targetObj, key, baseValue);
      changes.added.push(key);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    log(`📝 Changes for ${path.basename(targetFilePath)}:`);
    if (changes.added.length > 0) {
      log(`  ➕ Added: ${changes.added.join(', ')}`);
    }

    if (changes.removed.length > 0) {
      log(`  ➖ Removed: ${changes.removed.join(', ')}`);
    }

    if (isDryRun) {
      log(`🔍 [DRY RUN] Would update ${path.basename(targetFilePath)}`, true);
    } else {
      createBackup(targetFilePath);
      fs.writeFileSync(
        targetFilePath,
        JSON.stringify(targetObj, null, 2) + '\n',
      );
      log(`✅ Updated ${path.basename(targetFilePath)}`, true);
    }
  } else {
    log(`✅ ${path.basename(targetFilePath)} is already in sync`);
  }
}

function main() {
  console.log('🔄 Starting translation sync...');

  if (isDryRun) {
    console.log('🔍 Running in dry-run mode - no files will be modified');
  }

  // Read all files in src/locales directory
  if (!fs.existsSync(LOCALES_DIR)) {
    throw new Error(`❌ Locales directory not found: ${LOCALES_DIR}`);
  }

  const localeFiles = fs
    .readdirSync(LOCALES_DIR)
    .filter((file) => file.endsWith('.json'))
    .filter((file) => file !== 'index.ts');

  log(`📂 Found locale files: ${localeFiles.join(', ')}`);

  // Make src/locales/en.json as base reference
  const baseFilePath = path.join(LOCALES_DIR, BASE_LOCALE);
  if (!fs.existsSync(baseFilePath)) {
    throw new Error(`❌ Base locale file not found: ${baseFilePath}`);
  }

  const baseContent = fs.readFileSync(baseFilePath, 'utf8');
  if (!validateJSON(baseContent, baseFilePath)) {
    throw new Error(`❌ Base locale file is invalid: ${baseFilePath}`);
  }

  log(`📋 Using ${BASE_LOCALE} as base reference`);

  // Sync each locale file
  for (const file of localeFiles) {
    if (file === BASE_LOCALE) {
      continue; // Skip base file
    }

    const targetFilePath = path.join(LOCALES_DIR, file);
    syncTranslationFile(baseContent, targetFilePath);
  }

  console.log('✅ Translation sync completed');
}

if (require.main === module) {
  main();
}
