(function () {
  const overrides = window.MENU_IMG_OVERRIDES || {
    'Аччик-чучук': 'ildiz_menu/achuchuk.webp',
    'Адана': 'ildiz_menu/adana_kebab.webp',
    'Апельсин фреш 0,5': 'ildiz_menu/apelsinoviy_sok.webp',
    'Картошка по деревенски': 'ildiz_menu/aydaxo.webp',
    'Большой Барак асс.': 'ildiz_menu/barak_asorti_bolshoy.webp',
    'Барак Ассорти': 'ildiz_menu/barak_asorti.webp',
    'Борщ': 'ildiz_menu/borsh_ildiz.webp',
    'Бургер': 'ildiz_menu/burger.webp',
    'Бон Филе 0,5кг': 'ildiz_menu/bon_file.webp',
    'Бон Филе 1,0кг': 'ildiz_menu/bon_file.webp',
    'Лахмаджун': 'ildiz_menu/lagman_jun.webp',
    'Манты': 'ildiz_menu/manti.webp',
    '1шт. Манты': 'ildiz_menu/manti.webp',
    'Олот Сомса': 'ildiz_menu/olot_somsa.webp',
    '1 шт. Олот Сомса': 'ildiz_menu/olot_somsa.webp',
    'Шурпа': 'ildiz_menu/osma_shorva.webp',
    'Мастава': 'ildiz_menu/no-photo.webp',
    'Плов 1,5порц.': 'ildiz_menu/plov.webp',
    'Плов 1порц.': 'ildiz_menu/plov.webp'
  };

  const hiddenNames = window.MENU_HIDDEN_NAMES || [
    'Медальон',
    'Плов двойной 1,5порц.',
    'Плов двойной',
    'Плов 50'
  ];

  const data = window.MENU_DATA;
  if (!data || typeof data !== 'object') return;

  const normPath = (p) => String(p || '').replace(/\\/g, '/');

  Object.values(data).forEach((arr) => {
    if (!Array.isArray(arr)) return;
    for (let i = arr.length - 1; i >= 0; i--) {
      const item = arr[i];
      if (!item || !item.name) continue;
      const ru = item.name.ru;
      const uz = item.name.uz;
      const en = item.name.en;

      if ((ru && hiddenNames.includes(ru)) || (uz && hiddenNames.includes(uz)) || (en && hiddenNames.includes(en))) {
        arr.splice(i, 1);
        continue;
      }

      const key = (ru && overrides[ru]) ? ru : (uz && overrides[uz]) ? uz : (en && overrides[en]) ? en : null;
      if (!key) continue;
      item.img = normPath(overrides[key]);
    }
  });

  window.MENU_IMG_OVERRIDES = overrides;
  window.MENU_HIDDEN_NAMES = hiddenNames;
})();
