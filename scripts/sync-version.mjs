#!/usr/bin/env node
/**
 * Sync the app version across package.json, src-tauri/Cargo.toml, and
 * src-tauri/tauri.conf.json from a single source: package.json.
 *
 * Source of truth: package.json#version (release-please bumps this file).
 * Targets kept in sync: src-tauri/Cargo.toml, src-tauri/tauri.conf.json.
 *
 * Run: `npm run sync-version` (via the "sync-version" script in package.json).
 * Exits non-zero if the three files drift out of sync after the run.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

const pkgPath = resolve(root, 'package.json');
const cargoPath = resolve(root, 'src-tauri/Cargo.toml');
const tauriConfPath = resolve(root, 'src-tauri/tauri.conf.json');

const version = readJSON(pkgPath).version;
if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error(`[sync-version] invalid version in package.json: ${version}`);
  process.exit(1);
}

let changed = false;

// Sync src-tauri/Cargo.toml — [package] table `version = "x.y.z"`.
const cargo = readText(cargoPath);
const cargoNext = cargo.replace(
  /^(version\s*=\s*")[^"]*(")/m,
  `version = "${version}"`,
);
if (cargo !== cargoNext) {
  writeFileSync(cargoPath, cargoNext);
  changed = true;
  console.log(`[sync-version] src-tauri/Cargo.toml -> ${version}`);
}

// Sync src-tauri/tauri.conf.json — top-level "version" key.
const tauriConf = readJSON(tauriConfPath);
if (tauriConf.version !== version) {
  tauriConf.version = version;
  writeFileSync(tauriConfPath, `${JSON.stringify(tauriConf, null, 2)}\n`);
  changed = true;
  console.log(`[sync-version] src-tauri/tauri.conf.json -> ${version}`);
}

if (!changed) {
  console.log(`[sync-version] all files already at ${version}`);
} else {
  console.log(`[sync-version] done, synced to ${version}`);
}
