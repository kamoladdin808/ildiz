import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
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
const imgs = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    'https://images.unsplash.com/photo-1563379926898-05f4575a220d?w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
];
const orderPreferred = [
    'salaty', 'kholodnye-zakuski', 'supy', 'khamir', 'goriachie-bliuda', 'tandyr', 'shashlyki', 'sushi', 'ryba',
    'banketnoe-meniu', 'garniry-i-sousy', 'khleb', 'chai', 'avtorskii-chai', 'kofe', 'limonady', 'napitki',
    'banochnye-napitki', 'pivo-banochnoe', 'vino', 'shampanskoe', 'kokteil', 'alkogol', 'bar', 'deserty',
    'sukhofrukty', 'svezhie-frukty', 'shokolad-orbit',
];
const rest = order.filter((k) => !orderPreferred.includes(k));
const finalOrder = [...orderPreferred.filter((k) => raw[k]), ...rest];
const catTitles = {
    salaty: { uz: 'Salatlar', ru: 'Салаты', en: 'Salads' },
    'kholodnye-zakuski': { uz: 'Sovuq zakuskalar', ru: 'Холодные закуски', en: 'Cold appetizers' },
    supy: { uz: "Sho'rvalar", ru: 'Супы', en: 'Soups' },
    khamir: { uz: 'Xamir taomlar', ru: 'Хамир', en: 'Dough dishes' },
    'goriachie-bliuda': { uz: 'Issiq taomlar', ru: 'Горячие блюда', en: 'Hot dishes' },
    tandyr: { uz: 'Tandir', ru: 'Тандыр', en: 'Tandoor' },
    shashlyki: { uz: 'Shashliklar', ru: 'Шашлыки', en: 'Shashlik' },
    sushi: { uz: 'Sushi', ru: 'Суши', en: 'Sushi' },
    ryba: { uz: 'Baliq', ru: 'Рыба', en: 'Fish' },
    'banketnoe-meniu': { uz: 'Banket menyusi', ru: 'Банкетное меню', en: 'Banquet menu' },
    'garniry-i-sousy': { uz: 'Garnir va souslar', ru: 'Гарниры и соусы', en: 'Sides & sauces' },
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
const D = {};
for (const key of finalOrder) {
    const items = raw[key] || [];
    D[key] = items.map((it, i) => ({
        id: key + '-' + i,
        name: { uz: it.name, ru: it.name, en: it.name },
        sub: { uz: 'ILDIZ menyu', ru: 'Меню ILDIZ', en: 'ILDIZ menu' },
        desc: { uz: 'Restoran menyusidan', ru: 'Из меню ресторана', en: 'From the restaurant menu' },
        price: it.price,
        img: imgs[i % imgs.length],
    }));
}
const labels = Object.fromEntries(finalOrder.map((k) => [k, catTitles[k] || { uz: k, ru: k, en: k }]));
const out =
    '// Сгенерировано из MENU_MYRESTO_EXPORT.md — node scripts/build-menu-data.mjs\n' +
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
