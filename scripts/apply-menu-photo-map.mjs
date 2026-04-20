/**
 * Генерирует menu-photo-overrides.json: каждый .webp в ildiz_menu — ровно одна позиция.
 * node scripts/apply-menu-photo-map.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Каждый ключ — файл из ildiz_menu; каждое значение — уникальный item id */
const FILE_TO_ID = {
    'achuchuk.webp': 'soleniya-1',
    'adana_kebab.webp': 'shashlyki-1',
    'apelsinoviy_sok.webp': 'limonady-2',
    'aydaxo.webp': 'garniry-i-sousy-7',
    'barak_asorti.webp': 'khamir-11',
    'barak_asorti_bolshoy.webp': 'khamir-5',
    'bon_file.webp': 'banketnoe-meniu-1',
    'borsh_ildiz.webp': 'supy-2',
    'burger.webp': 'goriachie-bliuda-9',
    'chay_bardak.webp': 'avtorskii-chai-3',
    'chay_po_turetski.webp': 'avtorskii-chai-2',
    'cheburek.webp': 'khamir-8',
    'chechevichniy_sup.webp': 'supy-8',
    'cheescake.webp': 'deserty-0',
    'chicken_roll.webp': 'sushi-2',
    'chorniy_xleb.webp': 'khleb-5',
    'dinya.webp': 'kholodnye-zakuski-3',
    'dumba.webp': 'shashlyki-6',
    'fituchino_alfredo.webp': 'pasta-0',
    'fruktoviy_chay.webp': 'avtorskii-chai-0',
    'frultoviy_asorti.webp': 'kholodnye-zakuski-0',
    'gok_barak.webp': 'khamir-6',
    'gonkonskie_vafli.webp': 'deserty-11',
    'gribnoy_kremzo.webp': 'supy-3',
    'gusht_say_ildiz.webp': 'goriachie-bliuda-15',
    'ikra.webp': 'kholodnye-zakuski-5',
    'ildiz_asorti.webp': 'banketnoe-meniu-2',
    'ildiz_gorachee.webp': 'goriachie-bliuda-3',
    'ildiz_salat.webp': 'salaty-0',
    'imbirniy_chay.webp': 'avtorskii-chai-1',
    'jigar_kabob.webp': 'goriachie-bliuda-0',
    'juja_kurinaya.webp': 'goriachie-bliuda-6',
    'kadi_barak.webp': 'khamir-9',
    'kapshirma.webp': 'khamir-13',
    'karbonara_s_kuritsey.webp': 'pasta-1',
    'kareyka.webp': 'shashlyki-4',
    'kartoshka_bebi.webp': 'shashlyki-5',
    'kartoshka_fri.webp': 'garniry-i-sousy-8',
    'kaymak_kabob.webp': 'goriachie-bliuda-21',
    'kofte_sirom.webp': 'goriachie-bliuda-18',
    'ijzhon_shashlik.webp': 'shashlyki-8',
    'kurinie_krilashki.webp': 'shashlyki-7',
    'kutir_barak.webp': 'khamir-7',
    'lagman_jun.webp': 'supy-6',
    'lepeshka.webp': 'khleb-3',
    'mangal_asorti.webp': 'banketnoe-meniu-6',
    'manti.webp': 'khamir-12',
    'molochniy_chay.webp': 'avtorskii-chai-4',
    'molotiy_shashlik.webp': 'shashlyki-2',
    'mujskoy_kapriz.webp': 'salaty-2',
    'myasnoy_asorti.webp': 'kholodnye-zakuski-2',
    'myasnoy_pide.webp': 'tandyr-4',
    'myasnoy_pizza.webp': 'tandyr-8',
    'napaleon.webp': 'shashlyki-0',
    'okroshka.webp': 'soleniya-10',
    'olivye.webp': 'salaty-4',
    'olot_somsa.webp': 'khamir-2',
    'osma_shorva.webp': 'supy-0',
    'ovoshi_na_grile.webp': 'garniry-i-sousy-1',
    'ovoshnoy_buket.webp': 'soleniya-6',
    'ovoshnoy_salat.webp': 'soleniya-5',
    'pelmeni.webp': 'khamir-14',
    'pide_peperoni.webp': 'tandyr-2',
    'pizza_peperoni_ildiz.webp': 'tandyr-0',
    'plov.webp': 'goriachie-bliuda-2',
    'pyure.webp': 'garniry-i-sousy-6',
    'riba_s_sousom.webp': 'ryba-3',
    'ris.webp': 'garniry-i-sousy-2',
    'rulet_iz_baklajanov.webp': 'salaty-12',
    'salat_fransuski_ildiz.webp': 'salaty-3',
    'salat_grecheski.webp': 'salaty-9',
    'salat_trend.webp': 'salaty-14',
    'salat_tulum.webp': 'salaty-8',
    'salat_vitaminka.webp': 'salaty-15',
    'salat_yazikom.webp': 'salaty-1',
    'saryoga_tovuk.webp': 'goriachie-bliuda-14',
    'sazan_jareniy.webp': 'ryba-1',
    'seledka_po_ruski.webp': 'kholodnye-zakuski-4',
    'set_ildiz.webp': 'sushi-11',
    'setka_balik.webp': 'ryba-2',
    'shashlik_govyadina_kuskovaya.webp': 'shashlyki-3',
    'shef_assorti.webp': 'banketnoe-meniu-0',
    'shipit_oshi.webp': 'khamir-3',
    'sirniy_kotlet.webp': 'goriachie-bliuda-32',
    'shur_kabob.webp': 'goriachie-bliuda-34',
    'sirniy_pide.webp': 'tandyr-5',
    'sirnoe_asorti.webp': 'kholodnye-zakuski-7',
    'soloniy_asorti.webp': 'soleniya-4',
    'sousi.webp': 'sousy-0',
    'steyk_aribay.webp': 'goriachie-bliuda-29',
    'steyk_darlas.webp': 'goriachie-bliuda-16',
    'steyk_klassicheskiy.webp': 'goriachie-bliuda-11',
    'steyk_kuriniy.webp': 'goriachie-bliuda-13',
    'sup_s_pelmenyami.webp': 'supy-5',
    'syuzma.webp': 'soleniya-7',
    'tsezar_salat.webp': 'salaty-5',
    'tyopliy_say_s_kuritsey.webp': 'salaty-6',
    'tandir_shorva.webp': 'supy-1',
    'tushenka.webp': 'banketnoe-meniu-3',
    'tuxum_barak.webp': 'khamir-10',
    'un_oshi.webp': 'supy-7',
    'vino_bagizagan.webp': 'vino-2',
    'xachapuri_po_adjarski.webp': 'tandyr-7',
    'xachapuri_po_vengerski.webp': 'tandyr-3',
    'xiva_ijan.webp': 'salaty-7',
    'xleb_xorezmskiy.webp': 'khleb-4',
    'xrustashiy_baklajan_ildiz.webp': 'salaty-13',
    'yaponskiy_salat.webp': 'salaty-10',
    'yazik_v_slivachnom_souse.webp': 'goriachie-bliuda-1',
};

/** Файл в ildiz_menu, но без позиции в меню (пока вручную не скажете куда) */
const UNASSIGNED_ON_DISK = new Set([
    'xorazm_kabob.webp',
    'salat_tsezar.webp',
    'setka_kabob.webp',
    'setka_kabob_0_5kg.webp',
    'manti_1sht.webp',
    'steyk.webp',
]);

const menuDir = path.join(root, 'ildiz_menu');
const onDisk = fs
    .readdirSync(menuDir)
    .filter((f) => /\.webp$/i.test(f) && !/^no-photo/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const keys = Object.keys(FILE_TO_ID).sort();
for (const f of onDisk) {
    if (FILE_TO_ID[f]) continue;
    if (UNASSIGNED_ON_DISK.has(f)) continue;
    console.error('Нет в карте:', f);
    process.exit(1);
}
for (const f of keys) {
    if (!onDisk.includes(f)) {
        console.error('В карте нет файла на диске:', f);
        process.exit(1);
    }
}

const usedIds = new Set();
const overrides = {};
for (const [file, id] of Object.entries(FILE_TO_ID)) {
    if (usedIds.has(id)) {
        console.error('Два файла на один id:', id);
        process.exit(1);
    }
    usedIds.add(id);
    overrides[id] = file;
}

fs.writeFileSync(path.join(root, 'menu-photo-overrides.json'), JSON.stringify(overrides, null, 2), 'utf8');
console.log('menu-photo-overrides.json:', usedIds.size, 'привязок');
