#!/usr/bin/env node
/**
 * Cria um novo item no portfólio de forma interativa.
 *
 *   npm run new-video   → vídeo  (pasta em public/videos/<nome>/)
 *   npm run new-fotos   → coleção de fotos (pasta em public/fotos/<nome>/)
 *
 * Pergunta os campos, cria a pasta, adiciona o item no início de
 * public/js/portfolio.js e mostra o caminho para onde mover os arquivos.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const {
    ROOT,
    PUBLIC_DIR,
    PORTFOLIO_FILE,
    IMAGE_EXTENSIONS,
    VIDEO_EXTENSIONS,
    evaluatePortfolio,
    slugify,
    toJsString,
} = require('./lib/portfolio');

const TYPES = {
    video: { label: 'vídeo', baseDir: 'videos' },
    fotos: { label: 'coleção de fotos', baseDir: 'fotos' },
};

const LIST_START = 'window.PORTFOLIO_ITEMS = Object.freeze([';

const color = {
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
};

function fail(message) {
    console.error(color.red(`\n✖ ${message}\n`));
    process.exit(1);
}

/**
 * Lê respostas linha a linha. Usa uma fila própria para funcionar tanto no
 * terminal quanto com entrada redirecionada (pipe), sem perder linhas.
 */
function createPrompter() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
    const lines = [];
    const waiting = [];
    let closed = false;

    rl.on('line', (line) => (waiting.length ? waiting.shift()(line) : lines.push(line)));
    rl.on('close', () => {
        closed = true;
        while (waiting.length) waiting.shift()(null);
    });
    rl.on('SIGINT', () => {
        console.log(color.dim('\n\nCancelado. Nada foi alterado.'));
        process.exit(130);
    });

    return {
        question(text) {
            process.stdout.write(text);
            if (lines.length) return Promise.resolve(lines.shift());
            if (closed) return Promise.resolve(null);
            return new Promise((resolve) => waiting.push(resolve));
        },
        close: () => rl.close(),
    };
}

async function ask(rl, question, { required = false, defaultValue = '' } = {}) {
    const hint = defaultValue ? color.dim(` [${defaultValue}]`) : required ? '' : color.dim(' (opcional, Enter para pular)');
    for (;;) {
        const raw = await rl.question(`${color.bold(question)}${hint}: `);
        if (raw === null) fail('Entrada encerrada antes de terminar. Nada foi alterado.');
        if (!process.stdin.isTTY) process.stdout.write(`${raw}\n`);
        const answer = raw.trim();
        if (answer) return answer;
        if (defaultValue) return defaultValue;
        if (!required) return '';
        console.log(color.red('  Campo obrigatório.'));
    }
}

async function askAspect(rl) {
    for (;;) {
        const answer = (await ask(rl, 'Formato do card — (v)ertical ou (h)orizontal', { defaultValue: 'v' })).toLowerCase();
        if (['v', 'vertical'].includes(answer)) return 'vertical';
        if (['h', 'horizontal'].includes(answer)) return 'horizontal';
        console.log(color.red('  Responda "v" ou "h".'));
    }
}

/** Escolhe um nome de pasta que ainda não exista (ensaio, ensaio-2, ...). */
function uniqueFolder(baseDir, slug) {
    let candidate = `${baseDir}/${slug}`;
    for (let i = 2; fs.existsSync(path.join(PUBLIC_DIR, candidate)); i++) {
        candidate = `${baseDir}/${slug}-${i}`;
    }
    return candidate;
}

function formatItem(fields) {
    const lines = Object.entries(fields)
        .filter(([, value]) => value !== '' && value !== undefined)
        .map(([key, value]) => `        ${key}: ${toJsString(value)},`);
    return `    {\n${lines.join('\n')}\n    },`;
}

function insertItem(itemSource) {
    const source = fs.readFileSync(PORTFOLIO_FILE, 'utf8');
    if (!source.includes(LIST_START)) {
        fail(`Não encontrei "${LIST_START}" em public/js/portfolio.js.`);
    }

    const updated = source.replace(LIST_START, `${LIST_START}\n${itemSource}`);

    // Garante que o arquivo continua válido antes de salvar
    try {
        evaluatePortfolio(updated);
    } catch (err) {
        fail(`O item gerado deixaria portfolio.js inválido (${err.message}). Nada foi alterado.`);
    }

    fs.writeFileSync(PORTFOLIO_FILE, updated);
}

async function main() {
    const typeKey = process.argv[2];
    const type = TYPES[typeKey];
    if (!type) fail(`Uso: node scripts/new-item.js <${Object.keys(TYPES).join('|')}>`);

    const rl = createPrompter();

    console.log(color.bold(`\nNovo item: ${type.label}\n`));

    const title = await ask(rl, 'Título', { required: true });
    const client = await ask(rl, 'Cliente / marca');
    const desc = await ask(rl, 'Descrição');
    const metric = await ask(
        rl,
        typeKey === 'video' ? 'Métrica (ex.: +1M Views)' : 'Métrica (padrão: "N fotos")',
    );
    const aspect = await askAspect(rl);
    rl.close();

    const folder = uniqueFolder(type.baseDir, slugify(title));
    const absoluteFolder = path.join(PUBLIC_DIR, folder);

    insertItem(formatItem({ type: typeKey, folder, title, client, desc, metric, aspect }));
    fs.mkdirSync(absoluteFolder, { recursive: true });

    const relativeFolder = path.relative(ROOT, absoluteFolder);
    console.log(`\n${color.green('✔')} ${type.label} "${title}" adicionado no início de public/js/portfolio.js`);
    console.log(`${color.green('✔')} Pasta criada\n`);

    if (typeKey === 'video') {
        console.log(`📁 Mova o ${color.bold('vídeo')} (${VIDEO_EXTENSIONS.join(' ')}) para:`);
        console.log(`   ${color.cyan(absoluteFolder)}`);
        console.log(color.dim(`   Opcional: uma imagem de capa (${IMAGE_EXTENSIONS.join(' ')}) na mesma pasta.`));
        console.log(color.dim('   Sem capa, o card usa o primeiro frame do vídeo.'));
    } else {
        console.log(`📁 Mova as ${color.bold('fotos')} (${IMAGE_EXTENSIONS.join(' ')}) para:`);
        console.log(`   ${color.cyan(absoluteFolder)}`);
        console.log(color.dim('   A ordem segue o nome do arquivo (foto-2 antes de foto-10); a 1ª vira a capa.'));
    }

    console.log(`\nDepois rode: ${color.bold('npm run build')}  ${color.dim(`(pasta: ${relativeFolder})`)}\n`);
}

main().catch((err) => fail(err.message));
