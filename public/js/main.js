(() => {
    'use strict';

    const mediaManifest = window.MEDIA_MANIFEST || {};
    const items = (window.PORTFOLIO_ITEMS || []).map(normalizeItem).filter(Boolean);

    // ---------- Elements ----------
    const viewport = document.getElementById('carousel-viewport');
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    const cardTemplate = document.getElementById('video-card-template');

    const modal = document.getElementById('video-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalMediaContainer = document.getElementById('modal-video-container');
    const modalTitle = document.getElementById('modal-title');
    const modalClient = document.getElementById('modal-client');
    const modalMetric = document.getElementById('modal-metric');
    const modalMetricIcon = document.getElementById('modal-metric-icon');
    const modalDesc = document.getElementById('modal-desc');

    document.getElementById('year').textContent = String(new Date().getFullYear());

    // Crachá: se public/perfil.jpg ainda não existir, mostra o ícone de reserva
    const badgePhoto = document.getElementById('badge-photo');
    const hideBadgePhoto = () => badgePhoto.remove();
    if (badgePhoto.complete && badgePhoto.naturalWidth === 0) hideBadgePhoto();
    else badgePhoto.addEventListener('error', hideBadgePhoto);

    const SWIPE_THRESHOLD = 40;

    // ---------- Data ----------

    /**
     * Itens com `folder` (vídeo local ou coleção de fotos) recebem os arquivos
     * listados no build (media-manifest.js). Vídeos com `videoUrl` passam direto.
     */
    function normalizeItem(item) {
        const base = {
            ...item,
            aspect: item.aspect || 'vertical',
            client: item.client || '',
            desc: item.desc || '',
            metric: item.metric || '',
        };

        if (!item.folder) return base;

        const media = mediaManifest[item.folder];
        if (!media) {
            console.warn(`[portfólio] "${item.title}" ignorado: rode "npm run build" para listar os arquivos de "${item.folder}".`);
            return null;
        }

        if (item.type === 'video') {
            return { ...base, videoUrl: media.video, thumbnail: media.thumbnail };
        }

        const fileName = (url) => decodeURIComponent(url.split('/').pop());
        const cover = (item.cover && media.photos.find((url) => fileName(url) === item.cover)) || media.photos[0];

        return {
            ...base,
            photos: media.photos,
            thumbnail: cover,
            metric: base.metric || `${media.photos.length} fotos`,
        };
    }

    const isCollection = (item) => Array.isArray(item.photos);

    // ---------- Carousel state ----------
    let currentIndex = 0;
    let visibleCount = getVisibleCardsCount();
    let cards = [];

    const DOT_ACTIVE = 'w-7 h-2.5 rounded-full bg-purple-500 transition-all duration-300';
    const DOT_INACTIVE = 'w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-zinc-500 transition-all duration-300';

    // Mesmos breakpoints do Tailwind (sm = 640px, lg = 1024px)
    function getVisibleCardsCount() {
        if (window.matchMedia('(min-width: 1024px)').matches) return 3;
        if (window.matchMedia('(min-width: 640px)').matches) return 2;
        return 1;
    }

    function getMaxIndex() {
        return Math.max(0, cards.length - visibleCount);
    }

    function createCard(item) {
        const card = cardTemplate.content.firstElementChild.cloneNode(true);

        const thumb = card.querySelector('[data-thumb]');
        const img = card.querySelector('[data-img]');
        const isVertical = item.aspect === 'vertical';

        thumb.classList.add(isVertical ? 'aspect-[9/12]' : 'aspect-video');

        if (item.thumbnail) {
            img.src = item.thumbnail;
            img.width = 600;
            img.height = isVertical ? 800 : 338;
        } else if (item.videoUrl) {
            // Vídeo sem capa: mostra o primeiro frame do próprio vídeo
            const preview = document.createElement('video');
            preview.className = img.className;
            preview.muted = true;
            preview.playsInline = true;
            preview.preload = 'metadata';
            preview.src = `${item.videoUrl}#t=0.1`;
            preview.setAttribute('aria-hidden', 'true');
            img.replaceWith(preview);
        }

        if (isCollection(item)) {
            const icon = card.querySelector('[data-icon]');
            icon.classList.remove('fa-play', 'ml-0.5');
            icon.classList.add('fa-images');
        }

        const metric = card.querySelector('[data-metric]');
        if (item.metric) metric.textContent = item.metric;
        else metric.parentElement.remove();

        card.querySelector('[data-client]').textContent = item.client;
        card.querySelector('[data-title]').textContent = item.title;
        card.querySelector('[data-desc]').textContent = item.desc;

        const openBtn = card.querySelector('[data-play]');
        const label = isCollection(item) ? 'Ver coleção de fotos' : 'Assistir vídeo';
        openBtn.setAttribute('aria-label', `${label}: ${item.title}`);
        openBtn.addEventListener('click', () => openModal(item, openBtn));

        return card;
    }

    function renderCards() {
        cards = items.map(createCard);
        track.replaceChildren(...cards);
    }

    function renderDots() {
        const totalPositions = getMaxIndex() + 1;
        const dots = [];

        for (let i = 0; i < totalPositions; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Ir para a posição ${i + 1} de ${totalPositions}`);
            dot.addEventListener('click', () => goTo(i));
            dots.push(dot);
        }

        dotsContainer.replaceChildren(...dots);
    }

    function goTo(index) {
        currentIndex = Math.min(Math.max(index, 0), getMaxIndex());
        updateCarousel();
    }

    function updateCarousel() {
        // Deslocamento em pixels: largura real do card + gap do flex.
        // (Usar % aqui gera um desalinhamento acumulado por causa do gap.)
        const firstCard = cards[0];
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;

        track.style.transform = `translateX(${-currentIndex * step}px)`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= getMaxIndex();

        dotsContainer.querySelectorAll('button').forEach((dot, i) => {
            const isActive = i === currentIndex;
            dot.className = isActive ? DOT_ACTIVE : DOT_INACTIVE;
            if (isActive) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Navegação por teclado (Tab) até um card fora da área visível:
    // ajusta o carrossel em vez de deixar o navegador rolar o viewport.
    track.addEventListener('focusin', (e) => {
        const index = cards.indexOf(e.target.closest('article'));
        if (index === -1) return;

        viewport.scrollLeft = 0;
        if (index < currentIndex) goTo(index);
        else if (index >= currentIndex + visibleCount) goTo(index - visibleCount + 1);
    });

    addSwipe(track, () => goTo(currentIndex + 1), () => goTo(currentIndex - 1));

    // Resize: recalcula (no máximo 1x por frame) e refaz os dots se mudou o breakpoint
    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (resizeFrame) return;
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            const newVisibleCount = getVisibleCardsCount();
            if (newVisibleCount !== visibleCount) {
                visibleCount = newVisibleCount;
                renderDots();
            }
            goTo(currentIndex);
        });
    });

    function addSwipe(element, onNext, onPrev) {
        let startX = null;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (startX === null) return;
            const diffX = startX - e.changedTouches[0].clientX;
            if (diffX > SWIPE_THRESHOLD) onNext();
            else if (diffX < -SWIPE_THRESHOLD) onPrev();
            startX = null;
        }, { passive: true });
    }

    // ---------- Photo gallery (dentro do modal) ----------
    const GALLERY_ARROW = 'absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-white flex items-center justify-center hover:bg-purple-600 hover:border-purple-500 backdrop-blur-md transition-all duration-300';
    const THUMB_ACTIVE = 'ring-2 ring-purple-500 opacity-100';
    const THUMB_INACTIVE = 'opacity-50 hover:opacity-100';

    let gallery = null; // { item, index, img, counter, thumbs }

    function createIconButton(className, iconClass, label) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = className;
        btn.setAttribute('aria-label', label);
        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.setAttribute('aria-hidden', 'true');
        btn.append(icon);
        return btn;
    }

    function buildGallery(item) {
        const wrapper = document.createElement('div');
        wrapper.className = 'w-full flex flex-col';

        const stage = document.createElement('div');
        stage.className = 'relative flex items-center justify-center bg-black min-h-[300px]';

        const img = document.createElement('img');
        img.className = 'max-h-[55vh] max-w-full w-auto object-contain select-none';
        img.decoding = 'async';

        const counter = document.createElement('div');
        counter.className = 'absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-zinc-200';
        counter.setAttribute('aria-live', 'polite');

        stage.append(img, counter);

        const thumbsBar = document.createElement('div');
        thumbsBar.className = 'flex gap-2 overflow-x-auto p-3 bg-zinc-950';

        const thumbs = item.photos.map((src, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all duration-300';
            btn.setAttribute('aria-label', `Ver foto ${i + 1} de ${item.photos.length}`);
            btn.addEventListener('click', () => showPhoto(i));

            const thumbImg = document.createElement('img');
            thumbImg.src = src;
            thumbImg.alt = '';
            thumbImg.loading = 'lazy';
            thumbImg.decoding = 'async';
            thumbImg.className = 'w-full h-full object-cover';

            btn.append(thumbImg);
            return btn;
        });
        thumbsBar.append(...thumbs);

        if (item.photos.length > 1) {
            const prev = createIconButton(`${GALLERY_ARROW} left-3`, 'fa-solid fa-chevron-left text-sm', 'Foto anterior');
            const next = createIconButton(`${GALLERY_ARROW} right-3`, 'fa-solid fa-chevron-right text-sm', 'Próxima foto');
            prev.addEventListener('click', () => showPhoto(gallery.index - 1));
            next.addEventListener('click', () => showPhoto(gallery.index + 1));
            stage.append(prev, next);
            addSwipe(stage, () => showPhoto(gallery.index + 1), () => showPhoto(gallery.index - 1));
            wrapper.append(stage, thumbsBar);
        } else {
            wrapper.append(stage);
        }

        gallery = { item, index: 0, img, counter, thumbs };
        return wrapper;
    }

    function preload(src) {
        const img = new Image();
        img.src = src;
    }

    function showPhoto(index) {
        if (!gallery) return;
        const { item, img, counter, thumbs } = gallery;
        const total = item.photos.length;

        // Navegação circular
        gallery.index = (index + total) % total;

        img.src = item.photos[gallery.index];
        img.alt = `${item.title} — foto ${gallery.index + 1} de ${total}`;
        counter.textContent = `${gallery.index + 1} / ${total}`;

        thumbs.forEach((thumb, i) => {
            const isActive = i === gallery.index;
            thumb.classList.remove(...(isActive ? THUMB_INACTIVE : THUMB_ACTIVE).split(' '));
            thumb.classList.add(...(isActive ? THUMB_ACTIVE : THUMB_INACTIVE).split(' '));
            if (isActive) {
                thumb.setAttribute('aria-current', 'true');
                thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            } else {
                thumb.removeAttribute('aria-current');
            }
        });

        // Pré-carrega a próxima foto para a troca ficar instantânea
        if (total > 1) preload(item.photos[(gallery.index + 1) % total]);
    }

    // ---------- Video ----------
    function buildVideo(item) {
        const video = document.createElement('video');
        video.className = 'w-full max-h-[70vh] rounded-lg';
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.src = item.videoUrl;
        if (item.thumbnail) video.poster = item.thumbnail;
        video.textContent = 'Seu navegador não suporta a tag de vídeo.';
        return video;
    }

    // ---------- Modal ----------
    let lastFocusedElement = null;

    function getFocusableInModal() {
        return [...modal.querySelectorAll('button, a[href], video[controls], [tabindex]:not([tabindex="-1"])')];
    }

    function onModalKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (gallery && e.key === 'ArrowRight') showPhoto(gallery.index + 1);
        if (gallery && e.key === 'ArrowLeft') showPhoto(gallery.index - 1);

        // Mantém o foco dentro do modal
        if (e.key === 'Tab') {
            const focusable = getFocusableInModal();
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    function openModal(item, trigger) {
        lastFocusedElement = trigger;

        modalTitle.textContent = item.title;
        modalClient.textContent = item.client;
        modalMetric.textContent = item.metric;
        modalMetric.parentElement.classList.toggle('hidden', !item.metric);
        modalDesc.textContent = item.desc;
        modalMetricIcon.className = isCollection(item) ? 'fa-solid fa-images' : 'fa-solid fa-chart-line';

        if (isCollection(item)) {
            modalMediaContainer.replaceChildren(buildGallery(item));
            showPhoto(0);
        } else {
            modalMediaContainer.replaceChildren(buildVideo(item));
        }

        modal.inert = false;
        modal.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onModalKeydown);
        closeModalBtn.focus();
    }

    function closeModal() {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.inert = true;
        modalMediaContainer.replaceChildren();
        gallery = null;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onModalKeydown);

        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ---------- Init ----------
    if (items.length === 0) {
        // Nenhum trabalho cadastrado ainda: mostra aviso e esconde os controles
        const empty = document.createElement('p');
        empty.className = 'w-full py-12 text-center text-zinc-500';
        empty.textContent = 'Novos trabalhos em breve.';
        track.replaceChildren(empty);
        [prevBtn, nextBtn, dotsContainer].forEach((el) => el.classList.add('hidden'));
        return;
    }

    renderCards();
    renderDots();
    updateCarousel();
})();
