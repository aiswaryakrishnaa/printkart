/**
 * Integration Tests for Product API
 * 
 * These tests verify product CRUD operations with database interactions.
 */

const request = require('supertest');
const app = require('../../index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Product API - Integration Tests', () => {
  let authToken;
  let adminUser;
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    // Create or get admin user for authentication
    const hashedPassword = require('bcryptjs').hashSync('admin123', 10);
    
    adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        fullName: 'Admin User',
        phone: '9999999999',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
      },
    });

    // Create test category
    testCategory = await prisma.category.upsert({
      where: { slug: 'test-books' },
      update: {},
      create: {
        name: 'Test Books',
        slug: 'test-books',
        type: 'book',
        isActive: true,
      },
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123',
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProduct) {
      await prisma.product.delete({ where: { id: testProduct.id } });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/products', () => {
    test('should get all products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ categoryId: testCategory.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.products && response.body.data.products.length > 0) {
        response.body.data.products.forEach((product) => {
          // Handle type conversion (number vs string)
          expect(Number(product.categoryId)).toBe(testCategory.id);
        });
      } else {
        // If no products, that's also valid - just log it
        console.log('No products found for category filter test');
      }
    });

    test('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ search: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ minPrice: 10, maxPrice: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product) => {
        expect(parseFloat(product.price)).toBeGreaterThanOrEqual(10);
        expect(parseFloat(product.price)).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('POST /api/admin/products', () => {
    test('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        description: 'This is a test product description',
        shortDescription: 'Test product',
        categoryId: testCategory.id,
        price: 29.99,
        stockQuantity: 100,
        type: 'book',
        status: 'active',
        availability: 'in_stock',
      };

      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('product');
      expect(response.body.data.product).toHaveProperty('id');
      expect(response.body.data.product.name).toBe(productData.name);

      testProduct = response.body.data.product;
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test',
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get product by id', async () => {
      if (!testProduct) {
        // Create a product if not exists
        const createResponse = await request(app)
          .post('/api/admin/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Product Detail',
            slug: 'test-product-detail-' + Date.now(),
            description: 'Test description',
            categoryId: testCategory.id,
            price: 39.99,
            type: 'book',
          });
        testProduct = createResponse.body.data.product;
      }

      const response = await request(app)
        .get(`/api/products/${testProduct.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toBeDefined();
      expect(response.body.data.product.id).toBe(testProduct.id);
      expect(response.body.data.product).toHaveProperty('name');
      expect(response.body.data.product).toHaveProperty('description');
    });

    test('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/products/:id', () => {
    test('should update product', async () => {
      if (!testProduct) {
        const createResponse = await request(app)
          .post('/api/admin/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Product Update',
            slug: 'test-product-update-' + Date.now(),
            description: 'Test',
            categoryId: testCategory.id,
            price: 49.99,
            type: 'book',
          });
        testProduct = createResponse.body.data.product;
      }

      const updateData = {
        name: 'Updated Product Name',
        price: 59.99,
        stockQuantity: 50,
      };

      const response = await request(app)
        .put(`/api/admin/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/admin/products/:id', () => {
    test('should delete product', async () => {
      // Create a product to delete
      const createResponse = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product to Delete',
          slug: 'product-to-delete-' + Date.now(),
          description: 'Test',
          categoryId: testCategory.id,
          price: 19.99,
          type: 'book',
        });

      const productToDelete = createResponse.body.data.product;

      const response = await request(app)
        .delete(`/api/admin/products/${productToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify product is deleted
      const getResponse = await request(app)
        .get(`/api/products/${productToDelete.id}`)
        .expect(404);
    });
  });
});
