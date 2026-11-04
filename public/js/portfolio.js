/**
 * Itens exibidos no carrossel do portfólio (na ordem desta lista).
 *
 * ★ Jeito fácil: rode `npm run new-video` ou `npm run new-fotos`.
 *   O comando pergunta os campos, adiciona o item aqui e cria a pasta
 *   para você só mover os arquivos. Depois rode `npm run build`.
 *
 * ── VÍDEO LOCAL (arquivo dentro de public/) ───────────────────────────
 *   {
 *       type: 'video',
 *       folder: 'videos/meu-video',   // 1 vídeo (.mp4 .webm .m4v .mov)
 *                                     // + capa opcional (.jpg .png .webp...)
 *       title: 'Título',              // obrigatório
 *       client, desc, metric,         // opcionais
 *       aspect: 'vertical',           // 'vertical' | 'horizontal'
 *   },
 *
 * ── VÍDEO EXTERNO (URL) ───────────────────────────────────────────────
 *   { title, client, desc, metric, aspect, thumbnail, videoUrl }
 *
 * ── COLEÇÃO DE FOTOS ──────────────────────────────────────────────────
 *   {
 *       type: 'fotos',
 *       folder: 'fotos/ensaio-cafe',  // todas as fotos da pasta, em ordem
 *                                     // natural (foto-2 antes de foto-10)
 *       title: 'Ensaio Cafeteria',    // obrigatório
 *       client, desc,                 // opcionais
 *       metric: '+30% engajamento',   // opcional (padrão: "N fotos")
 *       cover: 'capa.jpg',            // opcional (padrão: primeira foto)
 *       aspect: 'vertical',
 *   },
 *
 * Itens com `folder` precisam de `npm run build` (ou `npm run midia`)
 * depois de adicionar/trocar arquivos.
 */
window.PORTFOLIO_ITEMS = Object.freeze([
    {
        type: 'fotos',
        folder: 'fotos/chaveamento-competicoes',
        title: 'Chaveamento competiçoẽs',
        client: 'OL.CENTRAL',
        desc: 'Libertadores - Suldamerica - Copa do Brasil',
        aspect: 'vertical',
    },
    {
        type: 'fotos',
        folder: 'fotos/colecao-nova',
        title: 'Coleção nova',
        client: 'axomege',
        desc: 'Lançamento de Coleção — Moda',
        aspect: 'vertical',
    },
    {
        type: 'video',
        folder: 'videos/triunfo-do-bahia',
        title: 'Triunfo do Bahia',
        client: 'OL.CENTRAL',
        metric: '15k',
        aspect: 'vertical',
    },
    {
        type: 'video',
        folder: 'videos/lancamento-de-colecao-moda',
        title: 'Lançamento de Coleção — Moda',
        client: 'axomege',
        desc: 'Coleção nova',
        metric: '10k',
        aspect: 'vertical',
    },
]);
