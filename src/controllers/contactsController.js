import ContactSCollection from '../models/contacts.js';

export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await ContactSCollection.findById(contactId);

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
