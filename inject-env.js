#!/usr/bin/env node
/**
 * inject-env.js
 * Remplace les tokens __VITE_FIREBASE_*__ dans public/index.html
 * par les variables d'environnement Vercel au moment du build.
 *
 * Utilisé par : vercel.json → buildCommand
 */

const fs   = require("fs");
const path = require("path");

const SRC  = path.join(__dirname, "../public/index.html");
const DIST = path.join(__dirname, "../dist/index.html");

// Mapping token → variable d'environnement
const TOKENS = {
  __VITE_FIREBASE_API_KEY__:              process.env.FIREBASE_API_KEY,
  __VITE_FIREBASE_AUTH_DOMAIN__:          process.env.FIREBASE_AUTH_DOMAIN,
  __VITE_FIREBASE_PROJECT_ID__:           process.env.FIREBASE_PROJECT_ID,
  __VITE_FIREBASE_STORAGE_BUCKET__:       process.env.FIREBASE_STORAGE_BUCKET,
  __VITE_FIREBASE_MESSAGING_SENDER_ID__:  process.env.FIREBASE_MESSAGING_SENDER_ID,
  __VITE_FIREBASE_APP_ID__:              process.env.FIREBASE_APP_ID,
};

// Vérifier que toutes les variables sont définies
const missing = Object.entries(TOKENS)
  .filter(([, v]) => !v)
  .map(([k]) => k.replace(/__/g, "").replace(/^VITE_/, ""));

if (missing.length > 0) {
  console.error("❌ Variables d'environnement manquantes :");
  missing.forEach(k => console.error(`   • ${k}`));
  console.error("\nDéfinissez-les dans Vercel → Settings → Environment Variables");
  process.exit(1);
}

// Lire, remplacer, écrire
fs.mkdirSync(path.dirname(DIST), { recursive: true });

let html = fs.readFileSync(SRC, "utf8");

Object.entries(TOKENS).forEach(([token, value]) => {
  html = html.replaceAll(token, value);
});

fs.writeFileSync(DIST, html, "utf8");

console.log(`✅ Build OK — ${path.relative(process.cwd(), DIST)}`);
console.log(`   Firebase project : ${process.env.FIREBASE_PROJECT_ID}`);
