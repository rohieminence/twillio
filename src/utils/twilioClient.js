import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

// Initialize Twilio client only if credentials are available
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

/**
 * Validate if phone number is in valid format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhoneFormat(phoneNumber) {
  if (!phoneNumber) return false;
  // Basic validation: E.164 format check (+1234567890)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s()-]/g, ''));
}

/**
 * Lookup and validate phone number using Twilio Lookup API
 * @param {string} phoneNumber - Phone number to lookup
 * @returns {Promise<Object>} Lookup result with carrier and format info
 */
export async function lookupPhoneNumber(phoneNumber) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const result = await twilioClient.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch();

    return {
      success: true,
      data: {
        phoneNumber: result.phoneNumber,
        nationalFormat: result.nationalFormat,
        countryCode: result.countryCode,
        valid: result.valid,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to lookup phone number',
      details: error.code,
    };
  }
}

/**
 * Lookup phone number with carrier information
 * @param {string} phoneNumber - Phone number to lookup
 * @returns {Promise<Object>} Lookup result with carrier details
 */
export async function lookupPhoneWithCarrier(phoneNumber) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const result = await twilioClient.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: 'line_type_intelligence' });

    return {
      success: true,
      data: {
        phoneNumber: result.phoneNumber,
        nationalFormat: result.nationalFormat,
        countryCode: result.countryCode,
        valid: result.valid,
        lineTypeIntelligence: result.lineTypeIntelligence,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to lookup phone number with carrier info',
      details: error.code,
    };
  }
}

/**
 * Send SMS message
 * @param {string} to - Recipient phone number
 * @param {string} body - Message body
 * @returns {Promise<Object>} Message result
 */
export async function sendSMS(to, body) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    if (!twilioPhoneNumber) {
      throw new Error('Twilio phone number is not configured.');
    }

    const message = await twilioClient.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });

    return {
      success: true,
      data: {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateCreated: message.dateCreated,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
      details: error.code,
    };
  }
}

/**
 * Get message status
 * @param {string} messageSid - Message SID to check
 * @returns {Promise<Object>} Message status
 */
export async function getMessageStatus(messageSid) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const message = await twilioClient.messages(messageSid).fetch();

    return {
      success: true,
      data: {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get message status',
      details: error.code,
    };
  }
}

/**
 * Make a phone call
 * @param {string} to - Recipient phone number
 * @param {string} url - TwiML URL for call instructions
 * @returns {Promise<Object>} Call result
 */
export async function makeCall(to, url) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    if (!twilioPhoneNumber) {
      throw new Error('Twilio phone number is not configured.');
    }

    const call = await twilioClient.calls.create({
      url,
      to,
      from: twilioPhoneNumber,
    });

    return {
      success: true,
      data: {
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to make call',
      details: error.code,
    };
  }
}

/**
 * Get available phone numbers
 * @param {string} countryCode - Country code (e.g., 'US')
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Available phone numbers
 */
export async function getAvailablePhoneNumbers(countryCode = 'US', options = {}) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const numbers = await twilioClient.availablePhoneNumbers(countryCode)
      .local
      .list({
        limit: options.limit || 10,
        areaCode: options.areaCode,
        contains: options.contains,
      });

    return {
      success: true,
      data: numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        capabilities: num.capabilities,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get available phone numbers',
      details: error.code,
    };
  }
}

/**
 * Validate multiple phone numbers in batch
 * @param {Array<string>} phoneNumbers - Array of phone numbers
 * @returns {Promise<Object>} Validation results
 */
export async function validatePhoneNumbers(phoneNumbers) {
  try {
    if (!Array.isArray(phoneNumbers)) {
      throw new Error('Phone numbers must be an array');
    }

    const results = await Promise.all(
      phoneNumbers.map(async (phone) => {
        const result = await lookupPhoneNumber(phone);
        return {
          phoneNumber: phone,
          ...result,
        };
      })
    );

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to validate phone numbers',
    };
  }
}

/**
 * Purchase a specific phone number
 * @param {string} phoneNumber - Phone number to purchase
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Purchase result
 */
export async function purchasePhoneNumber(phoneNumber, options = {}) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const incomingNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: options.friendlyName || phoneNumber,
      smsUrl: options.smsUrl,
      voiceUrl: options.voiceUrl,
      statusCallback: options.statusCallback,
    });

    return {
      success: true,
      data: {
        sid: incomingNumber.sid,
        phoneNumber: incomingNumber.phoneNumber,
        friendlyName: incomingNumber.friendlyName,
        capabilities: incomingNumber.capabilities,
        dateCreated: incomingNumber.dateCreated,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to purchase phone number',
      details: error.code,
    };
  }
}

/**
 * Purchase phone number from specific country with auto-selection
 * @param {string} countryCode - Country code (e.g., 'US', 'GB', 'IN')
 * @param {Object} options - Search and purchase options
 * @returns {Promise<Object>} Purchase result
 */
export async function purchasePhoneNumberByCountry(countryCode = 'US', options = {}) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    // First, search for available numbers
    const numbers = await twilioClient.availablePhoneNumbers(countryCode)
      .local
      .list({
        limit: options.searchLimit || 5,
        areaCode: options.areaCode,
        contains: options.contains,
        smsEnabled: options.smsEnabled !== false,
        voiceEnabled: options.voiceEnabled !== false,
        mmsEnabled: options.mmsEnabled,
      });

    if (!numbers || numbers.length === 0) {
      return {
        success: false,
        error: `No available phone numbers found in ${countryCode}`,
      };
    }

    // Purchase the first available number (or by index if specified)
    const selectedIndex = options.selectIndex || 0;
    const selectedNumber = numbers[selectedIndex];

    if (!selectedNumber) {
      return {
        success: false,
        error: `No phone number found at index ${selectedIndex}`,
      };
    }

    // Purchase the selected number
    const purchaseResult = await purchasePhoneNumber(selectedNumber.phoneNumber, {
      friendlyName: options.friendlyName || `${countryCode} Number`,
      smsUrl: options.smsUrl,
      voiceUrl: options.voiceUrl,
      statusCallback: options.statusCallback,
    });

    return purchaseResult;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to purchase phone number by country',
      details: error.code,
    };
  }
}

/**
 * Get list of purchased phone numbers
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} List of purchased numbers
 */
export async function getPurchasedPhoneNumbers(options = {}) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const numbers = await twilioClient.incomingPhoneNumbers.list({
      limit: options.limit || 50,
      phoneNumber: options.phoneNumber,
      friendlyName: options.friendlyName,
    });

    return {
      success: true,
      data: numbers.map(num => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        capabilities: num.capabilities,
        dateCreated: num.dateCreated,
        status: num.status,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get purchased phone numbers',
      details: error.code,
    };
  }
}

/**
 * Release/delete a purchased phone number
 * @param {string} phoneNumberSid - SID of the phone number to release
 * @returns {Promise<Object>} Release result
 */
export async function releasePhoneNumber(phoneNumberSid) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    await twilioClient.incomingPhoneNumbers(phoneNumberSid).remove();

    return {
      success: true,
      message: 'Phone number released successfully',
      sid: phoneNumberSid,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to release phone number',
      details: error.code,
    };
  }
}

/**
 * Update a purchased phone number configuration
 * @param {string} phoneNumberSid - SID of the phone number to update
 * @param {Object} updates - Configuration updates
 * @returns {Promise<Object>} Update result
 */
export async function updatePhoneNumber(phoneNumberSid, updates) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Please check your credentials.');
    }

    const updatedNumber = await twilioClient.incomingPhoneNumbers(phoneNumberSid).update({
      friendlyName: updates.friendlyName,
      smsUrl: updates.smsUrl,
      voiceUrl: updates.voiceUrl,
      statusCallback: updates.statusCallback,
    });

    return {
      success: true,
      data: {
        sid: updatedNumber.sid,
        phoneNumber: updatedNumber.phoneNumber,
        friendlyName: updatedNumber.friendlyName,
        capabilities: updatedNumber.capabilities,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update phone number',
      details: error.code,
    };
  }
}

export default twilioClient;

