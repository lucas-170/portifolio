#!/usr/bin/env node
/**
 * Gera public/js/media-manifest.js a partir dos itens com `folder`
 * declarados em public/js/portfolio.js:
 *
 *   - coleção de fotos  → lista de todas as imagens da pasta
 *   - vídeo local       → o arquivo de vídeo da pasta + imagem de capa (opcional)
 *
 * O navegador não consegue listar arquivos de uma pasta, então esta etapa
 * roda no build e grava o resultado.
 *
 * Uso: npm run midia
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
    ROOT,
    PUBLIC_DIR,
    MANIFEST_FILE,
    IMAGE_EXTENSIONS,
    VIDEO_EXTENSIONS,
    loadPortfolioItems,
    toUrl,
    naturalSort,
} = require('./lib/portfolio');

// GitHub recusa arquivos > 100 MB; acima disso o deploy quebra.
const VIDEO_WARN_MB = 50;

function fail(message) {
    console.error(`\n✖ [mídia] ${message}\n`);
    process.exit(1);
}

function readFolder(folder) {
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
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort(naturalSort);

    const byExtension = (extensions) =>
        files.filter((name) => extensions.includes(path.extname(name).toLowerCase()));

    return {
        normalized,
        absolute,
        images: byExtension(IMAGE_EXTENSIONS),
        videos: byExtension(VIDEO_EXTENSIONS),
    };
}

function buildPhotoCollection(item) {
    const { normalized, absolute, images } = readFolder(item.folder);

    if (images.length === 0) {
        fail(`Nenhuma foto (${IMAGE_EXTENSIONS.join(' ')}) em public/${normalized}\n  → Mova as fotos para: ${absolute}`);
    }

    console.log(`✔ [mídia] fotos  ${item.folder}: ${images.length} foto(s)`);
    return { photos: images.map((name) => toUrl(`${normalized}/${name}`)) };
}

function buildLocalVideo(item) {
    const { normalized, absolute, images, videos } = readFolder(item.folder);

    if (videos.length === 0) {
        fail(`Nenhum vídeo (${VIDEO_EXTENSIONS.join(' ')}) em public/${normalized}\n  → Mova o vídeo para: ${absolute}`);
    }
    if (videos.length > 1) {
        fail(`Mais de um vídeo em public/${normalized} (${videos.join(', ')}). Deixe apenas um por pasta.`);
    }

    const [video] = videos;
    const sizeMb = fs.statSync(path.join(absolute, video)).size / 1024 / 1024;
    if (sizeMb > VIDEO_WARN_MB) {
        console.warn(`⚠ [mídia] ${normalized}/${video} tem ${sizeMb.toFixed(0)} MB — comprima para menos de ${VIDEO_WARN_MB} MB (GitHub recusa arquivos acima de 100 MB).`);
    }

    const thumbnail = (item.cover && images.find((name) => name === item.cover)) || images[0] || null;
    console.log(`✔ [mídia] vídeo  ${item.folder}: ${video}${thumbnail ? ` (capa: ${thumbnail})` : ' (sem capa — usando o 1º frame)'}`);

    return {
        video: toUrl(`${normalized}/${video}`),
        thumbnail: thumbnail ? toUrl(`${normalized}/${thumbnail}`) : null,
    };
}

function main() {
    let items;
    try {
        items = loadPortfolioItems();
    } catch (err) {
        fail(`Erro ao ler public/js/portfolio.js: ${err.message}`);
    }

    const manifest = {};
    for (const item of items.filter((i) => i && i.folder)) {
        manifest[item.folder] = item.type === 'video' ? buildLocalVideo(item) : buildPhotoCollection(item);
    }

    const output =
        '// ARQUIVO GERADO AUTOMATICAMENTE por scripts/build-media.js — não edite.\n' +
        `window.MEDIA_MANIFEST = ${JSON.stringify(manifest, null, 4)};\n`;

    fs.writeFileSync(MANIFEST_FILE, output);
    console.log(`✔ [mídia] ${path.relative(ROOT, MANIFEST_FILE)} gerado (${Object.keys(manifest).length} pasta(s)).`);
}

main();
