const serverUrl = process.env.API_GATEWAY_URL || `http://localhost:${process.env.PORT || 4000}`;

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Financial AI Platform API',
    version: '0.3.0',
    description: 'API Gateway contract for authentication, user management, market data, document management, and retrieval analysis.'
  },
  servers: [{ url: serverUrl }],
  tags: [
    { name: 'Auth', description: 'Authentication and token lifecycle' },
    { name: 'Users', description: 'Profiles, settings, passwords, avatars, and API keys' },
    { name: 'Market', description: 'Protected market search, quotes, history, and export endpoints' },
    { name: 'Documents', description: 'Protected document upload, metadata, and search endpoints' },
    { name: 'Analysis', description: 'Protected retrieval analysis and history endpoints' }
  ],
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        responses: {
          201: { description: 'User created with access and refresh tokens' },
          409: { description: 'Email or username already exists' },
          422: { description: 'Invalid email or weak password' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        responses: {
          200: { description: 'Authenticated with access and refresh tokens' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Exchange a refresh token for a new access token',
        responses: {
          200: { description: 'New access token issued' },
          401: { description: 'Invalid refresh token' }
        }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
          401: { description: 'Missing or invalid access token' }
        }
      }
    },
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft delete current account',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Account marked deleted and API keys revoked' }
        }
      }
    },
    '/api/v1/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get current profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user profile' } }
      },
      put: {
        tags: ['Users'],
        summary: 'Update profile fields',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Updated profile' } }
      }
    },
    '/api/v1/users/settings': {
      get: {
        tags: ['Users'],
        summary: 'Get current user settings',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current settings' } }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user settings',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Updated settings' } }
      }
    },
    '/api/v1/users/api-keys': {
      get: {
        tags: ['Users'],
        summary: 'List API keys',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'API key summaries without secrets' } }
      },
      post: {
        tags: ['Users'],
        summary: 'Create an API key',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'API key secret returned once' } }
      }
    },
    '/api/v1/market/quote/{symbol}': {
      get: {
        tags: ['Market'],
        summary: 'Get a protected market quote',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'symbol', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Quote data with cache metadata' } }
      }
    },
    '/api/v1/market/search': {
      get: {
        tags: ['Market'],
        summary: 'Search supported stock, crypto, and forex instruments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'type', in: 'query', required: false, schema: { type: 'string', enum: ['stock', 'crypto', 'forex'] } }
        ],
        responses: { 200: { description: 'Matching market instruments' } }
      }
    },
    '/api/v1/market/summary': {
      get: {
        tags: ['Market'],
        summary: 'Get quotes for a comma-separated symbol list',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'symbols', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Quote summaries' } }
      }
    },
    '/api/v1/market/history/{symbol}': {
      get: {
        tags: ['Market'],
        summary: 'Get mock historical close data for charting',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'symbol', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'range', in: 'query', required: false, schema: { type: 'string', enum: ['7d', '30d', '90d'] } }
        ],
        responses: { 200: { description: 'Historical price points' } }
      }
    },
    '/api/v1/market/export': {
      get: {
        tags: ['Market'],
        summary: 'Export quote summaries as JSON or CSV',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'symbols', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'csv'] } }
        ],
        responses: { 200: { description: 'Market export payload' } }
      }
    },
    '/api/v1/documents': {
      get: {
        tags: ['Documents'],
        summary: 'List uploaded documents for the current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['pending', 'processing', 'completed', 'error'] } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'offset', in: 'query', required: false, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Paginated document metadata' } }
      }
    },
    '/api/v1/documents/upload': {
      post: {
        tags: ['Documents'],
        summary: 'Upload one or more documents',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  documents: { type: 'array', items: { type: 'string', format: 'binary' } },
                  description: { type: 'string' },
                  tags: { type: 'string', description: 'Comma-separated tags' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Document metadata created' },
          422: { description: 'Unsupported document type or oversized upload' }
        }
      }
    },
    '/api/v1/documents/search': {
      post: {
        tags: ['Documents'],
        summary: 'Search uploaded documents by filename, tags, or extracted text',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Matching document metadata' } }
      }
    },
    '/api/v1/documents/{documentId}': {
      get: {
        tags: ['Documents'],
        summary: 'Get document details and extracted text',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'documentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Document detail' }, 404: { description: 'Document not found' } }
      },
      put: {
        tags: ['Documents'],
        summary: 'Update document metadata',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'documentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Document metadata updated' } }
      },
      delete: {
        tags: ['Documents'],
        summary: 'Soft delete a document',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'documentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Document deleted' } }
      }
    },
    '/api/v1/analysis/query': {
      post: {
        tags: ['Analysis'],
        summary: 'Run retrieval analysis over uploaded documents',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Analysis generated and saved' },
          400: { description: 'Missing analysis query' }
        }
      }
    },
    '/api/v1/analysis/history': {
      get: {
        tags: ['Analysis'],
        summary: 'List prior analysis runs',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Analysis history' } }
      }
    },
    '/api/v1/analysis/{analysisId}': {
      get: {
        tags: ['Analysis'],
        summary: 'Get an analysis result',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'analysisId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Analysis detail' }, 404: { description: 'Analysis not found' } }
      },
      delete: {
        tags: ['Analysis'],
        summary: 'Delete an analysis result',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'analysisId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Analysis deleted' } }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

export const getOpenApiSpec = (req, res) => {
  res.json(openApiSpec);
};

export const getDocsPage = (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Financial AI Platform API</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 40px; color: #17211b; }
      code, pre { background: #edf2ee; border-radius: 6px; padding: 4px 6px; }
      section { max-width: 900px; }
      a { color: #166a55; }
    </style>
  </head>
  <body>
    <section>
      <h1>Financial AI Platform API</h1>
      <p>OpenAPI JSON is available at <a href="/api/v1/docs/openapi.json">/api/v1/docs/openapi.json</a>.</p>
      <pre>curl ${serverUrl}/api/v1/docs/openapi.json</pre>
    </section>
  </body>
</html>`);
};
