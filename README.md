# Portfólio — Social Media & Video Creator

Site estático (HTML + Tailwind CSS + JavaScript puro).

## Estrutura

```
public/            ← tudo que vai para o ar
  index.html
  favicon.svg
  css/styles.css   ← GERADO pelo build (não editar, não versionado)
  fotos/           ← pastas das coleções de fotos (uma pasta por coleção)
  js/portfolio.js  ← lista de vídeos e coleções do carrossel (edite aqui)
  js/photo-manifest.js ← GERADO pelo build (lista de fotos de cada pasta)
  js/main.js       ← lógica do carrossel, do modal e da galeria
scripts/build-photos.js ← lê as pastas de fotos e gera o photo-manifest.js
src/styles.css     ← entrada do Tailwind + CSS customizado
tailwind.config.js
vercel.json
```

## Rodando localmente

```bash
npm install
npm run dev        # recompila o CSS a cada alteração
```

Depois é só abrir `public/index.html` no navegador.

## Build / Deploy

```bash
npm run build      # lista as fotos + gera public/css/styles.css minificado
```

Na Vercel o `vercel.json` já configura o build (`npm run build`) e a pasta publicada (`public`).

## Adicionando um vídeo

Adicione um objeto em `public/js/portfolio.js`:

```js
{
    title: 'Título',
    client: 'Cliente',
    aspect: 'vertical', // ou 'horizontal'
    metric: '+1M Views',
    desc: 'Descrição curta.',
    thumbnail: 'https://...',
    videoUrl: 'https://...mp4',
},
```

## Adicionando uma coleção de fotos

1. Coloque as fotos numa pasta dentro de `public/`, por exemplo `public/fotos/ensaio-cafe/`.
   Formatos aceitos: `.jpg .jpeg .png .webp .avif .gif`. A ordem segue o nome
   do arquivo (ordem natural: `foto-2` vem antes de `foto-10`).
2. Adicione em `public/js/portfolio.js`, só informando a pasta:

```js
{
    folder: 'fotos/ensaio-cafe',
    title: 'Ensaio Cafeteria',
    client: 'Café Aroma',       // opcional
    desc: 'Fotos para o feed.', // opcional
    cover: 'capa.jpg',          // opcional (padrão: primeira foto)
},
```

3. Rode `npm run build` (ou só `npm run fotos`) para atualizar a lista de fotos.
   Se a pasta não existir ou estiver vazia, o build para e mostra o erro.

> Dica: exporte as fotos já otimizadas para web (ex.: lado maior com ~2000px,
> JPG/WebP com qualidade ~80). Fotos direto da câmera (10+ MB) deixam o site lento.
