/**
 * Генерирует menu-photo-overrides.json из таблицы FILE_TO_NAME.
 * Ключ — имя блюда (как в MENU_MYRESTO_EXPORT.md / scripts/menu-print-layout.json).
 * Форматы: "Имя" | "cat-slug/Имя" | "Имя@цена" | "cat-slug/Имя@цена".
 * Один файл — одно имя. Имена валидируются build-menu-data.mjs при сборке.
 *   node scripts/apply-menu-photo-map.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Каждый ключ — файл в ildiz_menu; значение — имя блюда (при дубле — с cat-slug/ или @цена). */
const FILE_TO_NAME = {
    'achuchuk.webp': 'Аччик-чучук',
    'adana_kebab.webp': 'Адана кебаб',
    'apelsinoviy_sok.webp': 'Апельсин фреш 0,5',
    'aydaxo.webp': 'Картошка по деревенски',
    'barak_asorti.webp': 'Барак Ассорти',
    'barak_asorti_bolshoy.webp': 'Большой Барак асс.',
    'bon_file.webp': 'Бон Филе 0,5кг',
    'borsh_ildiz.webp': 'Борщ',
    'burger.webp': 'Бургер(+фри)',
    'chay_po_turetski.webp': 'Турецкий чай',
    'cheburek.webp': 'Гумма',
    'chechevichniy_sup.webp': 'Чечевичный суп',
    'cheescake.webp': 'Чиз кейк сан себастиан',
    'chicken_roll.webp': 'Чикен Запеченный',
    'chorniy_xleb.webp': 'Черный Хлеб',
    'dinya.webp': 'Арбуз и Дыня',
    'dumba.webp': 'Думба',
    'fituchino_alfredo.webp': 'Альфредо',
    'fruktoviy_chay.webp': 'Ягодный чай',
    'frultoviy_asorti.webp': 'Фруктовое ассорти',
    'gok_barak.webp': 'Гук Барак',
    'gonkonskie_vafli.webp': 'Вафли',
    'gribnoy_kremzo.webp': 'Грибной крем-суп',
    'gusht_say_ildiz.webp': 'Гушт Сай',
    'ijzhon_shashlik.webp': 'Ижжон (местный)',
    'ildiz_asorti.webp': 'Илдиз Ассорти',
    'ildiz_gorachee.webp': 'Илдиз Горячее',
    'ildiz_salat.webp': 'Салат "Илдиз"',
    'imbirniy_chay.webp': 'Имбирный чай',
    'jigar_kabob.webp': 'Жигар кабоб',
    'juja_kurinaya.webp': 'Жужа',
    'kadi_barak.webp': 'Кади Барак',
    'kapshirma.webp': 'Капширма',
    'karbonara_s_kuritsey.webp': 'Карбонара с курицей',
    'kareyka.webp': 'Корейка',
    'kartoshka_bebi.webp': 'shashlyki/Картошка беби',
    'kartoshka_fri.webp': 'Картошка фри',
    'kaymak_kabob.webp': 'Каймака Кабоб',
    'kofte_sirom.webp': 'Кофте с сыром',
    'kurinie_krilashki.webp': 'Куриные крылышки',
    'kutir_barak.webp': 'Кутир барак',
    'lagman_jun.webp': 'Лахмаджун',
    'lepeshka.webp': 'Лепешки',
    'mangal_asorti.webp': 'Мангал Ассорти',
    'manti.webp': 'Манты (4шт)',
    'molochniy_chay.webp': 'Чай с Молоком',
    'molotiy_shashlik.webp': 'Гиждувон',
    'mujskoy_kapriz.webp': 'Каприз',
    'myasnoy_asorti.webp': 'Мясное ассорти',
    'myasnoy_pide.webp': 'Пиде мясной',
    'myasnoy_pizza.webp': 'Пицца мясная',
    'napaleon.webp': 'Наполеон',
    'okroshka.webp': 'Окрошка',
    'olivye.webp': 'Оливье (с мясом)',
    'olot_somsa.webp': ['Олот Сомса(1шт)', 'Олот сомса (4шт)'],
    'osma_shorva.webp': 'Осма Шурпа',
    'ovoshi_na_grile.webp': 'garniry-i-sousy/Овощи на гриле',
    'ovoshnoy_buket.webp': 'Овощное ассорти',
    'ovoshnoy_salat.webp': 'Свежий',
    'pelmeni.webp': 'Ушок барак',
    'pide_peperoni.webp': 'Пиде пепперони',
    'pizza_peperoni_ildiz.webp': 'Пицца пепперони',
    'plov.webp': 'Плов сузма',
    'pyure.webp': 'Пюре',
    'riba_s_sousom.webp': 'Сазан в Соусе',
    'ris.webp': 'Рис',
    'rulet_iz_baklajanov.webp': 'Баклажановые рулетики',
    'salat_fransuski_ildiz.webp': 'Французский',
    'salat_grecheski.webp': 'Греческий',
    'salat_trend.webp': 'Салат Тренд',
    'salat_tulum.webp': 'Салат Тулум',
    'salat_vitaminka.webp': 'Витаминка',
    'salat_yazikom.webp': 'Салат с языком',
    'saryoga_tovuk.webp': 'Сарйога товук',
    'sazan_jareniy.webp': 'Сазан Ковурилган (1кг)',
    'set_ildiz.webp': 'Сет Илдиз',
    'setka_balik.webp': 'Сазан Сетка (1кг)',
    'shashlik_govyadina_kuskovaya.webp': 'Кусковой шашлык',
    'shef_assorti.webp': 'Шеф Ассорти',
    'shipit_oshi.webp': 'Шивит Оши',
    'shur_kabob.webp': 'Шур кабоб',
    'sirniy_kotlet.webp': 'Сырная котлета',
    'sirniy_pide.webp': 'Пиде с сыром',
    'sirnoe_asorti.webp': 'Сырное ассорти',
    'soloniy_asorti.webp': 'Солёное ассорти',
    'sousi.webp': 'Соусы',
    'steyk_aribay.webp': 'Стейк рибай',
    'steyk_darlas.webp': 'Стейк Даллас',
    'steyk_klassicheskiy.webp': 'Стейк классика',
    'steyk_kuriniy.webp': 'Стейк куриный',
    'sup_s_pelmenyami.webp': 'Шурпа с пельменями',
    'syuzma.webp': 'Сузьма',
    'tandir_shorva.webp': 'Тандир шурпа',
    'tsezar_salat.webp': 'Цезарь',
    'tushenka.webp': 'Тушеное мясо 1кг',
    'tuxum_barak.webp': 'Тухум барак',
    'tyopliy_say_s_kuritsey.webp': 'Тёплый салат с курицей',
    'un_oshi.webp': 'Ун оши',
    'vino_bagizagan.webp': 'Bagizagan',
    'xachapuri_po_adjarski.webp': 'Хачапури по Аджарски',
    'xachapuri_po_vengerski.webp': 'Хачапури по Мегрельски',
    'xiva_ijan.webp': 'Хива ижжон',
    'xleb_xorezmskiy.webp': 'Хоразм Чурак',
    'xrustashiy_baklajan_ildiz.webp': 'Хрустящий баклажан',
    'yaponskiy_salat.webp': 'Японский',
    'yazik_v_slivachnom_souse.webp': 'Язык в сливочном соусе',
};

/** Файл в ildiz_menu, но пока ни к одной позиции не привязан. */
const UNASSIGNED_ON_DISK = new Set([
    'xorazm_kabob.webp',
    'salat_tsezar.webp',
    'setka_kabob.webp',
    'setka_kabob_0_5kg.webp',
    'manti_1sht.webp',
    'steyk.webp',
    'ikra.webp',
    'seledka_po_ruski.webp',
    'chay_bardak.webp',
]);

const menuDir = path.join(root, 'ildiz_menu');
const onDisk = fs
    .readdirSync(menuDir)
    .filter((f) => /\.webp$/i.test(f) && !/^no-photo/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

for (const f of onDisk) {
    if (FILE_TO_NAME[f]) continue;
    if (UNASSIGNED_ON_DISK.has(f)) continue;
    console.error('Нет в карте:', f);
    process.exit(1);
}
for (const f of Object.keys(FILE_TO_NAME)) {
    if (!onDisk.includes(f)) {
        console.error('В карте нет файла на диске:', f);
        process.exit(1);
    }
}

// ... (верхняя часть файла и проверка onDisk остаются без изменений)

const usedNames = new Set();
const overrides = {};
/* Ключи сортируем по значению (имени файла) — так diff остаётся стабильным и предсказуемым. */
const sortedFiles = Object.keys(FILE_TO_NAME).sort();
for (const file of sortedFiles) {
    const val = FILE_TO_NAME[file];

    // Если значение — массив, используем его, иначе оборачиваем одиночную строку в массив
    const names = Array.isArray(val) ? val : [val];

    for (const name of names) {
        if (usedNames.has(name)) {
            console.error('Два файла на одно имя:', name);
            process.exit(1);
        }
        usedNames.add(name);
        overrides[name] = file;
    }
}

fs.writeFileSync(
    path.join(root, 'menu-photo-overrides.json'),
    JSON.stringify(overrides, null, 2) + '\n',
    'utf8',
);
console.log('menu-photo-overrides.json:', usedNames.size, 'привязок');