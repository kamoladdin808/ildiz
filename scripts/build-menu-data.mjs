import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const menuPhotoDir = path.join(root, 'ildiz_menu');
/** Без пула: только overrides и совпадение имени файла; иначе — плейсхолдер (нет «чужих» фото). Пул: MENU_PHOTO_POOL=1 */
const usePhotoPool = process.env.MENU_PHOTO_POOL === '1';
const menuImgPlaceholder = 'ildiz_menu/no-photo.webp';
/** В папке есть, но не цепляем к позициям автоматически (stem/пул); в overrides можно явно */
const unassignedMenuPhotoFiles = new Set([]);
const md = fs.readFileSync(path.join(root, 'MENU_MYRESTO_EXPORT.md'), 'utf8');
const lines = md.split(/\r?\n/);
const raw = {};
const order = [];
let cur = null;
const catRe = /^## (.+?) \(`([^`]+)`\)\s*$/;
const itemRe = /^- \*\*(.+?)\*\* — ([\d\s]+)\s*UZS\s*$/;
for (const line of lines) {
    let m = line.match(catRe);
    if (m) {
        cur = m[2];
        order.push(cur);
        raw[cur] = [];
        continue;
    }
    m = line.match(itemRe);
    if (m && cur) {
        raw[cur].push({
            name: m[1].replace(/\s+/g, ' ').trim(),
            price: parseInt(String(m[2]).replace(/\s/g, ''), 10),
        });
    }
}

function normItemName(s) {
    return String(s || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/ё/g, 'е');
}

function parseItemSpec(spec) {
    const s = String(spec).trim();
    const at = s.lastIndexOf('@');
    if (at > 0) {
        const pricePart = s.slice(at + 1).trim();
        if (/^\d+$/.test(pricePart)) {
            return { name: s.slice(0, at).trim(), price: Number(pricePart) };
        }
    }
    return { name: s };
}

function pullFromPool(pool, spec) {
    const { name, price } = parseItemSpec(spec);
    const want = normItemName(name);
    const idx = pool.findIndex(
        (it) => normItemName(it.name) === want && (price === undefined || it.price === price),
    );
    if (idx === -1) return null;
    return pool.splice(idx, 1)[0];
}

/**
 * Пересборка категорий по печатному меню: scripts/menu-print-layout.json
 * (названия совпадают с MENU_MYRESTO_EXPORT.md; дубли — «Имя@цена»).
 */
function applyPrintMenuLayout(raw, mdCategoryOrder, layout) {
    const pool = [];
    for (const slug of mdCategoryOrder) {
        for (const it of raw[slug] || []) {
            pool.push({ name: it.name, price: it.price });
        }
    }
    const newRaw = {};
    const { categoryOrder, assignments } = layout;
    let miss = 0;
    for (const slug of categoryOrder) {
        const specs = assignments[slug];
        if (!specs) {
            console.error(`menu-print-layout.json: нет assignments для «${slug}»`);
            process.exit(1);
        }
        newRaw[slug] = [];
        for (const spec of specs) {
            const item = pullFromPool(pool, spec);
            if (!item) {
                console.error(`menu-print-layout.json: не найдено в экспорте MD: «${spec}»`);
                miss++;
            } else {
                newRaw[slug].push(item);
            }
        }
    }
    if (miss) process.exit(1);
    if (pool.length) {
        console.error(`menu-print-layout: не распределено позиций: ${pool.length}`);
        pool.slice(0, 20).forEach((it) => console.error(`  — ${it.name} (${it.price})`));
        process.exit(1);
    }
    for (const k of Object.keys(raw)) {
        delete raw[k];
    }
    Object.assign(raw, newRaw);
}

const printLayoutPath = path.join(root, 'scripts', 'menu-print-layout.json');
const printLayout = JSON.parse(fs.readFileSync(printLayoutPath, 'utf8'));
const mdCategoryOrder = [...order];
applyPrintMenuLayout(raw, mdCategoryOrder, printLayout);

function listLocalMenuPhotos() {
    if (!fs.existsSync(menuPhotoDir)) return [];
    return fs
        .readdirSync(menuPhotoDir)
        .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

const CYR_TO_LAT = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    қ: 'q',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ў: 'u',
    ф: 'f',
    х: 'h',
    ҳ: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ғ: 'g',
};

function translitRuToLatin(str) {
    let out = '';
    for (const ch of str.toLowerCase()) {
        out += CYR_TO_LAT[ch] !== undefined ? CYR_TO_LAT[ch] : ch;
    }
    return out;
}

function normKey(s) {
    return translitRuToLatin(s)
        .normalize('NFKC')
        .trim()
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/'/g, '')
        .replace(/[«»"„“”(),.]/g, '')
        .replace(/[^\p{L}\p{N}+-]+/gu, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/gu, '');
}

function dishNameKeys(catSlug, dishNameRaw) {
    const dishName = String(dishNameRaw || '')
        .replace(/\s+/g, ' ')
        .trim();
    const keys = [];
    const add = (k) => {
        const n = normKey(k);
        if (n && !keys.includes(n)) keys.push(n);
    };
    add(dishName);
    if (catSlug) add(`${catSlug}__${dishName}`);
    const simple = dishName.replace(/^\d+\s+/u, '').replace(/\s+\d+\s*порц\.?$/iu, '').trim();
    if (simple && simple !== dishName) add(simple);
    if (catSlug && simple && simple !== dishName) add(`${catSlug}__${simple}`);
    const words = dishName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        const parts = words.map((w) => normKey(w)).filter(Boolean);
        if (parts.length >= 2) {
            add(parts.join('-'));
            add([...parts].reverse().join('-'));
        }
    }
    return keys;
}

function translitVariantsForKey(key) {
    const v = new Set([key]);
    const add = (s) => {
        if (s) v.add(s);
    };
    add(key.replace(/goryachee/g, 'gorachee'));
    add(key.replace(/gorachee/g, 'goryachee'));
    add(key.replace(/nyy/g, 'niy'));
    add(key.replace(/niy/g, 'nyy'));
    add(key.replace(/skiy/g, 'ski'));
    add(key.replace(/(^|-)ski(-|$)/g, (m, a, b) => `${a}skiy${b}`));
    if (key.includes('zh')) add(key.replace(/zh/g, 'j'));
    return [...v];
}

function extraKeysFromFileStem(stemNorm) {
    const extra = [];
    const p = stemNorm.split('-').filter(Boolean);
    if (p.length === 3 && p[1] === 'po') {
        extra.push(`${p[0]}-${p[2]}`, `${p[2]}-${p[0]}`);
    }
    return extra;
}

function buildStemToFileMap(photos) {
    const map = new Map();
    for (const f of photos) {
        const stem = path.parse(f).name;
        const k = normKey(stem);
        if (!k) continue;
        if (map.has(k)) {
            console.warn(`ildiz_menu: одно имя после нормализации («${k}»): ${map.get(k)} и ${f}`);
            continue;
        }
        map.set(k, f);
        for (const ek of extraKeysFromFileStem(k)) {
            if (!map.has(ek)) map.set(ek, f);
        }
    }
    return map;
}

function loadPhotoOverrides(photos) {
    const p = path.join(root, 'menu-photo-overrides.json');
    if (!fs.existsSync(p)) return {};
    let data;
    try {
        data = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
        console.error('menu-photo-overrides.json:', e instanceof Error ? e.message : e);
        process.exit(1);
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        console.error('menu-photo-overrides.json: ожидается объект');
        process.exit(1);
    }
    const lowerToCanon = new Map(photos.map((f) => [f.toLowerCase(), f]));
    const resolved = {};
    for (const [itemId, spec] of Object.entries(data)) {
        if (typeof spec !== 'string' || !spec.trim()) continue;
        const base = path.basename(spec.trim());
        const canon = lowerToCanon.get(base.toLowerCase());
        if (!canon) {
            console.error(`menu-photo-overrides.json: нет файла: ${base}`);
            process.exit(1);
        }
        resolved[itemId] = canon;
    }
    return resolved;
}

function loadPhotoAliases(photos) {
    const p = path.join(root, 'menu-photo-alias.json');
    if (!fs.existsSync(p)) return new Map();
    let data;
    try {
        data = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
        console.error('menu-photo-alias.json:', e instanceof Error ? e.message : e);
        process.exit(1);
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        console.error('menu-photo-alias.json: ожидается объект');
        process.exit(1);
    }
    const lowerToCanon = new Map(photos.map((f) => [f.toLowerCase(), f]));
    const map = new Map();
    const targetFiles = [];
    for (const [aliasKey, spec] of Object.entries(data)) {
        if (typeof spec !== 'string' || !spec.trim()) continue;
        const base = path.basename(spec.trim());
        const canon = lowerToCanon.get(base.toLowerCase());
        if (!canon) {
            console.error(`menu-photo-alias.json: нет файла: ${base}`);
            process.exit(1);
        }
        const nk = normKey(aliasKey);
        if (!nk) continue;
        if (map.has(nk) && map.get(nk) !== canon) {
            console.error(`menu-photo-alias.json: ключ «${aliasKey}» конфликтует`);
            process.exit(1);
        }
        map.set(nk, canon);
        targetFiles.push(canon);
    }
    if (targetFiles.length !== new Set(targetFiles).size) {
        console.error('menu-photo-alias.json: одно фото на несколько названий');
        process.exit(1);
    }
    return map;
}

function relPathMenuPhoto(f) {
    return 'ildiz_menu/' + f.replace(/\\/g, '/');
}

function assignAllMenuImages(rows, photos, overrides, stemMap) {
    const used = new Set(Object.values(overrides));
    const stats = { byOverride: 0, byStem: 0, byPool: 0, byPlaceholder: 0 };
    const imgById = new Map();

    function takeNextPool() {
        for (const f of photos) {
            if (unassignedMenuPhotoFiles.has(f)) continue;
            if (!used.has(f)) {
                used.add(f);
                return f;
            }
        }
        return null;
    }

    for (const row of rows) {
        const ov = overrides[row.id];
        if (!ov) continue;
        if (!photos.includes(ov)) {
            console.error(`menu-photo-overrides: нет файла ${ov}`);
            process.exit(1);
        }
        imgById.set(row.id, relPathMenuPhoto(ov));
        stats.byOverride++;
    }

    for (const row of rows) {
        if (imgById.has(row.id)) continue;
        let hit = null;
        outer: for (const stemKey of dishNameKeys(row.cat, row.name)) {
            for (const vk of translitVariantsForKey(stemKey)) {
                const f = stemMap.get(vk);
                if (f && !used.has(f)) {
                    hit = f;
                    break outer;
                }
            }
        }
        if (hit) {
            used.add(hit);
            imgById.set(row.id, relPathMenuPhoto(hit));
            stats.byStem++;
        }
    }

    if (usePhotoPool) {
        for (const row of rows) {
            if (imgById.has(row.id)) continue;
            const fb = takeNextPool();
            if (fb) {
                imgById.set(row.id, relPathMenuPhoto(fb));
                stats.byPool++;
            }
        }
    }

    for (const row of rows) {
        if (imgById.has(row.id)) continue;
        imgById.set(row.id, menuImgPlaceholder);
        stats.byPlaceholder++;
    }

    if (stats.byPlaceholder > 0) {
        console.warn(
            `Фото: ${stats.byPlaceholder} поз. без снимка → ${menuImgPlaceholder} (имя файла в ildiz_menu, overrides или MENU_PHOTO_POOL=1).`,
        );
    }

    return { imgById, stats };
}

const finalOrder = printLayout.categoryOrder;
const catTitles = {
    salaty: { uz: 'Salatlar', ru: 'Салаты', en: 'Salads' },
    'kholodnye-zakuski': { uz: 'Sovuq zakuskalar', ru: 'Холодные закуски', en: 'Cold appetizers' },
    supy: { uz: "Sho'rvalar", ru: 'Супы', en: 'Soups' },
    khamir: { uz: 'Xamir taomlar', ru: 'Хамир', en: 'Dough dishes' },
    'goriachie-bliuda': { uz: 'Issiq taomlar', ru: 'Горячие блюда', en: 'Hot dishes' },
    tandyr: { uz: 'Tandir', ru: 'Тандыр', en: 'Tandoor' },
    shashlyki: { uz: 'Mangal', ru: 'Мангал', en: 'Grill' },
    sushi: { uz: 'Sushi', ru: 'Суши', en: 'Sushi' },
    ryba: { uz: 'Baliq', ru: 'Рыба', en: 'Fish' },
    'banketnoe-meniu': { uz: 'Banket menyusi', ru: 'Банкетное меню', en: 'Banquet menu' },
    'garniry-i-sousy': { uz: 'Garnirlar', ru: 'Гарниры', en: 'Sides' },
    sousy: { uz: 'Souslar', ru: 'Соусы', en: 'Sauces' },
    khleb: { uz: 'Non', ru: 'Хлеб', en: 'Bread' },
    chai: { uz: 'Choy', ru: 'Чай', en: 'Tea' },
    'avtorskii-chai': { uz: 'Muallif choyi', ru: 'Авторский чай', en: 'Author tea' },
    kofe: { uz: 'Qahva', ru: 'Кофе', en: 'Coffee' },
    limonady: { uz: 'Limonadlar', ru: 'Лимонады', en: 'Lemonades' },
    napitki: { uz: 'Ichimliklar', ru: 'Напитки', en: 'Beverages' },
    'banochnye-napitki': { uz: 'Banka ichimliklar', ru: 'Баночные напитки', en: 'Canned drinks' },
    'pivo-banochnoe': { uz: 'Pivo (banka)', ru: 'Пиво баночное', en: 'Beer (can)' },
    vino: { uz: 'Vino', ru: 'Вино', en: 'Wine' },
    shampanskoe: { uz: 'Shampan', ru: 'Шампанское', en: 'Champagne' },
    kokteil: { uz: 'Kokteyl / sheyk', ru: 'Коктейли', en: 'Cocktails & shakes' },
    alkogol: { uz: 'Alkogol', ru: 'Алкоголь', en: 'Spirits' },
    bar: { uz: 'Bar', ru: 'Бар', en: 'Bar' },
    deserty: { uz: 'Shirinliklar', ru: 'Десерты', en: 'Desserts' },
    sukhofrukty: { uz: 'Quritilgan mevalar', ru: 'Сухофрукты', en: 'Dried fruit & snacks' },
    'svezhie-frukty': { uz: 'Yangi mevalar', ru: 'Свежие фрукты', en: 'Fresh fruit' },
    'shokolad-orbit': { uz: 'Snack / shokolad', ru: 'Шоколад орбит', en: 'Snacks' },
};
for (const [k, v] of Object.entries(printLayout.titles || {})) {
    catTitles[k] = v;
}

const menuRows = [];
for (const key of finalOrder) {
    const items = raw[key] || [];
    items.forEach((it, i) => {
        menuRows.push({ id: key + '-' + i, cat: key, name: it.name });
    });
}

const localPhotos = listLocalMenuPhotos();
let imgById = new Map();
let assignStats = null;
if (localPhotos.length === 0) {
    console.warn('ildiz_menu без изображений — все карточки с плейсхолдером.');
}
{
    const overrides = loadPhotoOverrides(localPhotos);
    const ovVals = Object.values(overrides);
    if (ovVals.length !== new Set(ovVals).size) {
        console.error('menu-photo-overrides.json: повтор одного файла у разных id');
        process.exit(1);
    }
    const stemFromFiles = buildStemToFileMap(
        localPhotos.filter((f) => !unassignedMenuPhotoFiles.has(f)),
    );
    const aliases = loadPhotoAliases(localPhotos);
    const stemMap = new Map(stemFromFiles);
    for (const [k, f] of aliases) {
        if (stemMap.has(k) && stemMap.get(k) !== f) {
            console.warn(`menu-photo-alias «${k}»: ${stemMap.get(k)} заменено на ${f}`);
        }
        stemMap.set(k, f);
    }
    const r = assignAllMenuImages(menuRows, localPhotos, overrides, stemMap);
    imgById = r.imgById;
    assignStats = r.stats;
}

const D = {};
for (const key of finalOrder) {
    const items = raw[key] || [];
    D[key] = items.map((it, i) => {
        const id = key + '-' + i;
        return {
            id,
            name: { uz: it.name, ru: it.name, en: it.name },
            sub: { uz: 'ILDIZ menyu', ru: 'Меню ILDIZ', en: 'ILDIZ menu' },
            desc: { uz: 'Restoran menyusidan', ru: 'Из меню ресторана', en: 'From the restaurant menu' },
            price: it.price,
            img: imgById.get(id),
        };
    });
}

if (assignStats) {
    const s = assignStats;
    const sum = s.byOverride + s.byStem + s.byPool + s.byPlaceholder;
    console.log(
        `Фото: overrides ${s.byOverride}, по имени ${s.byStem}, пул ${s.byPool}, плейсхолдер ${s.byPlaceholder} (всего ${sum})`,
    );
}

const labels = Object.fromEntries(finalOrder.map((k) => [k, catTitles[k] || { uz: k, ru: k, en: k }]));
const out =
    '// Сгенерировано: MENU_MYRESTO_EXPORT.md + scripts/menu-print-layout.json — node scripts/build-menu-data.mjs\n' +
    'window.MENU_CAT_ORDER = ' +
    JSON.stringify(finalOrder) +
    ';\n' +
    'window.MENU_CAT_LABELS = ' +
    JSON.stringify(labels) +
    ';\n' +
    'window.MENU_DATA = ' +
    JSON.stringify(D) +
    ';\n';
fs.writeFileSync(path.join(root, 'menu-data.js'), out);
let n = 0;
for (const k of finalOrder) n += (raw[k] || []).length;
console.log('menu-data.js:', finalOrder.length, 'категорий,', n, 'позиций');
