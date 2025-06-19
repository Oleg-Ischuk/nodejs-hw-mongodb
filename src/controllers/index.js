import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  sendResetEmail,
  resetPassword,
  getAllContacts,
  getContactsById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/index.js';
import createHttpError from 'http-errors';
import createError from 'http-errors';
import parsePaginationParams from '../utils/parsePaginationParams.js';
import parseSortParams from '../utils/parseSortParams.js';
import parseFilterParams from '../utils/parseFilterParams.js';

// Auth Controllers
export const registerUserController = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await registerUser({
    name,
    email,
    password,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: newUser,
  });
};

export const loginUserController = async (req, res) => {
  const { email, password } = req.body;

  const loginResult = await loginUser({
    email,
    password,
  });

  // Встановлюємо refresh token в cookies
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 днів в мілісекундах
  res.cookie('refreshToken', loginResult.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: loginResult.accessToken,
    },
  });
};

export const refreshUserSessionController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not provided');
  }

  const refreshResult = await refreshUserSession(refreshToken);

  // Встановлюємо новий refresh token в cookies
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 днів в мілісекундах
  res.cookie('refreshToken', refreshResult.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: refreshResult.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not provided');
  }

  await logoutUser(refreshToken);

  res.clearCookie('refreshToken');

  res.status(204).end();
};

export const sendResetEmailController = async (req, res) => {
  const { email } = req.body;

  await sendResetEmail(email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  await resetPassword(token, password);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

// Contact Controllers
export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const userId = req.user._id;

  const paginationData = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: paginationData,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await getContactsById(contactId, userId);

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
  const userId = req.user._id;

  const contactData = {
    name,
    phoneNumber,
    contactType,
    userId,
  };

  if (email !== undefined) {
    contactData.email = email;
  }

  if (isFavourite !== undefined) {
    contactData.isFavourite = isFavourite;
  }

  if (req.file) {
    contactData.photo = req.file.path;
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
  const userId = req.user._id;

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

  if (req.file) {
    updateData.photo = req.file.path;
  }

  const updatedContact = await updateContact(contactId, updateData, userId);

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
  const userId = req.user._id;

  const deletedContact = await deleteContact(contactId, userId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).end();
};
