const serverUrl = process.env.API_GATEWAY_URL || `http://localhost:${process.env.PORT || 4000}`;

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Financial AI Platform API',
    version: '0.2.0',
    description: 'API Gateway contract for authentication, user management, API keys, and market data.'
  },
  servers: [{ url: serverUrl }],
  tags: [
    { name: 'Auth', description: 'Authentication and token lifecycle' },
    { name: 'Users', description: 'Profiles, settings, passwords, avatars, and API keys' },
    { name: 'Market', description: 'Protected market quote endpoints' }
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
