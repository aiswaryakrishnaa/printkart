/**
 * Price calculation for printing & packaging products.
 * Formulas from requirements:
 * - Size = L x H x W + 1.5
 * - Paper Price = (Size x GSM x Rate) / 1 Crore x No. of box
 * - Die Cutting = 1 x no. of boxes
 * - Price of Product = Paper Price + Printing charge + Die Cutting
 * 1 Crore = 10,000,000
 */
const ONE_CR = 10_000_000;
const DEFAULT_PRINTING_CHARGE = 4600;
const DIE_CUTTING_PER_BOX = 1;

// GSM to Rate mapping (e.g. 350 -> 65, 400 -> 55)
const GSM_RATE_MAP = { 350: 65, 400: 55, 90: 45, 100: 50 };

/**
 * Get rate for a given GSM (packaging: 350->65, 400->55; printing may use different)
 */
function getRateForGsm(gsm) {
  const g = Number(gsm);
  return GSM_RATE_MAP[g] ?? (g >= 350 ? 65 : 55);
}

/**
 * Calculate size for packaging: Size = L x H x W + 1.5
 */
function calcSize(l, h, w) {
  const L = Number(l) || 0;
  const H = Number(h) || 0;
  const W = Number(w) || 0;
  return L * H * W + 1.5;
}

/**
 * Packaging price calculation.
 * @param {Object} options - { l, h, w, gsm, rate (optional), quantity }
 */
function calcPackagingPrice(options) {
  const { l, h, w, gsm, rate: rateInput, quantity } = options;
  const numQty = Math.max(1, Number(quantity) || 1);
  const gsmNum = Number(gsm) || 350;
  const rate = rateInput != null ? Number(rateInput) : getRateForGsm(gsmNum);

  const size = calcSize(l, h, w);
  const paperPrice = (size * gsmNum * rate / ONE_CR) * numQty;
  const dieCutting = DIE_CUTTING_PER_BOX * numQty;
  const printingCharge = DEFAULT_PRINTING_CHARGE;
  const total = paperPrice + printingCharge + dieCutting;

  return {
    size: Math.round(size * 1000) / 1000,
    paperPrice: Math.round(paperPrice * 100) / 100,
    printingCharge,
    dieCutting,
    total: Math.round(total * 100) / 100,
    quantity: numQty
  };
}

/**
 * Paper bag uses predefined sizes (Small, Medium, Large) and similar formula.
 * Small = 8x9.5x2.5, Medium = 10x13x13, Large = 12x16x4
 */
const PAPER_BAG_SIZES = {
  small: { l: 8, h: 9.5, w: 2.5 },
  medium: { l: 10, h: 13, w: 13 },
  large: { l: 12, h: 16, w: 4 }
};

function calcPaperBagPrice(options) {
  const { sizeKey, gsm, quantity } = options;
  const dims = PAPER_BAG_SIZES[sizeKey] || PAPER_BAG_SIZES.medium;
  return calcPackagingPrice({
    l: dims.l,
    h: dims.h,
    w: dims.w,
    gsm: gsm || 350,
    quantity: quantity || 1000
  });
}

/**
 * Printing products (Notice, Calendar, Visiting card) - use sheet area and quantity.
 * Notice: A4 = 0.0625 m², A5 = 0.03125 m² (approx). We use size factor: A4=1, A5=0.5.
 * Simplified: Paper Price = (sheetArea * GSM * rate / 1Cr) * quantity, plus printing charge.
 */
const SHEET_SIZE_FACTOR = { A4: 1, A5: 0.5 };
const NOTICE_GSM_RATE = { 350: 65, 400: 55 };
const CALENDAR_GSM_RATE = { 90: 45, 100: 50 };

function calcPrintingPrice(productSubType, options) {
  const quantity = Math.max(1, Number(options.quantity) || 1000);
  let paperPrice = 0;
  const printingCharge = DEFAULT_PRINTING_CHARGE;
  const dieCutting = 0; // or per-sheet if needed

  if (productSubType === 'notice') {
    const sizeFactor = SHEET_SIZE_FACTOR[options.size] || 1;
    const gsm = Number(options.gsm) || 350;
    const rate = NOTICE_GSM_RATE[gsm] || 65;
    const sheetArea = 0.0625 * sizeFactor; // m²
    paperPrice = (sheetArea * gsm * rate / ONE_CR) * quantity;
  } else if (productSubType === 'calendar') {
    const sheets = Number(options.noOfSheets) || 6;
    const gsm = Number(options.gsm) || 100;
    const rate = CALENDAR_GSM_RATE[gsm] || 50;
    const sheetArea = 0.0625 * sheets;
    paperPrice = (sheetArea * gsm * rate / ONE_CR) * quantity;
  } else if (productSubType === 'visiting_card') {
    const gsm = Number(options.gsm) || 350;
    const rate = NOTICE_GSM_RATE[gsm] || 65;
    const sheetArea = 0.0625 * 0.25; // card size approx
    paperPrice = (sheetArea * gsm * rate / ONE_CR) * quantity;
  }

  const total = paperPrice + printingCharge + dieCutting;
  return {
    paperPrice: Math.round(paperPrice * 100) / 100,
    printingCharge,
    dieCutting,
    total: Math.round(total * 100) / 100,
    quantity
  };
}

/**
 * Unified calculate price from request body.
 * Body: { productLine: "printing"|"packaging", productSubType: string, ...options }
 */
function calculatePrice(body) {
  const { productLine, productSubType, quantity, l, h, w, gsm, rate, size, noOfSheets, sizeKey } = body;

  if (productLine === 'packaging') {
    if (productSubType === 'paper_bag') {
      return calcPaperBagPrice({ sizeKey: sizeKey || 'medium', gsm: gsm || 350, quantity: quantity || 1000 });
    }
    return calcPackagingPrice({
      l: l || 10,
      h: h || 10,
      w: w || 10,
      gsm: gsm || 350,
      rate,
      quantity: quantity || 1
    });
  }

  if (productLine === 'printing') {
    return calcPrintingPrice(productSubType || 'notice', {
      size,
      gsm,
      quantity: quantity || 1000,
      noOfSheets
    });
  }

  // Default: packaging with l,h,w
  return calcPackagingPrice({
    l: l || 10,
    h: h || 10,
    w: w || 10,
    gsm: gsm || 350,
    quantity: quantity || 1
  });
}

module.exports = {
  calculatePrice,
  calcPackagingPrice,
  calcPaperBagPrice,
  calcPrintingPrice,
  getRateForGsm,
  ONE_CR,
  DEFAULT_PRINTING_CHARGE,
  DIE_CUTTING_PER_BOX,
  PAPER_BAG_SIZES
};
