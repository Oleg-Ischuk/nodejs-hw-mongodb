import {
  getAllContacts,
  getContactsById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getAllContactsController = async (req, res) => {
  const contacts = await getAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactsById(contactId);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  if (!name) {
    throw createError(400, 'Name is required');
  }

  if (!phoneNumber) {
    throw createError(400, 'Phone number is required');
  }

  if (!contactType) {
    throw createError(400, 'Contact type is required');
  }

  const contactData = {
    name,
    phoneNumber,
    contactType,
  };

  if (email !== undefined) {
    contactData.email = email;
  }

  if (isFavourite !== undefined) {
    contactData.isFavourite = isFavourite;
  }

  const newContact = await createContact(contactData);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (phoneNumber !== undefined) {
    updateData.phoneNumber = phoneNumber;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  if (isFavourite !== undefined) {
    updateData.isFavourite = isFavourite;
  }

  if (contactType !== undefined) {
    updateData.contactType = contactType;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError(400, 'No update data provided');
  }

  const updatedContact = await updateContact(contactId, updateData);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  const deletedContact = await deleteContact(contactId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).end();
};
