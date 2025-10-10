import {
  isValidPhoneFormat,
  lookupPhoneNumber,
  lookupPhoneWithCarrier,
  sendSMS,
  getMessageStatus,
  makeCall,
  getAvailablePhoneNumbers,
  validatePhoneNumbers,
  purchasePhoneNumber,
  purchasePhoneNumberByCountry,
  getPurchasedPhoneNumbers,
  releasePhoneNumber,
  updatePhoneNumber,
  createSubaccount,
  listSubaccounts,
  getSubaccount,
  updateSubaccount,
  closeSubaccount,
} from '../utils/twilioClient.js';

/**
 * Validate phone number format
 */
export async function validatePhoneFormat(req, res) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const isValid = isValidPhoneFormat(phoneNumber);

    return res.json({
      success: true,
      data: {
        phoneNumber,
        isValidFormat: isValid,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Lookup phone number details
 */
export async function lookupPhone(req, res) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const result = await lookupPhoneNumber(phoneNumber);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Lookup phone number with carrier information
 */
export async function lookupPhoneCarrier(req, res) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const result = await lookupPhoneWithCarrier(phoneNumber);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}



/**
 * Make a phone call
 */
export async function initiateCall(req, res) {
  try {
    const { to, twimlUrl } = req.body;

    if (!to || !twimlUrl) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number and TwiML URL are required',
      });
    }

    const result = await makeCall(to, twimlUrl);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Search available phone numbers
 */
export async function searchPhoneNumbers(req, res) {
  try {
    const { countryCode = 'US', areaCode, contains, limit = 10 } = req.query;

    const result = await getAvailablePhoneNumbers(countryCode, {
      areaCode,
      contains,
      limit: parseInt(limit),
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Batch validate phone numbers
 */
export async function batchValidatePhones(req, res) {
  try {
    const { phoneNumbers } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        error: 'Phone numbers array is required',
      });
    }

    if (phoneNumbers.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 phone numbers allowed per batch',
      });
    }

    const result = await validatePhoneNumbers(phoneNumbers);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Health check for Twilio integration
 */
export async function twilioHealthCheck(req, res) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const isConfigured = !!(accountSid && authToken);

    return res.json({
      success: true,
      data: {
        configured: isConfigured,
        hasPhoneNumber: !!twilioPhoneNumber,
        accountSid: accountSid ? `${accountSid.substring(0, 8)}...` : 'Not set',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Purchase a specific phone number
 */
export async function buyPhoneNumber(req, res) {
  try {
    const { phoneNumber, friendlyName, smsUrl, voiceUrl, statusCallback } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const result = await purchasePhoneNumber(phoneNumber, {
      friendlyName,
      smsUrl,
      voiceUrl,
      statusCallback,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Purchase phone number from specific country
 */
export async function buyPhoneNumberByCountry(req, res) {
  try {
    const {
      countryCode = 'US',
      areaCode,
      contains,
      friendlyName,
      smsUrl,
      voiceUrl,
      statusCallback,
      searchLimit,
      selectIndex,
      smsEnabled,
      voiceEnabled,
      mmsEnabled,
    } = req.body;

    const result = await purchasePhoneNumberByCountry(countryCode, {
      areaCode,
      contains,
      friendlyName,
      smsUrl,
      voiceUrl,
      statusCallback,
      searchLimit,
      selectIndex,
      smsEnabled,
      voiceEnabled,
      mmsEnabled,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Get list of purchased phone numbers
 */
export async function listPurchasedNumbers(req, res) {
  try {
    const { limit, phoneNumber, friendlyName } = req.query;

    const result = await getPurchasedPhoneNumbers({
      limit: limit ? parseInt(limit) : undefined,
      phoneNumber,
      friendlyName,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Release/delete a phone number
 */
export async function deletePhoneNumber(req, res) {
  try {
    const { phoneNumberSid } = req.params;

    if (!phoneNumberSid) {
      return res.status(400).json({
        success: false,
        error: 'Phone number SID is required',
      });
    }

    const result = await releasePhoneNumber(phoneNumberSid);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Update phone number configuration
 */
export async function modifyPhoneNumber(req, res) {
  try {
    const { phoneNumberSid } = req.params;
    const { friendlyName, smsUrl, voiceUrl, statusCallback } = req.body;

    if (!phoneNumberSid) {
      return res.status(400).json({
        success: false,
        error: 'Phone number SID is required',
      });
    }

    const result = await updatePhoneNumber(phoneNumberSid, {
      friendlyName,
      smsUrl,
      voiceUrl,
      statusCallback,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Create a new subaccount
 */
export async function createNewSubaccount(req, res) {
  try {
    const { friendlyName } = req.body;

    if (!friendlyName) {
      return res.status(400).json({
        success: false,
        error: 'Friendly name is required',
      });
    }

    const result = await createSubaccount(friendlyName);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * List all subaccounts
 */
export async function getAllSubaccounts(req, res) {
  try {
    const { friendlyName, status, limit } = req.query;

    const result = await listSubaccounts({
      friendlyName,
      status,
      limit: limit ? parseInt(limit) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Get a specific subaccount
 */
export async function getSubaccountDetails(req, res) {
  try {
    const { subaccountSid } = req.params;

    if (!subaccountSid) {
      return res.status(400).json({
        success: false,
        error: 'Subaccount SID is required',
      });
    }

    const result = await getSubaccount(subaccountSid);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Update a subaccount
 */
export async function modifySubaccount(req, res) {
  try {
    const { subaccountSid } = req.params;
    const { friendlyName, status } = req.body;

    if (!subaccountSid) {
      return res.status(400).json({
        success: false,
        error: 'Subaccount SID is required',
      });
    }

    const result = await updateSubaccount(subaccountSid, {
      friendlyName,
      status,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Close a subaccount
 */
export async function deleteSubaccount(req, res) {
  try {
    const { subaccountSid } = req.params;

    if (!subaccountSid) {
      return res.status(400).json({
        success: false,
        error: 'Subaccount SID is required',
      });
    }

    const result = await closeSubaccount(subaccountSid);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

