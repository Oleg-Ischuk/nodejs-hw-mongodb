import { Contact } from '../db/models/contact.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
} = {}) => {
  try {
    const skip = (page - 1) * perPage;

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject = { [sortBy]: sortDirection };

    const contacts = await Contact.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(perPage);

    const totalItems = await Contact.countDocuments(filter);

    const totalPages = Math.ceil(totalItems / perPage);

    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: contacts,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
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
