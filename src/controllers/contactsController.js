import { ContactCollection } from '../models/contact.js';

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactCollection.find();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await ContactCollection.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
