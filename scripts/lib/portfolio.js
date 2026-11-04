'use strict';

/**
 * Utilitários compartilhados pelos scripts (build e criação de itens).
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORTFOLIO_FILE = path.join(PUBLIC_DIR, 'js', 'portfolio.js');
const MANIFEST_FILE = path.join(PUBLIC_DIR, 'js', 'media-manifest.js');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.m4v', '.mov'];

/** Executa o código de portfolio.js num sandbox e devolve a lista de itens. */
function evaluatePortfolio(source) {
    const sandbox = { window: {} };
    vm.runInNewContext(source, sandbox, { filename: PORTFOLIO_FILE });
    const items = sandbox.window.PORTFOLIO_ITEMS;
    if (!Array.isArray(items)) throw new Error('window.PORTFOLIO_ITEMS não encontrado ou não é uma lista.');
    return items;
}

function loadPortfolioItems() {
    return evaluatePortfolio(fs.readFileSync(PORTFOLIO_FILE, 'utf8'));
}

/** "Ensaio Café & Cia!" → "ensaio-cafe-cia" */
function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'item';
}

/** Gera uma string JS com aspas simples, escapando o necessário. */
function toJsString(value) {
    return `'${String(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, '\\n')}'`;
}

/** Converte um caminho relativo em URL segura (espaços, acentos, #, ?...). */
function toUrl(relativePath) {
    return relativePath.split('/').map(encodeURIComponent).join('/');
}

/** Ordem natural: foto-2 antes de foto-10. */
function naturalSort(a, b) {
    return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
}

module.exports = {
    ROOT,
    PUBLIC_DIR,
    PORTFOLIO_FILE,
    MANIFEST_FILE,
    IMAGE_EXTENSIONS,
    VIDEO_EXTENSIONS,
    evaluatePortfolio,
    loadPortfolioItems,
    slugify,
    toJsString,
    toUrl,
    naturalSort,
};
