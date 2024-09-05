import express from 'express';

import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { contactSchema,  updateContactSchema } from '../validation/contactSchemas.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../../src/middlewares/upload.js';


const router = express.Router();
const jsonParser = express.json();
// Застосовуємо middleware аутентифікації до всіх маршрутів
router.use(authenticate);

// router.get('/', getAllContacts);
// router.post('/', createContact);

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post('/', jsonParser,  upload.single('photo'),validateBody(contactSchema),ctrlWrapper(createContact));
router.patch('/:contactId', isValidId, jsonParser, validateBody(updateContactSchema), ctrlWrapper(updateContact));
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
