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
 *
 * TODO: substituir as thumbnails (Unsplash) e os vídeos de exemplo
 * pelos trabalhos reais.
 */
window.PORTFOLIO_ITEMS = Object.freeze([
    {
        title: 'Cortes Dinâmicos & Legendas Efeito Hormozi',
        client: 'Marca de Tecnologia',
        aspect: 'vertical',
        metric: '+1.4M Visualizações',
        desc: 'Edição focada na retenção inicial com hook visual de 2 segundos, legendas coloridas e sound design expressivo.',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
        title: 'Anúncio de Alta Conversão (UGC Sales)',
        client: 'Loja de E-commerce',
        aspect: 'vertical',
        metric: '3.8x ROAS em Tráfego Pago',
        desc: 'Estruturação de VSL rápida, aplicação de provas sociais na tela e call to action clara para aumento do CTR.',
        thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
    {
        title: 'Teaser Cinematográfico com Motion Graphics',
        client: 'Podcast de Negócios',
        aspect: 'horizontal',
        metric: '+800k Reach Orgânico',
        desc: 'Animações sutis em 2D, gráficos de métricas e sincronização ritmada com a trilha sonora.',
        thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
        title: 'Conteúdo Educacional Rápido para TikTok',
        client: 'Expert em Finanças',
        aspect: 'vertical',
        metric: '+45k Novos Seguidores',
        desc: 'Formato ultra-dinâmico reduzindo pausas da fala e inserindo elementos visuais B-roll para retenção contínua.',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
    {
        title: 'YouTube Shorts - Dicas de Produtividade',
        client: 'Criador de Conteúdo',
        aspect: 'vertical',
        metric: '+920k Views',
        desc: 'Utilização de memes bem posicionados, efeitos sonoros cômicos e transições rápidas de cena.',
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4',
    },
    {
        title: 'Campanha Institucional & Branding',
        client: 'Agência Digital',
        aspect: 'horizontal',
        metric: '+250k Engajamento',
        desc: 'Edição elegante com Color Grading personalizado e ritmo focado na construção de autoridade.',
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
        title: 'E-commerce Ad - Lançamento de Produto',
        client: 'Brand Fashion',
        aspect: 'vertical',
        metric: '4.5x CTR no Instagram',
        desc: 'Cortes rápidos ao som da batida, destaque de benefícios e chamada direta para a loja.',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    },
]);
