/* Diamond Realty · site v3.
   Mécaniques relevées dans le code de fourmula.ai (28/10/2026) : préchargeur à compteur (0, 17, 35, 58, 76, 89, 100 en 2,5 s,
   photos qui changent toutes les 0,5 s, flou 20 px), anneau d'images qui tourne en 32 s, mots qui s'allument en couleur,
   pilule de menu qui s'ouvre en panneau avec texte brouillé, texte qui roule au survol, diapositives plein écran qui basculent
   en 3D (échelle 0,7, rotation X 40°, Z aléatoire ±5°), matrice de points qui dessine des pictogrammes, tête cachée au pied.
   Mélangées à celles de shopify.design : villes en très grand avec une photo dans le mot, profondeur. Au centre de l'anneau,
   le logo principal, le même qu'en haut à gauche (David, 28/10 : « Pas un D, j'aime pas le D comme tu as fait là »). */
(() => {
  'use strict';
  const BIENS = window.BIENS || [];
  const TAUX = window.TAUX || 3.4003;
  const WA = window.WHATSAPP || '972524066007';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;
  const G = window.gsap, ST = window.ScrollTrigger;
  const REDUIT = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const etroit = () => matchMedia('(max-width: 900px)').matches;
  const TACTILE = matchMedia('(hover: none)').matches;
  const nf = new Intl.NumberFormat('fr-FR');
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const waLien = (t) => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
  const trouver = (id) => BIENS.find((b) => b.id === id);
  if (G && ST) G.registerPlugin(ST);
  const ANIME = !!(G && ST) && !REDUIT;

  /* ——— formats ——— */
  const estLoc = (b) => b.rubrique === 'location';
  const TYPE_NOM = { Local: 'Local commercial' };
  const RUBRIQUES = { vente: 'À vendre', location: 'À louer', prestige: 'Prestige' };
  const prixLong = (b) => (b.prix ? nf.format(b.prix) + ' ₪' + (estLoc(b) ? ' / mois' : '') : 'Prix sur demande');
  function prixCourt(b) {
    if (!b.prix) return 'Sur demande';
    if (estLoc(b)) return nf.format(b.prix) + ' ₪/mois';
    const m = b.prix / 1e6;
    return m.toLocaleString('fr-FR', { maximumFractionDigits: m < 10 ? 2 : 1 }) + ' M ₪';
  }
  function euros(b) {
    if (!b.prix) return '';
    const e = estLoc(b) ? Math.round(b.prix / TAUX / 10) * 10 : Math.round(b.prix / TAUX / 1000) * 1000;
    return '≈ ' + nf.format(e) + ' €' + (estLoc(b) ? ' / mois' : '');
  }
  const millions = (n) => (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
  function courtEuros(n) {
    const e = n / TAUX;
    if (e >= 1e6) return millions(e) + '€';
    if (e >= 1e5) return Math.round(e / 10000) * 10 + ' k€';
    return nf.format(Math.round(e / 10) * 10) + ' €';
  }
  function nomBien(b) {
    if (b.rubrique === 'prestige') return b.titre;
    const t = TYPE_NOM[b.type] || b.type || 'Bien';
    return b.pieces && b.type !== 'Local' ? t + ' ' + b.pieces + ' pièces' : t;
  }
  const lieuCourt = (b) => [b.quartier, b.ville].filter(Boolean).join(' · ');
  const lieuLong = (b) => [b.rue, b.quartier, b.ville].filter(Boolean).join(', ');
  const etageTexte = (e) => (e == null ? '' : e === 0 ? 'rez-de-chaussée' : e === 1 ? '1er étage' : e + 'e étage');
  function phrase(b) {
    const t = TYPE_NOM[b.type] || b.type || 'Bien';
    let s = t + (b.pieces && b.type !== 'Local' ? ' de ' + b.pieces + ' pièces' : '') + (b.surface ? ', ' + b.surface + ' m²' : '');
    const et = etageTexte(b.etage);
    if (et) s += et === 'rez-de-chaussée' ? ', en rez-de-chaussée' : ', au ' + et;
    if (b.ascenseur === 'Oui') s += ' avec ascenseur';
    if (b.quartier) s += ', quartier ' + b.quartier;
    if (b.ville) s += ' à ' + b.ville;
    return s + '.';
  }

  /* ——— choix de photos (planche des couvertures du 28/10) ——— */
  const ORBITE = ['v-a11b5f7e', 'v-54ce00b5', 'v-7cc8d6bb', 'v-43564894', 'v-b6dbabd1', 'v-2e2bbffd', 'v-4d7e907c', 'v-7601b505', 'v-2f467af2', 'v-99f4bfb1'];
  // couvertures qui sont des montages, des affiches, un plan ou une image d'attente : la tuile montre le logo à la place
  const FAIBLES = new Set(['v-56a23ddd', 'v-c29c072c', 'v-db5388d0', 'v-c0e4d9c5', 'v-66e374a7', 'v-2044718c', 'v-d5f21e14', 'v-4ec470e2',
    'l-4a451d4b', 'l-1b5a0ec2', 'l-084ed450', 'l-475f19c0', 'l-1bf82c11', 'l-2ff2a9da']);
  const PHOTOS_VILLES = { Netanya: 'img/netanya-falaises.jpg', 'Herzliya Pituah': 'img/herzliya-pituah.jpg', 'Tel-Aviv': 'img/maison-tel-aviv.jpg',
    Mikhmoret: 'img/villa-mikhmoret.jpg', 'Jérusalem': 'img/penthouse-exceptionnel.jpg' };
  const img = (id) => (trouver(id) || {}).img;

  /* ——— texte qui roule au survol (hover-stagger de fourmula.ai : 0,02 s par lettre) ——— */
  function preparerRoule(el) {
    if (el.dataset.pret) return;
    el.dataset.pret = '1';
    const t = el.textContent;
    const lettres = (cls) => '<span class="' + cls + '" aria-hidden="true">' + [...t].map((c, i) => '<i style="transition-delay:' + (i * 0.018).toFixed(3) + 's">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</i>').join('') + '</span>';
    el.innerHTML = '<span class="sr">' + esc(t) + '</span>' + lettres('roule-a') + lettres('roule-b');
    if (TACTILE || REDUIT) return;
    const cible = el.closest('a, button') || el;
    cible.addEventListener('mouseenter', () => el.classList.add('roule-sur'));
    cible.addEventListener('mouseleave', () => el.classList.remove('roule-sur'));
  }
  const roule = (racine = document) => $$('[data-roule]', racine).forEach(preparerRoule);

  /* ——— liens WhatsApp ——— */
  function lierWhatsApp(racine = document) {
    $$('[data-wa]', racine).forEach((a) => { a.href = waLien(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* ——— mots qui s'allument (flash-text de fourmula.ai, ici en turquoise) ——— */
  function decouperMots(el) {
    const mots = [];
    const marcher = (n, finale) => {
      for (const enfant of Array.from(n.childNodes)) {
        if (enfant.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const m of enfant.textContent.split(/([ \t\n\r]+)/)) {
            if (!m) continue;
            if (/^[ \t\n\r]+$/.test(m)) { frag.appendChild(document.createTextNode(' ')); continue; }
            const s = document.createElement('span');
            s.className = 'mot-flash';
            s.textContent = m;
            frag.appendChild(s);
            mots.push([s, finale]);
          }
          n.replaceChild(frag, enfant);
        } else if (enfant.nodeType === 1 && enfant.tagName !== 'BR') {
          marcher(enfant, enfant.classList.contains('demi') ? 'rgba(36,32,30,.5)' : enfant.classList.contains('turq') ? '#2B8A99' : finale);
        }
      }
    };
    marcher(el, getComputedStyle(el).color);
    return mots;
  }
  function flash(el, decalage = 0.1, entree = 0.2) {
    const mots = decouperMots(el);
    if (!ANIME) return null;
    G.set(mots.map((m) => m[0]), { opacity: 0, color: '#2B8A99' });
    return () => {
      const tl = G.timeline();
      mots.forEach(([s, finale], i) => {
        tl.to(s, { keyframes: [
          { opacity: 1, color: '#2B8A99', duration: entree, ease: 'power2.out' },
          { color: '#7FCFD9', duration: 0.05 },
          { color: finale, duration: 0.1 },
        ] }, i * decalage);
      });
      return tl;
    };
  }

  /* ——— 1. héros : l'anneau de leurs biens tourne autour du logo ——— */
  const anneau = $('#anneau'), orbite = $('#orbite');
  anneau.innerHTML = '';
  const TAILLES = [0.2, 0.25, 0.21, 0.26, 0.19, 0.24, 0.2, 0.25, 0.19, 0.23];
  const PENTES = [-6, 4, -3, 7, -5, 3, -7, 5, -4, 6];
  const tuilesOrbite = ORBITE.map(trouver).filter(Boolean).map((b, i, arr) => {
    const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.08 : -0.05);
    const r = 0.4 + (i % 3 === 0 ? 0.035 : i % 3 === 1 ? -0.02 : 0.01);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'tuile-orbite';
    el.dataset.id = b.id;
    el.setAttribute('aria-label', nomBien(b) + ', ' + prixLong(b));
    const taille = TAILLES[i % TAILLES.length] * 100;
    el.style.left = (50 + Math.cos(a) * r * 100 - taille / 2).toFixed(2) + '%';
    el.style.top = (50 + Math.sin(a) * r * 100 - taille / 2).toFixed(2) + '%';
    el.style.width = el.style.height = taille + '%';
    el.innerHTML = '<span class="tuile-in"><img src="' + b.img + '" alt="" decoding="async"></span>';
    anneau.appendChild(el);
    return el;
  });
  anneau.addEventListener('click', (e) => { const t = e.target.closest('.tuile-orbite'); if (t) ouvrirFiche(trouver(t.dataset.id), t); });
  $('#centre').addEventListener('click', () => allerA('#biens'));
  $('#centre-n').textContent = BIENS.length + ' annonces';
  if (ANIME) {
    G.set(tuilesOrbite, { rotation: (i) => PENTES[i % PENTES.length] });
    G.to(anneau, { rotation: 360, duration: 32, ease: 'none', repeat: -1 });
    G.to(tuilesOrbite, { rotation: '-=360', duration: 32, ease: 'none', repeat: -1 });
    if (!TACTILE) {
      const qx = G.quickTo(orbite, 'x', { duration: 1.2, ease: 'power3.out' }), qy = G.quickTo(orbite, 'y', { duration: 1.2, ease: 'power3.out' });
      addEventListener('mousemove', (e) => { if (html.classList.contains('charge')) return; qx((e.clientX / innerWidth - 0.5) * 26); qy((e.clientY / innerHeight - 0.5) * 18); });
    }
    G.to('#anneau', { scale: 1.45, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.heros', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.heros-titre', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.heros', start: '30% top', end: 'bottom top', scrub: true } });
  } else {
    tuilesOrbite.forEach((t, i) => (t.style.transform = 'rotate(' + PENTES[i % PENTES.length] + 'deg)'));
  }
  const flashHeros = flash($('.heros-titre'), 0.2, 0.25);
  const flashs = $$('[data-flash]').filter((el) => !el.classList.contains('heros-titre')).map((el) => [el, flash(el)]);

  /* ——— 2. ce que nous faisons ——— */
  const ventes = BIENS.filter((b) => b.rubrique === 'vente' && b.prix).sort((a, b) => a.prix - b.prix);
  const locations = BIENS.filter((b) => b.rubrique === 'location' && b.prix).sort((a, b) => a.prix - b.prix);
  const prestiges = BIENS.filter((b) => b.rubrique === 'prestige');
  const bandeImgs = ['v-a11b5f7e', 'v-43564894', 'v-7601b505', 'v-4d7e907c', 'v-b10a71df', 'v-2e2bbffd', 'v-d919cb62', 'v-f34de827'].map(img).filter(Boolean);
  const loueImgs = ['l-ee51cab7', 'l-8df8b84f', 'l-e0ef8242'].map(img).filter(Boolean);
  const prestigeImgs = ['p-7d4ddae1', 'p-55d25977', 'p-abcd4506', 'p-35c27039', 'p-6fe15563'].map(img).filter(Boolean);
  const mi = (n) => (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  const texteCarte = (etiquette, titre, ligne) => '<span class="carte-texte"><span class="petit">' + etiquette + '</span><span class="h3 titre-carte">' + titre + '</span><span class="ligne">' + ligne + '</span></span><span class="carte-voir" aria-hidden="true">→</span>';
  $('#trio').innerHTML =
    '<button type="button" class="carte-trio large" data-r="vente"><span class="carte-visuel"><span class="bande">' + bandeImgs.concat(bandeImgs).map((s) => '<img src="' + s + '" alt="" loading="lazy">').join('') + '</span></span>' +
    texteCarte('■ Acheter · ' + ventes.length + ' biens', 'Acheter, <br>même depuis la France.', 'De ' + mi(ventes[0].prix) + ' à ' + mi(ventes[ventes.length - 1].prix) + ' M ₪.') + '</button>' +
    '<button type="button" class="carte-trio" data-r="location"><span class="carte-visuel"><span class="eventail">' + loueImgs.map((s) => '<img src="' + s + '" alt="" loading="lazy">').join('') + '</span></span>' +
    texteCarte('■ Louer · ' + locations.length + ' biens', 'Louer <br>à l’année.', 'De ' + nf.format(locations[0].prix) + ' à ' + nf.format(locations[locations.length - 1].prix) + ' ₪ par mois.') + '</button>' +
    '<button type="button" class="carte-trio" data-r="prestige"><span class="carte-visuel"><span class="fondu">' + prestigeImgs.map((s) => '<img src="' + s + '" alt="" loading="lazy">').join('') + '</span></span>' +
    texteCarte('■ Prestige · ' + prestiges.length + ' biens', 'Villas <br>et penthouses.', 'Des adresses rares, de Mikhmoret à Jérusalem.') + '</button>';
  $('#trio').addEventListener('click', (e) => { const c = e.target.closest('.carte-trio'); if (c) { choisirRubrique(c.dataset.r, true); allerA('#biens'); } });
  // fondu : chaque image arrive nette depuis le flou, puis repart (image anima de fourmula.ai : 0,9 s, pause 1,5 s)
  const fondu = $$('.fondu img');
  if (ANIME && fondu.length) {
    G.set(fondu, { opacity: 0, scale: 0.96, filter: 'blur(6px)' });
    const tl = G.timeline({ repeat: -1, defaults: { ease: 'power2.out' } });
    fondu.forEach((im) => tl.to(im, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9 }));
    tl.to({}, { duration: 1.5 });
    [...fondu].reverse().forEach((im) => tl.to(im, { opacity: 0, scale: 0.98, filter: 'blur(6px)', duration: 0.5 }));
  } else fondu.forEach((im, i) => (im.style.opacity = i === 0 ? 1 : 0));

  /* ——— 3. une agence qui… (les mots défilent avec la page) ——— */
  const liste = $('#tourne-liste');
  const piste = document.createElement('div');
  piste.className = 'tourne-piste';
  $$('li', liste).forEach((li) => piste.appendChild(li));
  liste.appendChild(piste);
  const items = $$('li', piste);
  let indexTourne = -1;
  function majTourne(i) {
    if (i === indexTourne) return;
    indexTourne = i;
    items.forEach((li, k) => li.classList.toggle('actif', k === i));
    const h = items[0].offsetHeight;
    if (ANIME) {
      G.to(piste, { y: -i * h, duration: 0.7, ease: 'power3.out' });
      G.to(items, { opacity: (k) => (k < i ? 0 : 1), duration: 0.4 });
    } else piste.style.transform = 'translateY(' + -i * h + 'px)';
  }
  majTourne(0);
  if (ANIME) {
    ST.create({ trigger: '.tourne', start: 'top top', end: () => '+=' + innerHeight * 2.2, pin: '.tourne-scene', scrub: true,
      onUpdate: (s) => majTourne(Math.min(items.length - 1, Math.floor(s.progress * items.length * 0.999))) });
  }

  /* ——— 4. catalogue ——— */
  const PAGE = etroit() ? 8 : 15;
  const BUDGETS = {
    vente: [[0, 2e6], [2e6, 3.5e6], [3.5e6, 6e6], [6e6, Infinity]],
    location: [[0, 5000], [5000, 7000], [7000, Infinity]],
    prestige: [[0, 13e6], [13e6, 20e6], [20e6, Infinity]],
  };
  function libelleBudget(r, a, z) {
    if (r === 'location') {
      if (!a) return 'Moins de ' + nf.format(z) + ' ₪';
      if (z === Infinity) return nf.format(a) + ' ₪ et plus';
      return nf.format(a) + ' à ' + nf.format(z) + ' ₪';
    }
    if (!a) return 'Jusqu’à ' + millions(z) + ' ₪ (≈ ' + courtEuros(z) + ')';
    if (z === Infinity) return millions(a) + ' ₪ et plus (≈ ' + courtEuros(a) + ')';
    return millions(a).replace(' M', '') + ' à ' + millions(z) + ' ₪';
  }
  const etat = { r: 'vente', ville: '', budget: '', n: PAGE };
  function filtrer() {
    let l = BIENS.filter((b) => b.rubrique === etat.r);
    if (etat.ville) l = l.filter((b) => b.ville === etat.ville);
    if (etat.budget !== '') { const [a, z] = BUDGETS[etat.r][+etat.budget]; l = l.filter((b) => b.prix >= a && b.prix < z); }
    return l.filter((b) => !FAIBLES.has(b.id)).concat(l.filter((b) => FAIBLES.has(b.id)));
  }
  const tuiles = $('#tuiles'), plus = $('#plus'), vide = $('#vide'), puces = $('#puces-villes'), budget = $('#budget');
  const cache = new Map();
  function tuile(b) {
    let el = cache.get(b.id);
    if (el) return el;
    el = document.createElement('button');
    el.type = 'button';
    el.dataset.id = b.id;
    el.setAttribute('aria-label', nomBien(b) + ', ' + (lieuCourt(b) || 'Israël') + ', ' + prixLong(b) + '. Ouvrir la fiche');
    const details = [b.surface && b.surface + ' m²', b.quartier || b.ville].filter(Boolean).join(' · ');
    const prix = '<span class="tuile-prix">' + esc(prixCourt(b)) + '<small>' + esc(details) + '</small></span>';
    if (FAIBLES.has(b.id) || !b.img) {
      el.className = 'tuile typo';
      el.innerHTML = '<img class="typo-logo" src="logos/diamond-logo-empile-lin.svg" alt="" width="72" height="38"><span><span class="typo-type">' + esc(nomBien(b)) + '</span><span class="typo-lieu">' + esc(lieuCourt(b)) + '</span></span>' + prix;
    } else {
      el.className = 'tuile';
      el.innerHTML = '<img src="' + b.img + '" alt="" loading="lazy" decoding="async">' + (b.pieces && b.rubrique !== 'prestige' ? '<span class="tuile-p">' + b.pieces + ' p.</span>' : '') + prix;
    }
    cache.set(b.id, el);
    return el;
  }
  let premier = true;
  function rendreTuiles(l) {
    const visibles = l.slice(0, etat.n);
    const avant = new Map();
    const r0 = tuiles.getBoundingClientRect();
    const vu = r0.top < innerHeight && r0.bottom > 0;
    if (!premier && vu && ANIME) for (const el of tuiles.children) avant.set(el, el.getBoundingClientRect());
    const frag = document.createDocumentFragment();
    visibles.forEach((b) => frag.appendChild(tuile(b)));
    tuiles.replaceChildren(frag);
    if (premier || !vu || !ANIME) { premier = false; return; }
    let k = 0;
    for (const el of tuiles.children) {
      const a = avant.get(el), n = el.getBoundingClientRect();
      if (n.top > innerHeight + 100 || n.bottom < -100) continue;
      if (a) { const dx = a.left - n.left, dy = a.top - n.top; if (dx || dy) G.fromTo(el, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }); }
      else G.fromTo(el, { opacity: 0, scale: 0.92, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, delay: Math.min(k++ * 0.04, 0.4), ease: 'power2.out', clearProps: 'all' });
    }
  }
  function remplirFiltres() {
    const compte = new Map();
    for (const b of BIENS) if (b.rubrique === etat.r && b.ville) compte.set(b.ville, (compte.get(b.ville) || 0) + 1);
    const villes = [...compte].sort((a, b) => b[1] - a[1]);
    puces.innerHTML = '<button type="button" class="puce" data-ville="">Toutes</button>' +
      villes.map(([v, n]) => '<button type="button" class="puce" data-ville="' + esc(v) + '">' + esc(v) + '<sup>' + n + '</sup></button>').join('');
    budget.innerHTML = '<option value="">Budget</option>' + BUDGETS[etat.r].map(([a, z], i) => '<option value="' + i + '">' + esc(libelleBudget(etat.r, a, z)) + '</option>').join('');
  }
  let filtresPour = '';
  function maj() {
    if (filtresPour !== etat.r) { remplirFiltres(); filtresPour = etat.r; }
    const l = filtrer();
    $$('.puce', puces).forEach((p) => p.classList.toggle('actif', p.dataset.ville === etat.ville));
    budget.value = etat.budget;
    $$('.catalogue .seg').forEach((s) => { const o = s.dataset.r === etat.r; s.classList.toggle('actif', o); s.setAttribute('aria-checked', o); });
    placerCurseur($('.catalogue .segment'));
    compter($('#compte b'), l.length);
    $('#compte').lastChild.textContent = l.length > 1 ? ' biens' : ' bien';
    rendreTuiles(l);
    plus.hidden = l.length <= etat.n;
    vide.hidden = l.length > 0;
  }
  function compter(el, vers) {
    const de = el.dataset.v == null ? vers : +el.dataset.v;
    el.dataset.v = vers;
    if (!ANIME || de === vers) { el.textContent = vers; return; }
    const o = { n: de };
    G.to(o, { n: vers, duration: 0.5, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.n)) });
  }
  function placerCurseur(seg) {
    const a = $('.seg.actif', seg), c = $('.seg-curseur', seg);
    if (!a || !c || !a.offsetWidth) return;
    c.style.width = a.offsetWidth + 'px';
    c.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function choisirRubrique(r, garderVille) {
    if (!BUDGETS[r]) return;
    etat.r = r;
    etat.budget = '';
    if (!garderVille || (etat.ville && !BIENS.some((b) => b.rubrique === r && b.ville === etat.ville))) etat.ville = '';
    etat.n = PAGE;
    maj();
  }
  $('.catalogue .segment').addEventListener('click', (e) => { const s = e.target.closest('.seg'); if (s && s.dataset.r !== etat.r) choisirRubrique(s.dataset.r, true); });
  puces.addEventListener('click', (e) => { const p = e.target.closest('.puce'); if (!p) return; etat.ville = p.dataset.ville; etat.n = PAGE; maj(); });
  budget.addEventListener('change', () => { etat.budget = budget.value; etat.n = PAGE; maj(); });
  plus.addEventListener('click', () => { etat.n += PAGE; maj(); });
  tuiles.addEventListener('click', (e) => { const t = e.target.closest('.tuile'); if (t) ouvrirFiche(trouver(t.dataset.id), t); });
  // retour au toucher : ce qu'on touche s'enfonce
  document.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.tuile, .carte-trio, .visite-carte');
    if (!t) return;
    const x0 = e.clientX, y0 = e.clientY;
    const minuteur = setTimeout(() => t.classList.add('appuye'), e.pointerType === 'touch' ? 70 : 0);
    const fin = () => { clearTimeout(minuteur); t.classList.remove('appuye'); removeEventListener('pointerup', fin); removeEventListener('pointercancel', fin); removeEventListener('pointermove', bouge); };
    const bouge = (m) => { if (Math.hypot(m.clientX - x0, m.clientY - y0) > 9) fin(); };
    addEventListener('pointerup', fin); addEventListener('pointercancel', fin); addEventListener('pointermove', bouge, { passive: true });
  });

  /* ——— fiche d'un bien : la photo touchée s'envole jusqu'à la galerie, et y retourne ——— */
  const fiche = $('#fiche'), galerie = $('#galerie');
  let ficheBien = null, ficheSource = null, enFermeture = false, pousse = false, focusAvant = null;
  const estVisible = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  function remplirFiche(b) {
    const photos = b.galerie && b.galerie.length ? b.galerie : [{ src: b.img }];
    galerie.innerHTML = photos.map((p, i) => '<img src="' + p.src + '" alt="' + esc(nomBien(b)) + ', photo ' + (i + 1) + '"' + (i ? ' loading="lazy"' : '') + ' decoding="async">').join('');
    galerie.scrollLeft = 0;
    const plusieurs = photos.length > 1;
    $('#g-prec').hidden = $('#g-suiv').hidden = !plusieurs;
    $('#g-points').innerHTML = plusieurs ? photos.map((_, i) => '<i' + (i ? '' : ' class="actif"') + '></i>').join('') : '';
    $('#fiche-genre').textContent = RUBRIQUES[b.rubrique] + (b.rubrique === 'prestige' && b.type ? ' · ' + b.type : '') + (b.etat ? ' · ' + b.etat : '');
    $('#fiche-titre').textContent = nomBien(b);
    $('#fiche-lieu').textContent = lieuLong(b) || 'Israël';
    $('#fiche-prix').textContent = prixLong(b);
    $('#fiche-euros').textContent = euros(b);
    $('#fiche-faits').innerHTML = [b.surface && b.surface + ' m²', b.pieces && b.pieces + ' pièces', b.chambres && b.chambres + ' ch.', b.sdb && b.sdb + ' sdb',
      b.etage != null && (b.etage === 0 ? 'RDC' : 'Étage ' + b.etage), b.ascenseur === 'Oui' && 'Ascenseur'].filter(Boolean).map((f) => '<span>' + esc(f) + '</span>').join('');
    const paras = [];
    for (const l of b.texte ? b.texte.split('\n').map((x) => x.trim()).filter(Boolean) : [phrase(b)]) {
      if (paras.length && /^[a-zà-ÿ(]/.test(l)) paras[paras.length - 1] += ' ' + l; else paras.push(l);
    }
    $('#fiche-desc').innerHTML = paras.map((p) => '<p>' + esc(p) + '</p>').join('');
    $('#fiche-desc-bloc').open = false;
    $('#fiche-wa').href = waLien('Bonjour Diamond Realty, je souhaite organiser une visite : ' + nomBien(b) + (lieuLong(b) ? ', ' + lieuLong(b) : '') + ', ' + prixLong(b) + ' (réf. ' + b.id.toUpperCase() + ').' + (b.source ? '\n' + b.source : ''));
    $('#fiche-note').textContent = 'Réf. ' + b.id.toUpperCase() + ' · euros indicatifs, 1 € = 3,40 ₪ (BCE, 27/10/2026)';
  }
  function vol(de, vers, src, rDe, rVers, fin) {
    const c = document.createElement('img');
    c.className = 'clone-volant';
    c.src = src;
    c.alt = '';
    const cadre = (r, rayon) => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: rayon });
    Object.assign(c.style, cadre(de, rDe));
    document.body.appendChild(c);
    const a = c.animate([cadre(de, rDe), cadre(vers, rVers)], { duration: 640, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'forwards' });
    a.onfinish = () => { if (fin) fin(); c.remove(); };
    return 640;
  }
  function ouvrirFiche(b, source, pousser = true) {
    if (!b) return;
    ficheBien = b;
    ficheSource = source || null;
    remplirFiche(b);
    const im = source && source.querySelector('img:not(.typo-d)');
    const partage = !!(im && im.complete && im.naturalWidth && !REDUIT && !etroit() && estVisible(im));
    fiche.classList.toggle('depuis-tuile', partage);
    fiche.classList.toggle('en-vol', partage);
    focusAvant = document.activeElement;
    fiche.hidden = false;
    html.classList.add('fige');
    void fiche.offsetWidth;
    requestAnimationFrame(() => fiche.classList.add('ouverte'));
    if (partage) {
      source.classList.add('decolle');
      vol(im.getBoundingClientRect(), galerie.getBoundingClientRect(), im.currentSrc || im.src, getComputedStyle(source).borderRadius, '36px 0 0 36px', () => fiche.classList.remove('en-vol'));
    }
    setTimeout(() => $('.fiche-fermer', fiche).focus({ preventScroll: true }), 60);
    if (pousser) { try { history.pushState({ bien: b.id }, '', '#bien-' + b.id); pousse = true; } catch (e) { /* fichier local */ } }
  }
  function fermerFiche(depuisHistorique) {
    if (fiche.hidden || enFermeture) return;
    enFermeture = true;
    const src = ficheSource, im = src && src.querySelector('img:not(.typo-d)');
    const retour = fiche.classList.contains('depuis-tuile') && im && estVisible(src) && !etroit();
    let attente = etroit() ? 560 : 420;
    if (retour) {
      const i = Math.round(galerie.scrollLeft / Math.max(1, galerie.clientWidth));
      const actuelle = galerie.children[i] || galerie.firstElementChild;
      fiche.classList.add('en-vol');
      attente = Math.max(attente, vol(galerie.getBoundingClientRect(), im.getBoundingClientRect(), actuelle.currentSrc || actuelle.src, '36px 0 0 36px', getComputedStyle(src).borderRadius, () => src.classList.remove('decolle')) - 60);
    } else if (src) setTimeout(() => src.classList.remove('decolle'), attente);
    fiche.classList.remove('ouverte');
    setTimeout(() => {
      fiche.hidden = true;
      fiche.classList.remove('depuis-tuile', 'en-vol');
      $('.fiche-carte', fiche).getAnimations().forEach((a) => a.cancel());
      html.classList.remove('fige');
      if (focusAvant && focusAvant.focus) focusAvant.focus({ preventScroll: true });
      enFermeture = false;
    }, attente);
    if (depuisHistorique) pousse = false;
    else if (pousse) { pousse = false; history.back(); }
    else if (location.hash.indexOf('#bien-') === 0) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* rien */ } }
  }
  addEventListener('popstate', (e) => {
    const id = (e.state && e.state.bien) || (location.hash.indexOf('#bien-') === 0 ? location.hash.slice(6) : null);
    if (id) { if (fiche.hidden || !ficheBien || ficheBien.id !== id) ouvrirFiche(trouver(id), null, false); }
    else if (!fiche.hidden) fermerFiche(true);
  });
  fiche.addEventListener('click', (e) => { if (e.target.closest('[data-fermer]')) fermerFiche(); });
  const photoActuelle = () => Math.round(galerie.scrollLeft / Math.max(1, galerie.clientWidth));
  const allerPhoto = (i) => galerie.scrollTo({ left: clamp(i, 0, galerie.children.length - 1) * galerie.clientWidth, behavior: REDUIT ? 'auto' : 'smooth' });
  $('#g-prec').addEventListener('click', () => allerPhoto(photoActuelle() - 1));
  $('#g-suiv').addEventListener('click', () => allerPhoto(photoActuelle() + 1));
  galerie.addEventListener('scroll', () => {
    const i = photoActuelle();
    $$('#g-points i').forEach((p, k) => p.classList.toggle('actif', k === i));
    $('#g-prec').disabled = i === 0;
    $('#g-suiv').disabled = i === galerie.children.length - 1;
  }, { passive: true });
  $('#fiche-partager').addEventListener('click', async () => {
    if (!ficheBien) return;
    const url = location.href.split('#')[0] + '#bien-' + ficheBien.id;
    if (navigator.share) { try { await navigator.share({ title: nomBien(ficheBien) + ' · Diamond Realty', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(url); } catch (e) { /* rien */ }
    annoncer('Lien copié');
  });
  let minuteurAnnonce = 0;
  function annoncer(t) { const a = $('#annonce'); a.textContent = t; a.hidden = false; clearTimeout(minuteurAnnonce); minuteurAnnonce = setTimeout(() => (a.hidden = true), 1800); }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!fiche.hidden) fermerFiche(); else fermerMenu(); return; }
    if (fiche.hidden) return;
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && document.activeElement.tagName !== 'SUMMARY') { allerPhoto(photoActuelle() + (e.key === 'ArrowRight' ? 1 : -1)); e.preventDefault(); }
    if (e.key === 'Tab') {
      const f = $$('a[href], button:not([disabled]):not([hidden]), summary, [tabindex="0"]', fiche).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    }
  });
  // téléphone : la fiche se tire vers le bas pour se fermer (élastique, élan projeté)
  (function glisser() {
    const carte = $('.fiche-carte', fiche);
    [$('.fiche-poignee', fiche), $('.fiche-galerie', fiche)].forEach((zone) => {
      let actif = false, decide = false, pid = null, x0 = 0, y0 = 0, dy = 0, hist = [];
      zone.addEventListener('pointerdown', (e) => {
        if (!etroit() || (e.pointerType === 'mouse' && e.button !== 0)) return;
        actif = true; decide = false; pid = e.pointerId; x0 = e.clientX; y0 = e.clientY; dy = 0; hist = [{ y: e.clientY, t: e.timeStamp }];
      });
      zone.addEventListener('pointermove', (e) => {
        if (!actif || e.pointerId !== pid) return;
        const ddx = e.clientX - x0, ddy = e.clientY - y0;
        if (!decide) {
          if (Math.abs(ddx) < 10 && Math.abs(ddy) < 10) return;
          if (Math.abs(ddx) > Math.abs(ddy) || ddy < 0) { actif = false; return; }
          decide = true;
          try { zone.setPointerCapture(pid); } catch (er) { /* rien */ }
          fiche.classList.add('tire');
        }
        dy = ddy >= 0 ? ddy : -(-ddy * innerHeight * 0.55) / (innerHeight + 0.55 * -ddy);
        carte.style.transform = 'translate3d(0,' + dy + 'px,0)';
        hist.push({ y: e.clientY, t: e.timeStamp });
        if (hist.length > 6) hist.shift();
      });
      const fin = (e) => {
        if (!actif || e.pointerId !== pid) return;
        actif = false;
        if (!decide) return;
        const a = hist[0], z = hist[hist.length - 1];
        const v = z.t > a.t ? ((z.y - a.y) / (z.t - a.t)) * 1000 : 0;
        const h = carte.offsetHeight;
        carte.style.transform = '';
        if (dy + ((v / 1000) * 0.998) / 0.002 > h * 0.5 || v > 1400) {
          const an = carte.animate([{ transform: 'translate3d(0,' + dy + 'px,0)' }, { transform: 'translate3d(0,' + h + 'px,0)' }], { duration: 300, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
          an.onfinish = () => fiche.classList.remove('tire');
          fermerFiche();
        } else {
          const an = carte.animate([{ transform: 'translate3d(0,' + dy + 'px,0)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,1.2,.3,1)' });
          an.onfinish = () => fiche.classList.remove('tire');
        }
      };
      zone.addEventListener('pointerup', fin);
      zone.addEventListener('pointercancel', fin);
    });
  })();

  /* ——— 5. étapes ——— */
  // 01 : la demande s'écrit pendant qu'on choisit
  const choix = { projet: 'Acheter', ville: 'Netanya', taille: '' };
  const GROUPES = [['projet', 'Votre projet', ['Acheter', 'Louer', 'Investir', 'Préparer mon alyah']], ['ville', 'Où', ['Netanya', 'Herzliya', 'Jérusalem', 'Tel-Aviv', 'Ailleurs']], ['taille', 'Pièces', ['2', '3', '4', '5 et plus']]];
  function rendreChoix() {
    $('#choix').innerHTML = GROUPES.map(([k, t, o]) => '<div class="choix-groupe" data-cle="' + k + '"><p>' + t + '</p><div>' + o.map((v) => '<button type="button" class="puce' + (choix[k] === v ? ' actif' : '') + '" aria-pressed="' + (choix[k] === v) + '">' + esc(v) + '</button>').join('') + '</div></div>').join('');
  }
  function majBulle(pulse) {
    const verbe = { Acheter: 'je souhaite acheter', Louer: 'je souhaite louer', Investir: 'je souhaite investir dans', 'Préparer mon alyah': 'je prépare mon alyah et je cherche' }[choix.projet];
    let t = 'Bonjour Diamond Realty, ' + verbe + ' ' + (choix.taille ? 'un ' + (choix.taille === '5 et plus' ? '5 pièces ou plus' : choix.taille + ' pièces') : 'un bien');
    if (choix.ville === 'Ailleurs') t += ' (la ville reste à choisir)'; else if (choix.ville) t += ' à ' + choix.ville;
    t += '. Pouvez-vous m’envoyer les biens qui correspondent ?';
    const b = $('#bulle');
    b.textContent = t;
    $('#envoyer').href = waLien(t);
    if (pulse && !REDUIT) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
  }
  $('#choix').addEventListener('click', (e) => {
    const p = e.target.closest('.puce');
    if (!p) return;
    const k = p.closest('.choix-groupe').dataset.cle, v = p.textContent;
    choix[k] = choix[k] === v && k === 'taille' ? '' : v;
    rendreChoix();
    majBulle(true);
  });
  rendreChoix();
  majBulle(false);
  // 02 : visites
  $('#ui-visite').innerHTML = ['v-43564894', 'p-abcd4506', 'v-b6dbabd1'].map(trouver).filter(Boolean).map((b, i) =>
    '<button type="button" class="visite-carte" data-id="' + b.id + '"><img src="' + b.img + '" alt="" loading="lazy"><span>' + ['Visite · Centre', 'Visite · face à la mer', 'Visite · jardin'][i] + '</span></button>').join('') +
    '<span class="visite-myriam"><img src="img/myriam.jpg" alt="">Myriam vous accompagne</span>';
  $('#ui-visite').addEventListener('click', (e) => { const c = e.target.closest('.visite-carte'); if (c) ouvrirFiche(trouver(c.dataset.id), c); });
  // 03 : leurs six partenaires (page « Agence » de leur site)
  $('#ui-partenaires').innerHTML = ['Conseils juridiques', 'Crédit immobilier', 'Courtier en assurance', 'Gestion locative', 'Home staging', 'Design d’intérieur']
    .map((p) => '<div class="partenaire"><i>✓</i><span>' + p + '</span></div>').join('');
  // 04 : matrice de points (18 × 18) qui dessine une maison, une clé, un diamant, un cœur
  const MOTIFS = [
    ['------------------', '------------------', '------------------', '--------11--------', '-------1111-------', '------111111------', '-----11111111-----', '----1111111111----', '---111111111111---',
      '-----11111111-----', '-----11111111-----', '-----111--111-----', '-----111--111-----', '-----111--111-----', '-----111--111-----', '------------------', '------------------', '------------------'],
    ['------------------', '------------------', '------------------', '------------------', '------------------', '---1111-----------', '--11--11----------', '-11----11111111111', '-11----11111111111',
      '--11--11-----11-11', '---1111------11-11', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------'],
    ['------------------', '------------------', '------------------', '------------------', '----1111111111----', '---111111111111---', '--11111111111111--', '--11111111111111--', '---111111111111---',
      '----1111111111----', '-----11111111-----', '------111111------', '-------1111-------', '--------11--------', '------------------', '------------------', '------------------', '------------------'],
    ['------------------', '------------------', '------------------', '------------------', '----111----111----', '---11111--11111---', '---111111111111---', '---111111111111---', '---111111111111---',
      '----1111111111----', '-----11111111-----', '------111111------', '-------1111-------', '--------11--------', '------------------', '------------------', '------------------', '------------------'],
  ];
  const grillePoints = $('#points');
  grillePoints.innerHTML = Array.from({ length: 324 }, (_, i) => '<i class="point" data-c="' + (i % 18) + '" data-l="' + Math.floor(i / 18) + '"></i>').join('');
  const points = $$('.point', grillePoints);
  const etats = MOTIFS.map((mo) => { const s = new Set(); mo.forEach((l, r) => [...l].forEach((c, k) => { if (c === '1') s.add(k + ':' + r); })); return s; });
  function nuage() {
    const mel = [...points].sort(() => Math.random() - 0.5), n = Math.ceil(mel.length / 20);
    mel.forEach((p, i) => {
      const coeur = Math.max(0, 1 - Math.hypot(p.dataset.c - 9, p.dataset.l - 9) / 12);
      G.to(p, { opacity: clamp(0.15 + coeur * 0.7 + (Math.random() - 0.5) * 0.35, 0.15, 1), duration: 1, delay: Math.floor(i / n) * 0.05 + Math.random() * 0.0125, ease: 'steps(2)' });
    });
  }
  function motif(k) {
    const s = etats[k], mel = [...points].sort(() => Math.random() - 0.5), n = Math.ceil(mel.length / 20);
    mel.forEach((p, i) => G.to(p, { opacity: s.has(p.dataset.c + ':' + p.dataset.l) ? 1 : 0.15, duration: 1, delay: Math.floor(i / n) * 0.05 + Math.random() * 0.0125, ease: 'steps(2)' }));
  }
  let cyclePoints = 0, indexMotif = 0;
  function cycle() { motif(indexMotif); cyclePoints = setTimeout(() => { indexMotif = (indexMotif + 1) % etats.length; nuage(); cyclePoints = setTimeout(cycle, 1000); }, 2000); }
  if (ANIME) {
    new IntersectionObserver((en) => en.forEach((e) => {
      if (e.isIntersecting && !cyclePoints) { nuage(); cyclePoints = setTimeout(cycle, 1000); }
      else if (!e.isIntersecting && cyclePoints) { clearTimeout(cyclePoints); cyclePoints = 0; }
    }), { threshold: 0.2 }).observe(grillePoints);
    if (!TACTILE) {
      grillePoints.addEventListener('mousemove', (e) => {
        points.forEach((p) => {
          const r = p.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
          G.to(p, { scale: clamp(1 - 0.75 * Math.max(0, (120 - d) / 120), 0.25, 1), duration: 0.2, ease: 'power2.out' });
        });
      });
      grillePoints.addEventListener('mouseleave', () => G.to(points, { scale: 1, duration: 0.4 }));
    }
  } else etats[0].forEach((k) => { const [c, l] = k.split(':'); const p = points[+l * 18 + +c]; if (p) p.style.opacity = 1; });
  // diapositives : la précédente bascule en arrière quand la suivante la recouvre
  const diapos = $$('.diapo');
  if (ANIME) {
    diapos.slice(0, -1).forEach((d, i) => {
      const contenu = $('.diapo-contenu', d), suivante = diapos[i + 1];
      G.to(contenu, { scale: 0.7, rotationX: 40, rotationZ: (Math.random() - 0.5) * 10, ease: 'power1.in', scrollTrigger: { trigger: suivante, start: 'top bottom', end: 'top top', scrub: true } });
      G.to(contenu, { autoAlpha: 0, ease: 'power1.in', scrollTrigger: { trigger: suivante, start: 'top 45%', end: 'top 5%', scrub: true } });
    });
    ST.create({ trigger: '.d3', start: 'top 55%', once: true, onEnter: () => $$('.partenaire').forEach((p, i) => setTimeout(() => p.classList.add('coche'), 250 + i * 220)) });
  } else $$('.partenaire').forEach((p) => p.classList.add('coche'));

  /* ——— 6. villes, en très grand ——— */
  const parVille = new Map();
  for (const b of BIENS) if (b.ville) parVille.set(b.ville, (parVille.get(b.ville) || 0) + 1);
  $('#villes-liste').innerHTML = [...parVille].sort((a, b) => b[1] - a[1]).map(([v, n]) =>
    '<button type="button" class="ville-ligne" data-ville="' + esc(v) + '">' + esc(v) + '<span class="ville-pilule"><img src="' + (PHOTOS_VILLES[v] || (BIENS.find((b) => b.ville === v) || {}).img) + '" alt="" loading="lazy"></span><sup>' + n + '</sup></button>').join('');
  $('#villes-liste').addEventListener('click', (e) => {
    const l = e.target.closest('.ville-ligne');
    if (!l) return;
    const v = l.dataset.ville;
    etat.r = ['vente', 'location', 'prestige'].map((r) => [r, BIENS.filter((b) => b.rubrique === r && b.ville === v).length]).sort((a, z) => z[1] - a[1])[0][0];
    etat.ville = v; etat.budget = ''; etat.n = PAGE;
    filtresPour = '';
    maj();
    allerA('#biens');
  });
  if (ANIME) $$('.ville-ligne').forEach((l, i) => {
    const d = [0.05, 0.11, 0.03, 0.09, 0.06, 0.12, 0.04, 0.1, 0.07, 0.08][i % 10] * 260;
    G.fromTo(l, { y: d }, { y: -d, ease: 'none', scrollTrigger: { trigger: '#villes', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ——— tête : pourcentage lu, menu qui s'ouvre depuis la pilule, cachée quand le pied arrive ——— */
  const tete = $('#tete'), menu = $('#menu'), menuBouton = $('#menu-bouton'), menuTxt = $('#menu-txt'), pourcent = $('#pourcent');
  function brouiller(nouveau) {
    const L = Math.max(menuTxt.textContent.length, nouveau.length);
    let f = 0;
    clearInterval(menuTxt._iv);
    menuTxt._iv = setInterval(() => {
      let s = '';
      for (let i = 0; i < L; i++) s += i < nouveau.length && f / 20 > i / L ? nouveau[i] : '•';
      menuTxt.textContent = s;
      if (++f > 20) { menuTxt.textContent = nouveau; clearInterval(menuTxt._iv); }
    }, 20);
  }
  let menuOuvert = false;
  const clipFerme = () => { const w = $('#tete-pilule').offsetWidth, W = menu.offsetWidth; return 'inset(0px ' + (W - w) / 2 + 'px calc(100% - 40px) ' + (W - w) / 2 + 'px round 20px)'; };
  function ouvrirMenu() {
    if (menuOuvert) return;
    menuOuvert = true;
    menu.hidden = false;
    menuBouton.classList.add('ouvert');
    menuBouton.setAttribute('aria-expanded', 'true');
    brouiller('Fermer');
    if (ANIME) {
      G.fromTo(menu, { clipPath: clipFerme() }, { clipPath: 'inset(0px 0px 0% 0px round 24px)', duration: 0.45, ease: 'power2.out' });
      G.fromTo($$('.menu-lien, .menu-pied', menu), { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.3, delay: 0.15 });
    }
  }
  function fermerMenu() {
    if (!menuOuvert) return;
    menuOuvert = false;
    menuBouton.classList.remove('ouvert');
    menuBouton.setAttribute('aria-expanded', 'false');
    brouiller('Menu');
    if (!ANIME) { menu.hidden = true; return; }
    G.to(menu, { clipPath: clipFerme(), duration: 0.35, ease: 'power2.in', onComplete: () => { if (!menuOuvert) menu.hidden = true; } });
  }
  menuBouton.addEventListener('click', () => (menuOuvert ? fermerMenu() : ouvrirMenu()));
  document.addEventListener('click', (e) => { if (menuOuvert && !e.target.closest('#menu, #menu-bouton')) fermerMenu(); });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { if (a.dataset.rubrique) choisirRubrique(a.dataset.rubrique, false); fermerMenu(); }));
  new IntersectionObserver((en) => en.forEach((e) => {
    const cachee = e.intersectionRatio >= 0.5;
    tete.classList.toggle('cachee', cachee);
    if (cachee) fermerMenu();
  }), { threshold: [0, 0.25, 0.5, 0.75, 1] }).observe($('#pied'));
  let rafDefil = 0;
  addEventListener('scroll', () => {
    if (rafDefil) return;
    rafDefil = requestAnimationFrame(() => {
      rafDefil = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      pourcent.textContent = Math.round(clamp(scrollY / Math.max(1, max), 0, 1) * 100) + '%';
    });
  }, { passive: true });

  function allerA(sel) {
    const el = $(sel);
    if (!el) return;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - (sel === '#biens' ? 0 : 20), behavior: REDUIT ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const h = a.getAttribute('href');
    if (h.length > 1 && h[0] === '#' && $(h)) { e.preventDefault(); allerA(h); }
  }));

  /* ——— démarrage ——— */
  roule();
  lierWhatsApp();
  maj();
  addEventListener('resize', () => placerCurseur($('.catalogue .segment')));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { placerCurseur($('.catalogue .segment')); if (ST) ST.refresh(); });
  if (ANIME) flashs.forEach(([el, jouer]) => { if (jouer) ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => jouer() }); });

  // ce qui doit être caché avant que le héros n'apparaisse (le préchargeur couvre l'écran pendant ce temps)
  function preparerHeros() {
    if (!ANIME) return;
    G.set(tuilesOrbite, { opacity: 0 });
    G.set(tuilesOrbite.map((t) => t.firstElementChild), { scale: 0.6 });
    G.set(['.lg-dia', '.lg-mond'], { yPercent: 115 });
    G.set('.lg-l', { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' });
    G.set('.lg-pt', { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
    G.set(['.centre-txt', '.centre-n'], { opacity: 0, y: 8 });
    G.set(['.tete-logo', '.tete-pilule', '.tete-wa'], { opacity: 0, y: 24, scale: 0.9 });
    G.set(['.heros-copy', '.heros-defiler'], { opacity: 0 });
  }
  // le logo se pose dans la carte (« Dia », puis « mond », puis REALTY lettre par lettre), l'anneau se forme autour,
  // puis le titre s'allume et la tête arrive
  function introHeros(sansPrechargeur) {
    if (!ANIME) return;
    const tl = G.timeline();
    if (sansPrechargeur) tl.from('.orbite-centre', { opacity: 0, scale: 0.8, duration: 0.7, ease: 'expo.out', clearProps: 'all' }, 0);
    const d = sansPrechargeur ? 0.25 : 0;
    tl.to('.lg-dia', { yPercent: 0, duration: 1, ease: 'expo.out' }, d)
      .to('.lg-mond', { yPercent: 0, duration: 1, ease: 'expo.out' }, d + 0.14)
      .to('.lg-l', { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out', stagger: 0.06 }, d + 0.55)
      .to('.lg-pt', { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out', stagger: 0.1 }, d + 0.95)
      .to(['.centre-txt', '.centre-n'], { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1, clearProps: 'all' }, d + 0.85)
      .to(tuilesOrbite, { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.1, clearProps: 'opacity' }, d + 0.45)
      .to(tuilesOrbite.map((t) => t.firstElementChild), { scale: 1, duration: 1.2, ease: 'expo.out', stagger: 0.1, clearProps: 'all' }, d + 0.45)
      .add(() => { if (flashHeros) flashHeros(); }, d + 1.25)
      .to(['.tete-logo', '.tete-pilule', '.tete-wa'], { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1, clearProps: 'all' }, d + 1.45)
      .to(['.heros-copy', '.heros-defiler'], { opacity: 1, duration: 0.9, ease: 'power2.out', clearProps: 'opacity' }, d + 2.1);
  }
  let fini = false;
  function finChargement(sansPrechargeur) {
    if (fini) return;
    fini = true;
    html.classList.remove('charge');
    const p = $('#prechargeur');
    if (p) p.remove();
    if (ST) ST.refresh();
    introHeros(sansPrechargeur);
    document.dispatchEvent(new CustomEvent('diamond:pret'));
  }
  // Préchargeur (mécanique de fourmula.ai, ralentie le 28/10 : « L'animation du début est trop rapide ») : même durée à chaque
  // visite, une photo par palier du compteur (0,7 s chacune, contre 0,5 s chez fourmula.ai et 0,1 s à nos visites suivantes) ;
  // à 100, le cadre photo devient la carte blanche du centre de l'anneau, où le logo se pose.
  const PALIER = 0.7;
  function prechargeur() {
    const photos = $$('#pc-photos img'), cadre = $('#pc-photos'), voile = $('#pc-voile'), compte = $('#pc-compte'), roue = $('.pc-roue');
    const carte = () => $('#centre').getBoundingClientRect();
    scrollTo(0, 0);
    G.set(photos, { zIndex: (i) => i + 1 });
    G.set(photos.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
    const tl = G.timeline({ onComplete: () => finChargement(false) });
    tl.fromTo([compte, cadre, roue], { opacity: 0, filter: 'blur(20px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.08, ease: 'power2.out' }, 0);
    const o = { n: 0 };
    [17, 35, 58, 76, 89, 100].forEach((n, k) => {
      const t = 0.5 + k * PALIER;
      tl.to(o, { n, duration: PALIER - 0.1, ease: 'power2.out', onUpdate: () => (compte.textContent = Math.round(o.n)) }, t);
      const ph = photos[k + 1];
      if (ph) {
        tl.to(ph, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut' }, t);
        tl.fromTo(ph, { scale: 1.15 }, { scale: 1, duration: 1, ease: 'power2.out' }, t);
      }
    });
    const a100 = 0.5 + 6 * PALIER;
    tl.to([compte, roue], { opacity: 0, filter: 'blur(20px)', duration: 0.6, ease: 'power2.in' }, a100);
    tl.set(cadre, { margin: 0, right: 'auto', bottom: 'auto', left: () => cadre.offsetLeft, top: () => cadre.offsetTop, width: () => cadre.offsetWidth, height: () => cadre.offsetHeight }, a100);
    tl.to(cadre, { left: () => carte().left, top: () => carte().top, width: () => carte().width, height: () => carte().height,
      borderRadius: () => carte().width * 0.28, boxShadow: '0 20px 60px -20px rgba(36,32,30,.28)', duration: 1.05, ease: 'expo.inOut' }, a100 + 0.02);
    tl.to(voile, { opacity: 1, duration: 0.55, ease: 'power1.inOut' }, a100 + 0.25);
    tl.to('#prechargeur', { opacity: 0, duration: 0.2, ease: 'none' }, a100 + 1.07);
  }
  if (ANIME) preparerHeros();
  if (ANIME && !location.hash) prechargeur();
  else finChargement(true);

  if (location.hash.indexOf('#bien-') === 0) {
    const b = trouver(location.hash.slice(6));
    if (b) { try { history.replaceState({ bien: b.id }, '', location.hash); } catch (e) { /* rien */ } ouvrirFiche(b, null, false); }
  }
  window.DIAMOND = { etat, maj, ouvrirFiche, fermerFiche };
})();
