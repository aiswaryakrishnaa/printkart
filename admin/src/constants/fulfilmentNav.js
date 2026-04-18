/** Product types from app configure flow — must match Flutter `productSubType` ids */
export const FULFILMENT_PRODUCT_TYPES = [
  { id: 'notice', label: 'Notice' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'visiting_card', label: 'Visiting card' },
  { id: 'straight_tuck_end', label: 'Straight tuck end' },
  { id: 'reverse_tuck_end', label: 'Reverse tuck end' },
  { id: 'bottom_interlock', label: 'Bottom interlock' },
  { id: 'pasting_down', label: 'Pasting down' },
  { id: 'cake_box', label: 'Cake box' },
  { id: 'paper_bag', label: 'Paper bag' },
];

export const CUSTOMIZATION_GENERIC_PATH = '/customizations';

export const fulfilmentProductPath = (productType) => `/fulfilment/${productType}`;

export function titleForPath(pathname) {
  if (pathname === CUSTOMIZATION_GENERIC_PATH) return 'Customization';
  if (pathname.startsWith('/orders/') && pathname !== '/orders') {
    return 'Order details';
  }
  const m = pathname.match(/^\/fulfilment\/([^/]+)\/?$/);
  if (m) {
    const row = FULFILMENT_PRODUCT_TYPES.find((x) => x.id === m[1]);
    return row ? `${row.label} orders` : 'Orders';
  }
  const core = [
    { path: '/', text: 'Dashboard' },
    { path: '/products', text: 'Products' },
    { path: '/orders', text: 'Orders' },
    { path: '/users', text: 'Users' },
    { path: '/categories', text: 'Categories' },
  ];
  const hit = core.find((c) => c.path === pathname);
  return hit?.text || 'Admin';
}
