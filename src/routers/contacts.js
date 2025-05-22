import express from 'express';
import {
  getAllContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(getAllContactsController));
router.get('/:contactId', ctrlWrapper(getContactByIdController));
router.post('/', ctrlWrapper(createContactController));
router.patch('/:contactId', ctrlWrapper(updateContactController));
router.delete('/:contactId', ctrlWrapper(deleteContactController));

export default router;
