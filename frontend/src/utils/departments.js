export const DEPARTMENTS = [
  { name: 'Automotivos',                                  slug: 'automotivos' },
  { name: 'Beleza',                                       slug: 'beleza' },
  { name: 'Bolsas',                                       slug: 'bolsas' },
  { name: 'Brinquedos',                                   slug: 'brinquedos' },
  { name: 'Camping/Pesca',                                slug: 'camping-pesca' },
  { name: 'Diversos',                                     slug: 'diversos' },
  { name: 'Eletro/Eletrônicos',                           slug: 'eletro-eletronicos' },
  { name: 'Esportes/Fitness',                             slug: 'esportes-fitness' },
  { name: 'Ferramentas',                                  slug: 'ferramentas' },
  { name: 'Informática',                                  slug: 'informatica' },
  { name: 'Materiais e equipamentos para construção',     slug: 'materiais-construcao' },
  { name: 'Pet',                                         slug: 'pet' },
  { name: 'Utilidades Domésticas',                        slug: 'utilidades-domesticas' },
];

export const slugToName = (slug) =>
  DEPARTMENTS.find(d => d.slug === slug)?.name ?? slug;
