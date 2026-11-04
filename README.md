# Portfólio — Social Media & Video Creator

Site estático (HTML + Tailwind CSS + JavaScript puro).

## Estrutura

```
public/            ← tudo que vai para o ar
  index.html
  favicon.svg
  css/styles.css   ← GERADO pelo build (não editar, não versionado)
  videos/<nome>/   ← um vídeo por pasta (+ capa opcional)
  fotos/<nome>/    ← uma coleção de fotos por pasta
  js/portfolio.js  ← lista de vídeos e coleções do carrossel
  js/media-manifest.js ← GERADO pelo build (arquivos de cada pasta)
  js/main.js       ← lógica do carrossel, do modal e da galeria
scripts/new-item.js    ← comandos new-video / new-fotos
scripts/build-media.js ← lê as pastas e gera o media-manifest.js
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
npm run build      # lista vídeos/fotos + gera public/css/styles.css minificado
```

Na Vercel o `vercel.json` já configura o build (`npm run build`) e a pasta publicada (`public`).

## Adicionando trabalhos

```bash
npm run new-video   # novo vídeo
npm run new-fotos   # nova coleção de fotos
```

O comando pergunta título, cliente, descrição, métrica e formato do card,
adiciona o item no início de `public/js/portfolio.js`, cria a pasta e mostra
o caminho para onde mover os arquivos:

- **Vídeo** → `public/videos/<nome>/`: mova **um** vídeo (`.mp4` recomendado;
  também `.webm .m4v .mov`) e, se quiser, uma imagem de capa. Sem capa, o card
  mostra o primeiro frame do vídeo.
- **Fotos** → `public/fotos/<nome>/`: mova todas as fotos (`.jpg .jpeg .png
  .webp .avif .gif`). A ordem segue o nome do arquivo (`foto-2` antes de
  `foto-10`) e a primeira vira a capa.

Depois rode `npm run build` (ou só `npm run midia`). Se faltar arquivo
em alguma pasta, o build para e mostra o caminho.

Para editar ou remover um trabalho, altere `public/js/portfolio.js` (e apague
a pasta correspondente). Os campos opcionais estão documentados no topo dele.

### Dicas de tamanho

- **Vídeos:** comprima para menos de ~50 MB (o build avisa). O GitHub recusa
  arquivos acima de 100 MB. Para vídeos longos, prefira hospedar fora e usar
  `videoUrl` (veja o topo do `portfolio.js`).
- **Fotos:** exporte para web (lado maior ~2000px, JPG/WebP qualidade ~80).
