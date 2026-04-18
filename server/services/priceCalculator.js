/**
 * Price calculation for printing & packaging.
 * Printing (notice / calendar / visiting_card): tariff tables (₹ base; GST separate on invoice).
 *
 * Packaging (boxes, not paper bags):
 *   Size = L × H × W + 1.5
 *   Paper price = ((Size × GSM × Rate) / 100_000_000) × number of boxes
 *   GSM 350 → Rate 65; GSM 400 → Rate 55
 *   Printing charge = 4600; Die cutting = 1 × number of boxes
 *   Total = paper price + printing charge + die cutting
 */

/** Divisor in packaging paper formula: (Size × GSM × Rate) / this × boxes */
const PACKAGING_PAPER_FORMULA_DIVISOR = 100_000_000;
const DEFAULT_PRINTING_CHARGE = 4600;
const DIE_CUTTING_PER_BOX = 1;

/** Box packaging: only 350 gsm (rate 65) and 400 gsm (rate 55); anything else → 350. */
function normalizePackagingGsm(gsm) {
  return Number(gsm) === 400 ? 400 : 350;
}

function packagingBoardRate(gsmNum) {
  return gsmNum === 400 ? 55 : 65;
}

/** @deprecated use normalizePackagingGsm + packagingBoardRate; kept for callers */
function getRateForGsm(gsm) {
  return packagingBoardRate(normalizePackagingGsm(gsm));
}

function calcSize(l, h, w) {
  const L = Number(l) || 0;
  const H = Number(h) || 0;
  const W = Number(w) || 0;
  return L * H * W + 1.5;
}

function calcPackagingPrice(options) {
  const { l, h, w, gsm, quantity } = options;
  const numQty = Math.max(1, Number(quantity) || 1);
  const gsmNum = normalizePackagingGsm(gsm);
  const rate = packagingBoardRate(gsmNum);

  const size = calcSize(l, h, w);
  const paperPrice =
    ((size * gsmNum * rate) / PACKAGING_PAPER_FORMULA_DIVISOR) * numQty;
  const dieCutting = DIE_CUTTING_PER_BOX * numQty;
  const printingCharge = DEFAULT_PRINTING_CHARGE;
  const total = paperPrice + printingCharge + dieCutting;

  return {
    size: Math.round(size * 1000) / 1000,
    paperPrice: Math.round(paperPrice * 100) / 100,
    printingCharge,
    dieCutting,
    total: Math.round(total * 100) / 100,
    quantity: numQty,
    gsmUsed: gsmNum,
    rateUsed: rate
  };
}

const PAPER_BAG_SIZES = {
  small: { l: 8, h: 9.5, w: 2.5 },
  medium: { l: 10, h: 13, w: 13 },
  large: { l: 12, h: 16, w: 4 }
};

/**
 * Paper bag (per copy) — ₹ base, GST separate. Quantities 1000 / 2000 / 5000.
 * Small: 18000 / 30000 / 66250 — Medium: 21500 / 37200 / 86250 — Large: 23000 / 45000 / 106250
 */
const PAPER_BAG_TARIFF = {
  small: [
    [1000, 18000],
    [2000, 30000],
    [5000, 66250]
  ],
  medium: [
    [1000, 21500],
    [2000, 37200],
    [5000, 86250]
  ],
  large: [
    [1000, 23000],
    [2000, 45000],
    [5000, 106250]
  ]
};

function calcPaperBagPrice(options) {
  const { sizeKey, quantity } = options;
  const key = String(sizeKey || 'medium').toLowerCase();
  const tiers = PAPER_BAG_TARIFF[key] || PAPER_BAG_TARIFF.medium;
  const numQty = Math.max(1, Number(quantity) || 1000);
  const total = priceFromBreakpoints(tiers, numQty);
  const dims = PAPER_BAG_SIZES[key] || PAPER_BAG_SIZES.medium;
  const size = calcSize(dims.l, dims.h, dims.w);
  const rounded = Math.round(total * 100) / 100;
  return {
    size: Math.round(size * 1000) / 1000,
    paperPrice: rounded,
    printingCharge: 0,
    dieCutting: 0,
    total: rounded,
    quantity: numQty
  };
}

/** Sorted [quantity, priceInRupees] — interpolate / extrapolate linearly between points */
function priceFromBreakpoints(breakpoints, qty) {
  const q = Math.max(0, Number(qty) || 0);
  if (!breakpoints.length) return 0;
  const sorted = [...breakpoints].sort((a, b) => a[0] - b[0]);
  const [[q0, p0]] = sorted;
  if (q <= q0) {
    if (q0 <= 0) return p0;
    return Math.round((p0 / q0) * q);
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const [q1, p1] = sorted[i];
    const [q2, p2] = sorted[i + 1];
    if (q >= q1 && q <= q2) {
      return Math.round(p1 + ((p2 - p1) / (q2 - q1)) * (q - q1));
    }
  }
  const [qL, pL] = sorted[sorted.length - 2];
  const [qR, pR] = sorted[sorted.length - 1];
  const slope = (pR - pL) / (qR - qL);
  return Math.round(pR + slope * (q - qR));
}

function isDoubleSide(side) {
  if (side == null) return false;
  const s = String(side).toLowerCase();
  return s.includes('double') || s.includes('two');
}

// --- Notice tariff (₹ base, GST separate on invoice) ---
// 100 gsm: single 1k/2k/4k/5k/10k → 3350/4000/5200/6200/10600; double → 3350/4000/5700/7200/12100
// 70 gsm (2-colour): single 1600/2100/3000/3800/6750; double 1600/2100/3200/4200/7350

/** 100 gsm NOTICE */
const NOTICE_100GSM_SINGLE = [
  [1000, 3350],
  [2000, 4000],
  [4000, 5200],
  [5000, 6200],
  [10000, 10600]
];
const NOTICE_100GSM_DOUBLE = [
  [1000, 3350],
  [2000, 4000],
  [4000, 5700],
  [5000, 7200],
  [10000, 12100]
];

/**
 * COLOUR (70 gsm) — single-colour / “not full colour” notice pricing.
 * Same qty breakpoints as rate sheet; single vs double side.
 */
const COLOUR_70_GSM_SINGLE = [
  [1000, 1600],
  [2000, 2100],
  [4000, 3000],
  [5000, 3800],
  [10000, 6750]
];
const COLOUR_70_GSM_DOUBLE = [
  [1000, 1600],
  [2000, 2100],
  [4000, 3200],
  [5000, 4200],
  [10000, 7350]
];

/**
 * CALENDAR 90 gsm (₹ base, GST separate).
 * 3 sheets: 1k–5k → 15100 / 23200 / 31600 / 39700 / 48100
 * 6 sheets: 1k–5k → 28400 / 43300 / 58600 / 73600 / 88700
 * 100 gsm: same tiers scaled × (100/90) in calcCalendarTablePrice.
 */
const CALENDAR_3_90 = [
  [1000, 15100],
  [2000, 23200],
  [3000, 31600],
  [4000, 39700],
  [5000, 48100]
];
const CALENDAR_6_90 = [
  [1000, 28400],
  [2000, 43300],
  [3000, 58600],
  [4000, 73600],
  [5000, 88700]
];

/** VISITING CARD 400 gsm — 1k: single 500 / double 650; 2k: single 900 / double 1100 (₹ base, GST separate) */
const VISITING_SINGLE = [
  [1000, 500],
  [2000, 900]
];
const VISITING_DOUBLE = [
  [1000, 650],
  [2000, 1100]
];

/**
 * Notice: two rate books from the Printcart sheet.
 * - Full colour (app `colour` = "4") → NOTICE 100 gsm (single / double).
 * - Single colour / not full colour (app `colour` = "2") → COLOUR 70 gsm (single / double).
 * Default when `colour` omitted → "4" (100 gsm notice).
 */
function calcNoticeTablePrice(quantity, side, colour) {
  const dbl = isDoubleSide(side);
  const c = colour != null ? String(colour).trim() : '4';
  const use70GsmColourSheet = c === '2';
  const tiers = dbl
    ? (use70GsmColourSheet ? COLOUR_70_GSM_DOUBLE : NOTICE_100GSM_DOUBLE)
    : (use70GsmColourSheet ? COLOUR_70_GSM_SINGLE : NOTICE_100GSM_SINGLE);
  return priceFromBreakpoints(tiers, quantity);
}

function calcCalendarTablePrice(quantity, sheets, gsm) {
  const s = Number(sheets) || 6;
  const tiers = s <= 3 ? CALENDAR_3_90 : CALENDAR_6_90;
  let base = priceFromBreakpoints(tiers, quantity);
  const g = Number(gsm) || 90;
  if (g === 100) {
    base = Math.round(base * (100 / 90));
  }
  return base;
}

function calcVisitingTablePrice(quantity, side) {
  const dbl = isDoubleSide(side);
  const tiers = dbl ? VISITING_DOUBLE : VISITING_SINGLE;
  return priceFromBreakpoints(tiers, quantity);
}

/**
 * Printing: tariff lookup (notice / calendar / visiting_card).
 * Returns total as printingCharge; paper/die split not used for these products.
 */
function calcPrintingPrice(productSubType, options) {
  const quantity = Math.max(1, Number(options.quantity) || 1000);
  const side = options.side;
  const colour = options.colour;

  let total = 0;

  if (productSubType === 'notice') {
    total = calcNoticeTablePrice(quantity, side, colour);
  } else if (productSubType === 'calendar') {
    const sheets = Number(options.noOfSheets) || 6;
    const gsm = Number(options.gsm) || 90;
    total = calcCalendarTablePrice(quantity, sheets, gsm);
  } else if (productSubType === 'visiting_card') {
    total = calcVisitingTablePrice(quantity, side);
  } else {
    total = calcNoticeTablePrice(quantity, side, colour);
  }

  total = Math.round(total * 100) / 100;

  return {
    paperPrice: 0,
    printingCharge: total,
    dieCutting: 0,
    total,
    quantity
  };
}

/**
 * Unified calculate price from request body.
 * Body: { productLine: "printing"|"packaging", productSubType, quantity, side, colour, ... }
 */
function calculatePrice(body) {
  const {
    productLine,
    productSubType,
    quantity,
    l,
    h,
    w,
    gsm,
    size,
    noOfSheets,
    sizeKey,
    side,
    colour
  } = body;

  if (productLine === 'packaging') {
    if (productSubType === 'paper_bag') {
      return calcPaperBagPrice({ sizeKey: sizeKey || 'medium', quantity: quantity || 1000 });
    }
    return calcPackagingPrice({
      l: l || 10,
      h: h || 10,
      w: w || 10,
      gsm: gsm || 350,
      quantity: quantity || 1000
    });
  }

  if (productLine === 'printing') {
    return calcPrintingPrice(productSubType || 'notice', {
      size,
      gsm,
      quantity: quantity || 1000,
      noOfSheets,
      side,
      colour
    });
  }

  return calcPackagingPrice({
    l: l || 10,
    h: h || 10,
    w: w || 10,
    gsm: gsm || 350,
    quantity: quantity || 1000
  });
}

module.exports = {
  calculatePrice,
  calcPackagingPrice,
  calcPaperBagPrice,
  calcPrintingPrice,
  getRateForGsm,
  priceFromBreakpoints,
  PACKAGING_PAPER_FORMULA_DIVISOR,
  DEFAULT_PRINTING_CHARGE,
  DIE_CUTTING_PER_BOX,
  PAPER_BAG_SIZES
};
