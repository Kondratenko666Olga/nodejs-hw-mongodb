import * as fs from 'node:fs/promises';
import path from 'node:path';
import { ContactCollection } from '../models/contact.js';
import createError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getAllContacts = async (req, res) => {
  const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', type, isFavourite } = req.query;
  const skip = (page - 1) * perPage;
  const filter = {};

  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';
  if (req.user._id) filter.userId = req.user._id;

  const totalItems = await ContactCollection.countDocuments(filter);

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const contacts = await ContactCollection.find(filter).sort(sort).skip(skip).limit(Number(perPage));

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await ContactCollection.findOne({ _id: contactId, userId: req.user._id });

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  let photo = null;

  if (typeof req.file !== 'undefined') {
    if (process.env.ENABLE_CLOUDINARY === 'true') {
      const result = await saveFileToCloudinary(req.file.path);
      await fs.unlink(req.file.path);

      photo = result.secure_url;
    } else {
      await fs.rename(
        req.file.path,
        path.resolve('src', 'public/avatars', req.file.filename),
      );

      photo = `http://localhost:3000/avatars/${req.file.filename}`;
    }
  }

  req.body.userId = req.user._id;
  req.body.photo = photo;
  const contact = await ContactCollection.create(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await ContactCollection.findByIdAndUpdate(contactId, req.body, { new: true });

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: contact,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await ContactCollection.findByIdAndDelete(contactId);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};
