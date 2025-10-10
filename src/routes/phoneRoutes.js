import express from 'express';
import {
  validatePhoneFormat,
  lookupPhone,
  lookupPhoneCarrier,
  initiateCall,
  searchPhoneNumbers,
  batchValidatePhones,
  twilioHealthCheck,
  buyPhoneNumber,
  buyPhoneNumberByCountry,
  listPurchasedNumbers,
  deletePhoneNumber,
  modifyPhoneNumber,
  createNewSubaccount,
  getAllSubaccounts,
  getSubaccountDetails,
  modifySubaccount,
  deleteSubaccount,
} from '../controllers/phoneController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', twilioHealthCheck);

// Phone validation endpoints
router.post('/validate/format', validatePhoneFormat);
router.post('/validate/lookup', lookupPhone);
router.post('/validate/carrier', lookupPhoneCarrier);
router.post('/validate/batch', batchValidatePhones);


// Call endpoints
router.post('/call/make', initiateCall);

// Phone number search
router.get('/numbers/search', searchPhoneNumbers);

// Phone number purchase and management
router.post('/numbers/purchase', buyPhoneNumber);
router.post('/numbers/purchase/country', buyPhoneNumberByCountry);
router.get('/numbers/purchased', listPurchasedNumbers);
router.delete('/numbers/:phoneNumberSid', deletePhoneNumber);
router.put('/numbers/:phoneNumberSid', modifyPhoneNumber);

// Subaccount management
router.post('/subaccounts', createNewSubaccount);
router.get('/subaccounts', getAllSubaccounts);
router.get('/subaccounts/:subaccountSid', getSubaccountDetails);
router.put('/subaccounts/:subaccountSid', modifySubaccount);
router.delete('/subaccounts/:subaccountSid', deleteSubaccount);

export default router;

