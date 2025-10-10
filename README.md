# Twillow API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:4000`
**Protocol:** HTTP/HTTPS
**Content-Type:** `application/json`

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Template Management APIs](#template-management-apis)
6. [Phone Validation APIs](#phone-validation-apis)
7. [Messaging APIs](#messaging-apis)
8. [Voice Call APIs](#voice-call-apis)
9. [Phone Number Management APIs](#phone-number-management-apis)
10. [Pricing & Costs](#pricing--costs)
11. [Rate Limits](#rate-limits)
12. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

1. **Node.js** v14 or higher
2. **Twilio Account** with valid credentials
3. **Environment Configuration** (`.env` file)

### Environment Variables

```env
# Required for Twilio features
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Server configuration
PORT=4000
NODE_ENV=development
```

### Starting the Server

```bash
# Development mode (auto-restart on file changes)
npm run dev

# Production mode
npm start
```

---

## Authentication

Currently, the API does not require authentication for HTTP requests. However, Twilio operations require valid credentials configured in the `.env` file.

**Security Recommendation:** In production, implement API key authentication or JWT tokens to protect your endpoints.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "ERROR_CODE"
}
```

---

## Error Codes

| HTTP Status | Meaning | Common Causes |
|-------------|---------|---------------|
| `200` | Success | Request processed successfully |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid parameters or validation failure |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Server-side error or Twilio API failure |

### Common Twilio Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `20003` | Authentication Failed | Check ACCOUNT_SID and AUTH_TOKEN |
| `20404` | Resource Not Found | Verify phone number or SID |
| `21211` | Invalid Phone Number | Use E.164 format (+[country][number]) |
| `21608` | Permission Denied | Verify recipient number (trial accounts) |
| `21614` | Number Not Available | Try different number or country |

---

## Template Management APIs

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /api/health`

**Fields:** None

**Response:**
```json
{
  "ok": true
}
```

**cURL:**
```bash
curl http://localhost:4000/api/health
```

---

### 2. List All Templates

Retrieve all email templates.

**Endpoint:** `GET /api/templates`

**Fields:** None

**Response:**
```json
{
  "templates": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Welcome Email",
      "html": "<h1>Welcome {{firstName}}!</h1>",
      "css": "h1 { color: blue; }",
      "components": {},
      "styles": {},
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:4000/api/templates
```

---

### 3. Get Single Template

Retrieve a specific template by ID.

**Endpoint:** `GET /api/templates/:id`

**Path Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✅ Yes | Unique template identifier |

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Welcome Email",
  "html": "<h1>Welcome {{firstName}}!</h1>",
  "css": "h1 { color: blue; }",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**cURL:**
```bash
curl http://localhost:4000/api/templates/550e8400-e29b-41d4-a716-446655440000
```

---

### 4. Create or Update Template

Create a new template or update an existing one.

**Endpoint:** `POST /api/templates`

**Request Body:**

| Field | Type | Required | Description | Options/Format |
|-------|------|----------|-------------|----------------|
| `id` | string (UUID) | ❌ No | Template ID (for updates) | UUID format. Omit for new templates |
| `name` | string | ❌ No | Template name | Any string. Default: "Untitled" |
| `html` | string | ✅ Yes* | HTML content | Valid HTML. Use `{{key}}` for placeholders |
| `css` | string | ❌ No | CSS styles | Valid CSS without `<style>` tags |
| `components` | object | ✅ Yes* | Component structure | JSON object |
| `styles` | object | ❌ No | Style definitions | JSON object |
| `metadata` | object | ❌ No | Additional metadata | JSON object |

*Either `html` or `components` must be provided.

**Placeholder Syntax:**
- Simple: `{{firstName}}` → replaced with `data.firstName`
- Nested: `{{user.email}}` → replaced with `data.user.email`
- Objects/Arrays: Automatically JSON.stringify'd

**Create Request Example:**
```json
{
  "name": "Welcome Email",
  "html": "<h1>Hello {{firstName}} {{lastName}}!</h1><p>Your email is {{email}}</p>",
  "css": "h1 { color: #007bff; font-size: 24px; }"
}
```

**Update Request Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Welcome Email",
  "html": "<h1>Welcome back {{firstName}}!</h1>"
}
```

**Response (Create - 201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Welcome Email",
  "html": "<h1>Hello {{firstName}} {{lastName}}!</h1><p>Your email is {{email}}</p>",
  "css": "h1 { color: #007bff; font-size: 24px; }",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**cURL (Create):**
```bash
curl -X POST http://localhost:4000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Email",
    "html": "<h1>Hello {{firstName}}!</h1>",
    "css": "h1 { color: blue; }"
  }'
```

**cURL (Update):**
```bash
curl -X POST http://localhost:4000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Name",
    "html": "<h1>Updated content</h1>"
  }'
```

---

### 5. Render Template

Render HTML template with data replacement.

**Endpoint:** `POST /api/render`

**Request Body:**

| Field | Type | Required | Description | Options/Format |
|-------|------|----------|-------------|----------------|
| `html` | string | ✅ Yes | HTML content with placeholders | Valid HTML with `{{key}}` placeholders |
| `css` | string | ❌ No | CSS to inject | Valid CSS (will be wrapped in `<style>` tag) |
| `data` | object | ❌ No | Data for placeholder replacement | JSON object with key-value pairs |

**Request Example:**
```json
{
  "html": "<h1>Hello {{firstName}} {{lastName}}!</h1><p>Email: {{email}}</p>",
  "css": "h1 { color: #333; }",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "html": "<style>h1 { color: #333; }</style><h1>Hello John Doe!</h1><p>Email: john@example.com</p>"
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<h1>Hello {{firstName}}!</h1>",
    "data": {
      "firstName": "John"
    }
  }'
```

---

## Phone Validation APIs

### 6. Twilio Health Check

Verify Twilio integration is properly configured.

**Endpoint:** `GET /api/phone/health`

**Fields:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "hasPhoneNumber": true,
    "accountSid": "AC123456..."
  }
}
```

**Field Descriptions:**
- `configured`: Whether ACCOUNT_SID and AUTH_TOKEN are set
- `hasPhoneNumber`: Whether TWILIO_PHONE_NUMBER is configured
- `accountSid`: First 8 characters of your Account SID (for verification)

**cURL:**
```bash
curl http://localhost:4000/api/phone/health
```

---

### 7. Validate Phone Format

Check if a phone number is in valid E.164 format (client-side validation).

**Endpoint:** `POST /api/phone/validate/format`

**Request Body:**

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `phoneNumber` | string | ✅ Yes | Phone number to validate | E.164 format: `+[country code][number]` |

**E.164 Format Rules:**
- Must start with `+`
- Country code (1-3 digits)
- Subscriber number (up to 12 digits)
- Total max 15 digits (excluding `+`)
- No spaces, dashes, or parentheses

**Valid Examples:**
- ✅ `+12125551234` (US)
- ✅ `+442071234567` (UK)
- ✅ `+919876543210` (India)

**Invalid Examples:**
- ❌ `(212) 555-1234` (formatted)
- ❌ `212-555-1234` (no country code)
- ❌ `12125551234` (missing `+`)

**Request:**
```json
{
  "phoneNumber": "+12125551234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+12125551234",
    "isValidFormat": true
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/validate/format \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+12125551234"}'
```

**Cost:** 💰 **FREE** (no Twilio API call)

---

### 8. Lookup Phone Number

Get detailed information about a phone number using Twilio Lookup API.

**Endpoint:** `POST /api/phone/validate/lookup`

**Request Body:**

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `phoneNumber` | string | ✅ Yes | Phone number to lookup | E.164 format: `+[country code][number]` |

**What This API Does:**
- Validates if the number exists
- Returns national format
- Returns country code
- Verifies number is valid and reachable

**Request:**
```json
{
  "phoneNumber": "+12125551234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+12125551234",
    "nationalFormat": "(212) 555-1234",
    "countryCode": "US",
    "valid": true
  }
}
```

**Field Descriptions:**
- `phoneNumber`: Number in E.164 format
- `nationalFormat`: Number formatted for the country
- `countryCode`: ISO 3166-1 alpha-2 country code
- `valid`: Whether the number is valid and reachable

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/validate/lookup \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+12125551234"}'
```

**Cost:** 💰 **$0.005 per lookup** (Twilio Lookup v2 API)

---

### 9. Lookup Phone with Carrier Info

Get detailed carrier and line type information.

**Endpoint:** `POST /api/phone/validate/carrier`

**Request Body:**

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `phoneNumber` | string | ✅ Yes | Phone number to lookup | E.164 format |

**What This API Returns:**
- All standard lookup data
- Carrier name
- Line type (mobile, landline, VoIP)
- Mobile country code (MCC)
- Mobile network code (MNC)

**Request:**
```json
{
  "phoneNumber": "+12125551234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+12125551234",
    "nationalFormat": "(212) 555-1234",
    "countryCode": "US",
    "valid": true,
    "lineTypeIntelligence": {
      "type": "mobile",
      "carrierName": "Verizon Wireless",
      "mobileCountryCode": "310",
      "mobileNetworkCode": "010"
    }
  }
}
```

**Line Type Options:**
- `mobile`: Mobile phone number
- `landline`: Fixed landline
- `voip`: Voice over IP number
- `unknown`: Type couldn't be determined

**Field Descriptions:**
- `type`: Type of phone line
- `carrierName`: Telecommunications carrier name
- `mobileCountryCode`: MCC for mobile networks
- `mobileNetworkCode`: MNC for mobile networks

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/validate/carrier \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+12125551234"}'
```

**Cost:** 💰 **$0.005 per lookup** (Twilio Lookup v2 API with Line Type Intelligence)

---

### 10. Batch Validate Phone Numbers

Validate multiple phone numbers in a single request.

**Endpoint:** `POST /api/phone/validate/batch`

**Request Body:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `phoneNumbers` | array of strings | ✅ Yes | Array of phone numbers to validate | Max 10 numbers per request |

**Request:**
```json
{
  "phoneNumbers": [
    "+12125551234",
    "+442071234567",
    "+919876543210"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "phoneNumber": "+12125551234",
      "success": true,
      "data": {
        "phoneNumber": "+12125551234",
        "nationalFormat": "(212) 555-1234",
        "countryCode": "US",
        "valid": true
      }
    },
    {
      "phoneNumber": "+442071234567",
      "success": true,
      "data": {
        "phoneNumber": "+442071234567",
        "nationalFormat": "020 7123 4567",
        "countryCode": "GB",
        "valid": true
      }
    },
    {
      "phoneNumber": "+919876543210",
      "success": false,
      "error": "Invalid phone number",
      "details": "21211"
    }
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/validate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": [
      "+12125551234",
      "+442071234567",
      "+919876543210"
    ]
  }'
```

**Cost:** 💰 **$0.005 × number of phone numbers** (max $0.05 for 10 numbers)

---

## Messaging APIs

### 11. Send SMS

Send an SMS message to a phone number.

**Endpoint:** `POST /api/phone/sms/send`

**Request Body:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `to` | string | ✅ Yes | Recipient phone number | E.164 format |
| `message` | string | ✅ Yes | Message body | Max 1600 characters (standard SMS: 160 chars) |

**⚠️ Important Notes:**
- Requires `TWILIO_PHONE_NUMBER` configured in `.env`
- Uses configured number as `from` automatically
- Trial accounts can only send to verified numbers
- Messages over 160 characters are split into multiple SMS (additional cost)

**Request:**
```json
{
  "to": "+12125551234",
  "message": "Hello! This is a test message from Twillow."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "queued",
    "to": "+12125551234",
    "from": "+19876543210",
    "dateCreated": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Options:**
- `queued`: Message queued for sending
- `sending`: Message is being sent
- `sent`: Message sent to carrier
- `delivered`: Message delivered to recipient
- `failed`: Message failed to send
- `undelivered`: Message not delivered

**Field Descriptions:**
- `sid`: Unique message identifier (use for status tracking)
- `status`: Current delivery status
- `to`: Recipient number
- `from`: Your Twilio number
- `dateCreated`: Message creation timestamp

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+12125551234",
    "message": "Hello from Twillow!"
  }'
```

**Cost:** 💰 **$0.0079 per SMS segment** (US)
- 160 characters = 1 segment
- 161-306 characters = 2 segments
- Each additional 153 characters = +1 segment

**International Pricing:**
- UK: $0.0534 per segment
- India: $0.0075 per segment
- Canada: $0.0075 per segment

[Full pricing →](https://www.twilio.com/sms/pricing)

---

### 12. Get SMS Status

Check the delivery status of a sent SMS.

**Endpoint:** `GET /api/phone/sms/status/:messageSid`

**Path Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messageSid` | string | ✅ Yes | Message SID from send response (starts with `SM`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "delivered",
    "to": "+12125551234",
    "from": "+19876543210",
    "body": "Hello from Twillow!",
    "errorCode": null,
    "errorMessage": null
  }
}
```

**Error Response Example:**
```json
{
  "success": true,
  "data": {
    "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "failed",
    "errorCode": "30003",
    "errorMessage": "Unreachable destination handset"
  }
}
```

**Common Error Codes:**
- `30003`: Unreachable destination
- `30004`: Message blocked
- `30005`: Unknown destination handset
- `30006`: Landline or unreachable carrier
- `30007`: Message filtered (spam)

**cURL:**
```bash
curl http://localhost:4000/api/phone/sms/status/SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cost:** 💰 **FREE** (no additional charge)

---

## Voice Call APIs

### 13. Make Phone Call

Initiate an outbound phone call.

**Endpoint:** `POST /api/phone/call/make`

**Request Body:**

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `to` | string | ✅ Yes | Recipient phone number | E.164 format |
| `twimlUrl` | string | ✅ Yes | URL that returns TwiML instructions | Valid HTTP/HTTPS URL |

**What is TwiML?**
TwiML (Twilio Markup Language) is XML that tells Twilio what to do when the call is answered.

**TwiML Example:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! This is a test call from Twillow.</Say>
    <Play>https://example.com/audio.mp3</Play>
    <Hangup/>
</Response>
```

**TwiML Verbs:**
- `<Say>`: Text-to-speech
- `<Play>`: Play audio file
- `<Record>`: Record caller's voice
- `<Gather>`: Collect digits (IVR)
- `<Dial>`: Connect to another number
- `<Hangup>`: End the call

**Request:**
```json
{
  "to": "+12125551234",
  "twimlUrl": "https://your-domain.com/twiml/greeting"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "queued",
    "to": "+12125551234",
    "from": "+19876543210"
  }
}
```

**Call Status Options:**
- `queued`: Call queued
- `ringing`: Phone is ringing
- `in-progress`: Call answered
- `completed`: Call ended normally
- `busy`: Recipient busy
- `no-answer`: No answer
- `failed`: Call failed
- `canceled`: Call canceled

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/call/make \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+12125551234",
    "twimlUrl": "https://your-domain.com/twiml"
  }'
```

**Cost:** 💰 **$0.013 per minute** (US outbound)
- Charged per minute, rounded up
- Minimum 1 minute charge even for shorter calls

**International Pricing:**
- UK: $0.019/min
- India: $0.017/min
- Canada: $0.013/min

[Full pricing →](https://www.twilio.com/voice/pricing)

---

## Phone Number Management APIs

### 14. Search Available Phone Numbers

Search for available phone numbers to purchase.

**Endpoint:** `GET /api/phone/numbers/search`

**Query Parameters:**

| Field | Type | Required | Description | Default | Options |
|-------|------|----------|-------------|---------|---------|
| `countryCode` | string | ❌ No | ISO country code | `US` | `US`, `GB`, `CA`, `AU`, `IN`, etc. |
| `areaCode` | string | ❌ No | Area code filter | - | e.g., `212`, `415`, `020` |
| `contains` | string | ❌ No | Number pattern to match | - | e.g., `555`, `*123` (digits to include) |
| `limit` | integer | ❌ No | Max results to return | `10` | 1-100 |

**Supported Countries:**
🇺🇸 `US` | 🇬🇧 `GB` | 🇨🇦 `CA` | 🇦🇺 `AU` | 🇮🇳 `IN` | 🇩🇪 `DE` | 🇫🇷 `FR` | 🇪🇸 `ES` | 🇮🇹 `IT` | 🇧🇷 `BR` | 🇲🇽 `MX` | 🇯🇵 `JP` | and 60+ more

**Request Examples:**

1. **Basic search (US numbers):**
```bash
GET /api/phone/numbers/search?countryCode=US&limit=5
```

2. **Search with area code (New York):**
```bash
GET /api/phone/numbers/search?countryCode=US&areaCode=212&limit=10
```

3. **Search with pattern (contains 555):**
```bash
GET /api/phone/numbers/search?countryCode=US&contains=555&limit=5
```

4. **Search UK London numbers:**
```bash
GET /api/phone/numbers/search?countryCode=GB&contains=020&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "phoneNumber": "+12125551234",
      "friendlyName": "(212) 555-1234",
      "locality": "New York",
      "region": "NY",
      "capabilities": {
        "voice": true,
        "SMS": true,
        "MMS": true
      }
    },
    {
      "phoneNumber": "+12125555678",
      "friendlyName": "(212) 555-5678",
      "locality": "New York",
      "region": "NY",
      "capabilities": {
        "voice": true,
        "SMS": true,
        "MMS": false
      }
    }
  ]
}
```

**Capabilities Explained:**
- `voice`: Can make/receive phone calls
- `SMS`: Can send/receive text messages
- `MMS`: Can send/receive multimedia messages (images, videos)

**cURL Examples:**

```bash
# Basic search
curl "http://localhost:4000/api/phone/numbers/search?countryCode=US&limit=5"

# With area code
curl "http://localhost:4000/api/phone/numbers/search?countryCode=US&areaCode=212&limit=10"

# With pattern
curl "http://localhost:4000/api/phone/numbers/search?countryCode=US&contains=555"

# UK numbers
curl "http://localhost:4000/api/phone/numbers/search?countryCode=GB&contains=020&limit=5"
```

**Cost:** 💰 **FREE** (no charge for searching)

---

### 15. Purchase Specific Phone Number

Purchase a specific phone number that you found through search.

**Endpoint:** `POST /api/phone/numbers/purchase`

**Request Body:**

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `phoneNumber` | string | ✅ Yes | The phone number to purchase | E.164 format (from search results) |
| `friendlyName` | string | ❌ No | Nickname for the number | Any string (e.g., "Support Line") |
| `smsUrl` | string | ❌ No | Webhook for incoming SMS | Valid HTTP/HTTPS URL |
| `voiceUrl` | string | ❌ No | Webhook for incoming calls | Valid HTTP/HTTPS URL |
| `statusCallback` | string | ❌ No | Webhook for status updates | Valid HTTP/HTTPS URL |

**Webhook URLs Explained:**

**`smsUrl`** - Called when your number receives an SMS:
```
POST https://your-domain.com/sms-webhook
Body: MessageSid, From, To, Body, etc.
```

**`voiceUrl`** - Called when your number receives a call:
```
POST https://your-domain.com/voice-webhook
Must return TwiML instructions
```

**`statusCallback`** - Called for message/call status changes:
```
POST https://your-domain.com/status-webhook
Body: MessageStatus, CallStatus, etc.
```

**Request:**
```json
{
  "phoneNumber": "+12125551234",
  "friendlyName": "Customer Support Line",
  "smsUrl": "https://your-domain.com/webhooks/sms",
  "voiceUrl": "https://your-domain.com/webhooks/voice"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "sid": "PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "phoneNumber": "+12125551234",
    "friendlyName": "Customer Support Line",
    "capabilities": {
      "voice": true,
      "SMS": true,
      "MMS": true
    },
    "dateCreated": "2024-01-01T00:00:00.000Z"
  }
}
```

**Field Descriptions:**
- `sid`: Phone Number SID (use for updates/deletion)
- `phoneNumber`: The purchased number
- `friendlyName`: Your custom nickname
- `capabilities`: What the number can do
- `dateCreated`: Purchase timestamp

**cURL:**
```bash
curl -X POST http://localhost:4000/api/phone/numbers/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+12125551234",
    "friendlyName": "Support Line",
    "smsUrl": "https://your-domain.com/webhooks/sms"
  }'
```

**Cost:** 💰 See [Pricing Section](#pricing--costs)

---

### 16. Purchase Phone Number by Country (Auto-Select)

Automatically purchase the first available number from a country.

**Endpoint:** `POST /api/phone/numbers/purchase/country`

**Request Body:**

| Field | Type | Required | Description | Default | Options |
|-------|------|----------|-------------|---------|---------|
| `countryCode` | string | ❌ No | ISO country code | `US` | `US`, `GB`, `CA`, etc. |
| `areaCode` | string | ❌ No | Filter by area code | - | e.g., `212`, `415` |
| `contains` | string | ❌ No | Number pattern | - | e.g., `555` |
| `friendlyName` | string | ❌ No | Nickname | `[CountryCode] Number` | Any string |
| `smsUrl` | string | ❌ No | SMS webhook URL | - | Valid HTTP/HTTPS URL |
| `voiceUrl` | string | ❌ No | Voice webhook URL | - | Valid HTTP/HTTPS URL |
| `statusCallback` | string | ❌ No | Status webhook URL | - | Valid HTTP/HTTPS URL |
| `searchLimit` | integer | ❌ No | Numbers to search | `5` | 1-20 |
| `selectIndex` | integer | ❌ No | Which result to buy | `0` (first) | 0-(searchLimit-1) |
| `smsEnabled` | boolean | ❌ No | Require SMS capability | `true` | `true`, `false` |
| `voiceEnabled` | boolean | ❌ No | Require voice capability | `true` | `true`, `false` |
| `mmsEnabled` | boolean | ❌ No | Require MMS capability | `false` | `true`, `false` |

**How It Works:**
1. Searches for available numbers with your criteria
2. Automatically selects one (by default, the first result)
3. Purchases it immediately
4. Returns the purchased number details

**Request Examples:**

**1. Simple purchase (US number):**
```json
{
  "countryCode": "US",
  "friendlyName": "My US Number"
}
```

**2. Specific area code (New York):**
```json
{
  "countryCode": "US",
  "areaCode": "212",
  "friendlyName": "NYC Office Line"
}
```

**3. With pattern and webhooks:**
```json
{
  "countryCode": "US",
  "contains": "555",
  "friendlyName": "Support Line",
  "smsUrl": "https://your-domain.com/webhooks/sms",
  "voiceUrl": "https://your-domain.com/webhooks/voice"
}
```

**4. Select 3rd available number:**
```json
{
  "countryCode": "US",
  "searchLimit": 10,
  "selectIndex": 2,
  "friendlyName": "Alternate Number"
}
```

**5. MMS-capable number only:**
```json
{
  "countryCode": "US",
  "mmsEnabled": true,
  "friendlyName": "Marketing MMS Line"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "sid": "PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "phoneNumber": "+12125551234",
    "friendlyName": "My US Number",
    "capabilities": {
      "voice": true,
      "SMS": true,
      "MMS": true
    },
    "dateCreated": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (No Numbers Available):**
```json
{
  "success": false,
  "error": "No available phone numbers found in US"
}
```

**cURL Examples:**

```bash
# Basic US number
curl -X POST http://localhost:4000/api/phone/numbers/purchase/country \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "US",
    "friendlyName": "My Number"
  }'

# UK London number
curl -X POST http://localhost:4000/api/phone/numbers/purchase/country \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "GB",
    "contains": "020",
    "friendlyName": "London Office"
  }'

# With webhooks
curl -X POST http://localhost:4000/api/phone/numbers/purchase/country \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "US",
    "areaCode": "415",
    "friendlyName": "SF Office",
    "smsUrl": "https://myapp.com/sms",
    "voiceUrl": "https://myapp.com/voice"
  }'

# MMS-capable only
curl -X POST http://localhost:4000/api/phone/numbers/purchase/country \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "US",
    "mmsEnabled": true,
    "friendlyName": "MMS Line"
  }'
```

**Cost:** 💰 See [Pricing Section](#pricing--costs)

---

### 17. List Purchased Phone Numbers

Get all phone numbers you currently own.

**Endpoint:** `GET /api/phone/numbers/purchased`

**Query Parameters:**

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `limit` | integer | ❌ No | Max results | `50` |
| `phoneNumber` | string | ❌ No | Filter by number | - |
| `friendlyName` | string | ❌ No | Filter by name | - |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sid": "PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "phoneNumber": "+12125551234",
      "friendlyName": "Customer Support",
      "capabilities": {
        "voice": true,
        "SMS": true,
        "MMS": true
      },
      "dateCreated": "2024-01-01T00:00:00.000Z",
      "status": "in-use"
    },
    {
      "sid": "PN2yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
      "phoneNumber": "+14155559876",
      "friendlyName": "Sales Line",
      "capabilities": {
        "voice": true,
        "SMS": true,
        "MMS": false
      },
      "dateCreated": "2024-01-02T00:00:00.000Z",
      "status": "in-use"
    }
  ]
}
```

**Status Options:**
- `in-use`: Active and operational
- `pending`: Being provisioned
- `disabled`: Temporarily disabled

**cURL Examples:**

```bash
# List all
curl http://localhost:4000/api/phone/numbers/purchased

# With limit
curl "http://localhost:4000/api/phone/numbers/purchased?limit=10"

# Filter by number
curl "http://localhost:4000/api/phone/numbers/purchased?phoneNumber=%2B12125551234"

# Filter by friendly name
curl "http://localhost:4000/api/phone/numbers/purchased?friendlyName=Support"
```

**Cost:** 💰 **FREE** (no charge)

---

### 18. Update Phone Number Configuration

Update webhooks or friendly name for a purchased number.

**Endpoint:** `PUT /api/phone/numbers/:phoneNumberSid`

**Path Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumberSid` | string | ✅ Yes | Phone Number SID (starts with `PN`) |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `friendlyName` | string | ❌ No | New nickname |
| `smsUrl` | string | ❌ No | New SMS webhook URL |
| `voiceUrl` | string | ❌ No | New voice webhook URL |
| `statusCallback` | string | ❌ No | New status webhook URL |

**Request:**
```json
{
  "friendlyName": "Updated Support Line",
  "smsUrl": "https://newdomain.com/webhooks/sms",
  "voiceUrl": "https://newdomain.com/webhooks/voice"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sid": "PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "phoneNumber": "+12125551234",
    "friendlyName": "Updated Support Line",
    "capabilities": {
      "voice": true,
      "SMS": true,
      "MMS": true
    }
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:4000/api/phone/numbers/PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  -H "Content-Type: application/json" \
  -d '{
    "friendlyName": "New Name",
    "smsUrl": "https://newdomain.com/sms"
  }'
```

**Cost:** 💰 **FREE** (no charge)

---

### 19. Release/Delete Phone Number

Release a phone number and stop monthly charges.

**Endpoint:** `DELETE /api/phone/numbers/:phoneNumberSid`

**Path Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumberSid` | string | ✅ Yes | Phone Number SID (starts with `PN`) |

**⚠️ Warning:** This action is **IRREVERSIBLE**. Once released:
- You'll stop being charged monthly
- The number becomes available for others to purchase
- You cannot get the same number back
- All associated webhooks are removed

**Response:**
```json
{
  "success": true,
  "message": "Phone number released successfully",
  "sid": "PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:4000/api/phone/numbers/PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cost:** 💰 **FREE** (stops future monthly charges)

---

## Pricing & Costs

### Phone Number Monthly Costs

| Country | Monthly Cost | Setup Fee |
|---------|--------------|-----------|
| 🇺🇸 United States | $1.00/month | $1.00 one-time |
| 🇨🇦 Canada | $1.00/month | $1.00 one-time |
| 🇬🇧 United Kingdom | $1.50/month | $1.50 one-time |
| 🇦🇺 Australia | $2.00/month | $2.00 one-time |
| 🇩🇪 Germany | $2.00/month | $2.00 one-time |
| 🇫🇷 France | $2.00/month | $2.00 one-time |
| 🇪🇸 Spain | $2.00/month | $2.00 one-time |
| 🇮🇳 India | $2.50/month | $2.50 one-time |
| 🇧🇷 Brazil | $2.00/month | $2.00 one-time |
| 🇲🇽 Mexico | $2.50/month | $2.50 one-time |
| 🇯🇵 Japan | $7.50/month | $7.50 one-time |

**Note:** Toll-free numbers typically cost more ($2-3/month in US).

### SMS Costs (per segment)

| Country | Outbound SMS | Inbound SMS |
|---------|--------------|-------------|
| 🇺🇸 United States | $0.0079 | $0.0079 |
| 🇨🇦 Canada | $0.0075 | $0.0075 |
| 🇬🇧 United Kingdom | $0.0534 | $0.0044 |
| 🇦🇺 Australia | $0.0534 | $0.0113 |
| 🇮🇳 India | $0.0075 | $0.0075 |

**SMS Segments:**
- 1 segment = up to 160 characters
- 2 segments = 161-306 characters
- Each additional 153 characters = +1 segment

**Example:** A 200-character message = 2 segments = $0.0158 (US)

### Voice Call Costs (per minute)

| Country | Outbound | Inbound |
|---------|----------|---------|
| 🇺🇸 United States | $0.013/min | $0.0085/min |
| 🇨🇦 Canada | $0.013/min | $0.0085/min |
| 🇬🇧 United Kingdom | $0.019/min | $0.0094/min |
| 🇦🇺 Australia | $0.025/min | $0.0162/min |
| 🇮🇳 India | $0.017/min | $0.0077/min |

**Note:** Calls are rounded up to the nearest minute.

### Lookup API Costs

| API | Cost per Request |
|-----|------------------|
| Lookup Basic | $0.005 |
| Lookup with Carrier Info | $0.005 |
| Batch Lookup (per number) | $0.005 |

### Free Operations

- ✅ Phone format validation (client-side)
- ✅ Number search
- ✅ List purchased numbers
- ✅ Update number configuration
- ✅ Get SMS/call status
- ✅ Health checks

### Cost Examples

**Scenario 1: Customer Support in US**
- 1 US phone number: $1.00/month
- 1000 SMS sent: $7.90
- 500 minutes of calls: $6.50
- **Total: $15.40/month**

**Scenario 2: International Business**
- 1 US number: $1.00/month
- 1 UK number: $1.50/month
- 1 India number: $2.50/month
- 5000 SMS (mixed): ~$40
- 2000 minutes calls (mixed): ~$30
- **Total: ~$75/month**

**Scenario 3: Verification Service**
- 1 US number: $1.00/month
- 10,000 phone lookups: $50
- 10,000 verification SMS: $79
- **Total: $130/month**

### Billing Notes

- Twilio charges appear on your Twilio account (not this API)
- Charges are billed monthly
- Free trial credits available for new accounts ($15.50 credit)
- No charges from this API server itself
- Check your Twilio console for real-time usage

**View Pricing:** [Twilio Pricing Page](https://www.twilio.com/pricing)

---

## Rate Limits

### Twilio API Rate Limits

| API | Rate Limit | Time Window |
|-----|------------|-------------|
| SMS Send | 1,000 requests | per second |
| Voice Call | 100 concurrent | - |
| Lookup API | 10 requests | per second |
| Number Purchase | 10 requests | per second |

**Note:** Rate limits apply per Twilio account, not per API endpoint.

### Recommended Client-Side Rate Limits

To avoid hitting Twilio limits, implement these on your client:

- **SMS:** Max 100 requests/second
- **Lookups:** Max 5 requests/second
- **Calls:** Max 50 concurrent calls
- **Batch operations:** Max 10 items per request

### Handling Rate Limit Errors

**HTTP 429 Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please retry after 1 second.",
  "details": "20429"
}
```

**Recommended Retry Strategy:**
1. Wait 1-2 seconds
2. Retry with exponential backoff
3. Max 3 retry attempts

---

## Best Practices

### Phone Number Format

✅ **DO:**
```
+12125551234 (E.164 format)
+442071234567
+919876543210
```

❌ **DON'T:**
```
(212) 555-1234 (formatted)
212-555-1234 (dashes)
2125551234 (no country code)
```

### Error Handling

Always check the `success` field:

```javascript
const response = await fetch('/api/phone/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+12125551234',
    message: 'Hello!'
  })
});

const data = await response.json();

if (!data.success) {
  console.error('Error:', data.error);
  // Handle error based on data.details (error code)
  return;
}

// Success - use data.data
console.log('Message SID:', data.data.sid);
```

### Webhook Security

**Validate Twilio Requests:**

```javascript
import twilio from 'twilio';

const authToken = process.env.TWILIO_AUTH_TOKEN;

function validateTwilioRequest(req) {
  const signature = req.headers['x-twilio-signature'];
  const url = `https://your-domain.com${req.url}`;

  return twilio.validateRequest(
    authToken,
    signature,
    url,
    req.body
  );
}
```

**Use HTTPS:**
- Always use HTTPS for webhook URLs
- Twilio requires HTTPS in production

### Cost Optimization

1. **Use format validation first** (free) before lookup API
2. **Batch lookups** when validating multiple numbers
3. **Release unused numbers** to avoid monthly charges
4. **Monitor usage** in Twilio console regularly
5. **Set spending alerts** in Twilio account settings

### SMS Best Practices

1. **Keep messages under 160 characters** to avoid multi-segment charges
2. **Use message status tracking** to handle failures
3. **Implement retry logic** with exponential backoff
4. **Respect opt-out requests** (STOP, UNSUBSCRIBE)
5. **Include opt-out instructions** in marketing messages

### Phone Number Management

1. **Use friendly names** for easy identification
2. **Configure webhooks** at purchase time
3. **Document which app uses which number**
4. **Release numbers** you no longer need
5. **Test webhooks** before going live

### Testing

**Use Twilio Test Credentials:**
```env
# Test mode - no charges, no real SMS/calls
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_test_auth_token
```

**Test Phone Numbers:**
- Twilio provides magic numbers for testing
- No charges for test calls/SMS
- See [Twilio Test Credentials](https://www.twilio.com/docs/iam/test-credentials)

---

## Support & Resources

### Documentation
- 📚 [Twilio Official Docs](https://www.twilio.com/docs)
- 📖 [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- 🔍 [Twilio Lookup API](https://www.twilio.com/docs/lookup)
- 💬 [Twilio SMS API](https://www.twilio.com/docs/sms)
- 📞 [Twilio Voice API](https://www.twilio.com/docs/voice)

### Tools
- 🔧 [Twilio Console](https://console.twilio.com)
- 📊 [Usage Dashboard](https://console.twilio.com/us1/monitor/usage)
- 💰 [Pricing Calculator](https://www.twilio.com/pricing)
- 🧪 [API Explorer](https://www.twilio.com/console/runtime/api-explorer)

### Support
- ❓ [Twilio Support](https://support.twilio.com)
- 💬 [Twilio Community](https://www.twilio.com/community)
- 📧 Email: support@twilio.com
- 🐛 [Report Issues](https://github.com/twilio/twilio-node/issues)

---

## Changelog

### Version 1.0.0 (2024-01-01)
- ✅ Initial release
- ✅ Template management APIs
- ✅ Phone validation (format, lookup, carrier, batch)
- ✅ SMS sending and status tracking
- ✅ Voice call initiation
- ✅ Phone number search and purchase
- ✅ Phone number management (list, update, release)
- ✅ Comprehensive documentation

---

**Built with ❤️ using Twilio and Express**

For questions or issues, please check the [Support Section](#support--resources) or refer to the [Twilio Documentation](https://www.twilio.com/docs).
