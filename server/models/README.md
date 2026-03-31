# Models Directory

⚠️ **Note:** This directory contains Sequelize models that are no longer used.

The project now uses **Prisma ORM** for database operations.

All models are defined in: `prisma/schema.prisma`

To use Prisma in your code:
```javascript
const prisma = require('../config/prisma');

// Example
const user = await prisma.user.findUnique({
  where: { id: 1 }
});
```

**These Sequelize model files can be deleted** or kept for reference only.

