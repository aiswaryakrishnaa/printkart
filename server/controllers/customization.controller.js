const prisma = require('../config/prisma');
const { calculatePrice } = require('../services/priceCalculator');

/** POST /api/customizations/calculate-price - returns paperPrice, printingCharge, dieCutting, total */
exports.calculatePrice = async (req, res, next) => {
    try {
        const result = calculatePrice(req.body);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.createCustomization = async (req, res, next) => {
    try {
        const {
            productType,
            productLine,
            requirements,
            configOptions,
            quantity,
            amount,
            paperPrice,
            printingCharge,
            dieCutting,
            dummyPaymentSucceeded
        } = req.body;
        const userId = req.user.id;

        let fileUrl = null;
        let fileName = null;

        if (req.file) {
            fileUrl = req.file.path && req.file.path.startsWith('http')
                ? req.file.path
                : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            fileName = req.file.originalname;
        }

        const payOk =
            String(dummyPaymentSucceeded || '').toLowerCase() === 'true' ||
            String(dummyPaymentSucceeded || '') === '1';

        const data = {
            userId,
            productType: productType || 'custom',
            requirements: requirements || '',
            fileUrl,
            fileName,
            status: 'pending',
            paymentStatus: payOk ? 'paid' : 'pending',
            paymentReference: payOk ? `DUMMY-${Date.now()}` : null
        };

        if (productLine != null) data.productLine = productLine;
        if (configOptions != null) {
            try {
                data.configOptions = typeof configOptions === 'string' ? JSON.parse(configOptions) : configOptions;
            } catch (_) {
                data.configOptions = { raw: configOptions };
            }
        }
        if (quantity != null) data.quantity = parseInt(quantity, 10);
        if (amount != null) data.amount = parseFloat(amount);
        if (paperPrice != null) data.paperPrice = parseFloat(paperPrice);
        if (printingCharge != null) data.printingCharge = parseFloat(printingCharge);
        if (dieCutting != null) data.dieCutting = parseFloat(dieCutting);

        const customization = await prisma.customization.create({
            data
        });

        res.status(201).json({
            success: true,
            message: 'Customization request submitted successfully',
            data: customization
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyCustomizations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const customizations = await prisma.customization.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: customizations
        });
    } catch (error) {
        next(error);
    }
};

exports.getCustomization = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const customization = await prisma.customization.findFirst({
            where: {
                id: parseInt(id),
                userId // Ensure user can only see their own
            }
        });

        if (!customization) {
            return res.status(404).json({
                success: false,
                message: 'Customization request not found'
            });
        }

        res.json({
            success: true,
            data: customization
        });
    } catch (error) {
        next(error);
    }
};
