const Email = require('../models/Email');
const sendMail = require('../services/emailService');

exports.registerEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const newEmail = new Email({ email });
    await newEmail.save();

    // Send email
    sendMail(email);

    res.status(201).json({ message: 'Email registered and welcome email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
