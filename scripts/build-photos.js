#!/usr/bin/env node
/**
 * Gera public/js/photo-manifest.js a partir das coleções de fotos
 * declaradas em public/js/portfolio.js (itens com a propriedade `folder`).
 *
 * O navegador não consegue listar arquivos de uma pasta, então esta etapa
 * roda no build e grava a lista de fotos de cada pasta.
 *
 * Uso: node scripts/build-photos.js
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORTFOLIO_FILE = path.join(PUBLIC_DIR, 'js', 'portfolio.js');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'js', 'photo-manifest.js');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function fail(message) {
    console.error(`\n✖ [fotos] ${message}\n`);
    process.exit(1);
}

/** Executa portfolio.js num sandbox para ler a lista de itens. */
function loadPortfolioItems() {
    const sandbox = { window: {} };
    try {
        vm.runInNewContext(fs.readFileSync(PORTFOLIO_FILE, 'utf8'), sandbox, { filename: PORTFOLIO_FILE });
    } catch (err) {
        fail(`Erro ao ler ${path.relative(ROOT, PORTFOLIO_FILE)}: ${err.message}`);
    }
    return sandbox.window.PORTFOLIO_ITEMS || [];
}

/** Converte um caminho relativo em URL segura (espaços, acentos, #, ?...). */
function toUrl(relativePath) {
    return relativePath.split('/').map(encodeURIComponent).join('/');
}

function listPhotos(folder) {
    const normalized = folder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    const absolute = path.resolve(PUBLIC_DIR, normalized);

    if (!absolute.startsWith(PUBLIC_DIR + path.sep)) {
        fail(`A pasta "${folder}" precisa estar dentro de public/.`);
    }
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) {
        fail(`Pasta não encontrada: public/${normalized}`);
    }

    const files = fs
        .readdirSync(absolute, { withFileTypes: true })
        .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map((entry) => entry.name)
        // Ordem natural: foto-2 vem antes de foto-10
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));

    if (files.length === 0) {
        fail(`Nenhuma foto (${[...IMAGE_EXTENSIONS].join(', ')}) encontrada em public/${normalized}`);
    }

    return { key: folder, photos: files.map((name) => toUrl(`${normalized}/${name}`)) };
}

function main() {
    const collections = loadPortfolioItems().filter((item) => item && item.folder);
    const manifest = {};

    for (const { folder } of collections) {
        const { key, photos } = listPhotos(folder);
        manifest[key] = photos;
        console.log(`✔ [fotos] ${folder}: ${photos.length} foto(s)`);
    }

    const output =
        '// ARQUIVO GERADO AUTOMATICAMENTE por scripts/build-photos.js — não edite.\n' +
        `window.PHOTO_MANIFEST = ${JSON.stringify(manifest, null, 4)};\n`;

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✔ [fotos] ${path.relative(ROOT, OUTPUT_FILE)} gerado (${collections.length} coleção(ões)).`);
}

main();
