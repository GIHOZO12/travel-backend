import swaggerJsdoc from 'swagger-jsdoc';

// This spec is built by SCANNING your route files for `@openapi` YAML
// comment blocks (see the `apis` glob below) — it is not written by hand.
// Add/update documentation by editing the comment above the relevant
// `router.get/post/put/delete(...)` line, not this file.
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel & Tour Company Website API',
      version: '1.0.0',
      description:
        'Backend API for the Travel & Tour Company Website, built against the project SRS.',
    },
    servers: [{ url: '/api', description: 'Current server' }],
    tags: [
      { name: 'Auth', description: 'Admin login and account management' },
      { name: 'Destinations', description: 'Public destination content' },
      { name: 'Tours', description: 'Public tour packages and itineraries' },
      { name: 'Inquiries', description: 'Public "expression of interest" leads' },
      { name: 'Booking Requests', description: 'Public booking requests for a specific tour' },
      { name: 'FAQs', description: 'Frequently asked questions' },
      { name: 'Testimonials', description: 'Customer testimonials, admin-curated and approved' },
      { name: 'Blog', description: 'Travel blog / articles' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      // Reusable pieces referenced from route comments via $ref — define
      // a shape once here, reference it everywhere instead of retyping it.
      schemas: {
        AdminPublic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Admin' },
            email: { type: 'string', format: 'email', example: 'admin@travel-tour.local' },
            role: { type: 'string', example: 'admin' },
          },
        },
        ApiErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong.' },
          },
        },
      },
    },
  },
  // Points at TypeScript source files directly — swagger-jsdoc reads them
  // as plain text for comments, it doesn't compile/execute them. If this
  // API is ever deployed as a compiled-only dist/ build without the src/
  // folder alongside it, this glob (or the docs route itself) would need
  // to be disabled or pointed at dist/**/*.routes.js instead.
  apis: ['./src/routes/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
