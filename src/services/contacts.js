import { Contact } from '../db/models/contact.js';

export const getAllContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getContactsById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createContact = async (contactData) => {
  try {
    const newContact = await Contact.create(contactData);
    return newContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateContact = async (contactId, updateData) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      updateData,
      { new: true },
    );
    return updatedContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteContact = async (contactId) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId);
    return deletedContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
