# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Twilio API wrapper service** built with Express.js that provides:
- Template management for email/message templates with placeholder replacement
- Phone number validation (format checking, Twilio Lookup API)
- SMS messaging capabilities
- Voice call functionality
- Phone number search, purchase, and management
- Comprehensive REST API for Twilio operations

## Environment Configuration

Required environment variables in `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token
TWILIO_PHONE_NUMBER=+1234567890
PORT=4000
NODE_ENV=development
```

**Important**: The Twilio client ([src/utils/twilioClient.js](src/utils/twilioClient.js)) initializes conditionally. If credentials are missing, phone-related endpoints will fail gracefully with error messages.

## Commands

### Development
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Install dependencies
npm install
```

### Testing
No test suite currently configured. The `npm test` command will fail with "Error: no test specified".

## Architecture

### Application Structure

```
src/
├── index.js              # Main Express server, template routes
├── controllers/          # Request handlers
│   └── phoneController.js
├── routes/               # Route definitions
│   └── phoneRoutes.js
└── utils/                # Twilio client and helpers
    └── twilioClient.js
```

### Key Design Patterns

1. **Separation of Concerns**:
   - Routes ([src/routes/phoneRoutes.js](src/routes/phoneRoutes.js)) → Define endpoints and HTTP methods
   - Controllers ([src/controllers/phoneController.js](src/controllers/phoneController.js)) → Handle request/response validation and formatting
   - Utils ([src/utils/twilioClient.js](src/utils/twilioClient.js)) → Contain business logic and Twilio API interactions

2. **File-based Storage**:
   - Templates stored in JSON file at `data/templates.json`
   - Auto-created on first run via `ensureStorage()` in [src/index.js](src/index.js)
   - No database required for basic functionality

3. **Error Handling Pattern**:
   All endpoints return consistent structure:
   ```javascript
   // Success
   { success: true, data: {...} }

   // Error
   { success: false, error: "message", details: "error_code" }
   ```

4. **Template System**:
   - Templates support `{{placeholder}}` syntax
   - Supports nested placeholders: `{{user.email}}`
   - Objects/arrays automatically JSON.stringify'd
   - Rendering done by `replacePlaceholders()` function in [src/index.js](src/index.js:109)

### Data Flow

**Phone Operations** (typical flow):
1. Request hits route in [phoneRoutes.js](src/routes/phoneRoutes.js)
2. Controller function extracts/validates request params
3. Controller calls utility function in [twilioClient.js](src/utils/twilioClient.js)
4. Utility function interacts with Twilio SDK
5. Response formatted and returned to controller
6. Controller returns JSON response to client

**Template Operations** (simpler flow):
1. Request hits route in [index.js](src/index.js)
2. Direct file system read/write operations
3. JSON response returned

## Important Implementation Notes

### Twilio Client Initialization
- Client initialized at module load in [twilioClient.js](src/utils/twilioClient.js:14)
- All phone functions check `if (!twilioClient)` and throw descriptive errors
- Health check endpoint (`GET /api/phone/health`) verifies configuration without making API calls

### Template ID Management
- Templates use UUID v4 for IDs (via `uuid` package)
- IDs generated on creation in [index.js](src/index.js:93)
- Update vs Create determined by presence of `id` field in request body

### Phone Number Format
- All phone endpoints expect E.164 format: `+[country][number]`
- Format validation available at `POST /api/phone/validate/format` (free, no Twilio API call)
- Lookup validation at `POST /api/phone/validate/lookup` (costs $0.005 per lookup)

### Batch Operations
- Batch phone validation limited to 10 numbers per request
- Implemented in [phoneController.js](src/controllers/phoneController.js:166)
- Uses `Promise.all` for parallel processing

### Phone Number Purchase
Two purchase methods:
1. **Specific number**: `POST /api/phone/numbers/purchase` - Purchase exact number (must be from search results)
2. **Auto-select by country**: `POST /api/phone/numbers/purchase/country` - Search and auto-purchase first available

## Common Development Tasks

### Adding New Twilio Features
1. Add business logic function to [twilioClient.js](src/utils/twilioClient.js)
2. Create controller function in [phoneController.js](src/controllers/phoneController.js)
3. Add route definition to [phoneRoutes.js](src/routes/phoneRoutes.js)
4. Export controller function from [phoneController.js](src/controllers/phoneController.js)
5. Import in routes file

### Modifying Template System
All template logic is in [index.js](src/index.js):
- Storage functions: `ensureStorage()`, `readTemplates()`, `writeTemplates()`
- Routes: Lines 64-97
- Placeholder replacement: `replacePlaceholders()` function (lines 109-119)

### Adding Middleware
Add in [index.js](src/index.js) before routes:
```javascript
app.use(yourMiddleware());
// Existing routes below...
```

## Subaccount Management

### Overview
Subaccount functionality allows creating isolated Twilio accounts under a master account. Each subaccount has:
- Independent SID and auth token
- Separate resource pool (phone numbers, messages, etc.)
- Individual usage tracking
- Billing rolled up to master account

### Implementation Location
- Business logic: [twilioClient.js](src/utils/twilioClient.js) (functions: `createSubaccount`, `listSubaccounts`, `getSubaccount`, `updateSubaccount`, `closeSubaccount`)
- Controllers: [phoneController.js](src/controllers/phoneController.js) (functions: `createNewSubaccount`, `getAllSubaccounts`, `getSubaccountDetails`, `modifySubaccount`, `deleteSubaccount`)
- Routes: [phoneRoutes.js](src/routes/phoneRoutes.js) - All under `/api/phone/subaccounts`

### Key Endpoints
- `POST /api/phone/subaccounts` - Create new subaccount
- `GET /api/phone/subaccounts` - List all subaccounts
- `GET /api/phone/subaccounts/:subaccountSid` - Get specific subaccount
- `PUT /api/phone/subaccounts/:subaccountSid` - Update subaccount
- `DELETE /api/phone/subaccounts/:subaccountSid` - Close subaccount (permanent)

### Important Implementation Notes

1. **Auth Token Exposure**: The `authToken` is returned ONLY on creation via `createSubaccount()`. It's never accessible again via the API. Ensure clients save it securely.

2. **Subaccount Status Values**:
   - `active` - Fully operational
   - `suspended` - Temporarily disabled (reversible)
   - `closed` - Permanently closed (irreversible)

3. **Closing vs Suspending**:
   - Suspend: Use `updateSubaccount(sid, { status: 'suspended' })` - can reactivate
   - Close: Use `closeSubaccount(sid)` - permanent, releases all resources

4. **Multi-Tenant Pattern**:
   Typical flow for SaaS applications:
   - Create subaccount per customer/tenant
   - Store subaccount credentials in your database (encrypted)
   - Initialize separate Twilio client per tenant using their credentials
   - All Twilio operations isolated per tenant

## API Documentation

Complete API documentation is in [README.md](README.md), including:
- All endpoint definitions with request/response examples
- Twilio pricing information
- Error codes and troubleshooting
- Phone number format requirements
- Webhook configuration
- Subaccount management and multi-tenant architecture examples

## Dependencies

Key dependencies:
- `express` v5.1.0 - Web framework
- `twilio` v5.4.0 - Official Twilio SDK
- `uuid` v11.1.0 - UUID generation for templates
- `dotenv` v16.4.5 - Environment variable management
- `cors` v2.8.5 - CORS middleware (configured for localhost:3000 and localhost:3001)
- `body-parser` v2.2.0 - JSON parsing (5MB limit)
- `nodemon` v3.1.9 (dev) - Auto-restart during development

## CORS Configuration

CORS is configured in [index.js](src/index.js:25) to only allow:
- `http://localhost:3000`
- `http://localhost:3001`

To allow additional origins, modify the `cors()` middleware configuration.

## File Storage Location

Templates are stored at: `./data/templates.json` (relative to project root)

Directory structure:
```
project-root/
├── data/
│   └── templates.json  # Auto-created
└── src/
    └── ...
```
