// const Contact = require("../models/contacts");

// const listContacts = async () => {
//   const contacts = await Contact.find({});
//   return contacts;
// };

// const getContactById = async (id) => {
// 	const contacts = await listContacts();
// 	const result = Contact.findById(id);
// 	if (!result) {
// 		return null
// 	}
// 	return result
// };

// const removeContact = async (id) => {
//   const deleteContact = await Contact.findByIdAndRemove(id);
//   return deleteContact;
// };

// const addContact = async ({ name, email, phone }) => {
// 	const newContact = await Contact.create({ name, email, phone });
// 	return newContact;
// };

// const updateContact = async (id, body) => {
//   const updateNewContact = await Contact.findByIdAndUpdate(id, body, { new: true });
//   return updateNewContact;
// };

// const updateStatusContact = async(id, body) => {
//   const updateNewContact = await Contact.findByIdAndUpdate(id, body, { new: true });
//   return updateNewContact;
// }

// module.exports = {
// 	listContacts,
// 	getContactById,
// 	removeContact,
// 	addContact,
// 	updateContact,
// 	updateStatusContact,
// };

const Joi = require("joi");

const Contact = require("../models/contacts");

const schema = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const listContacts = async (req, res) => {
  const { _id } = req.user;
  const { page = 1, limit = 10, favorite } = req.query;
  const skip = (page - 1) * limit;
  console.log({limit, skip})
  const contacts = await Contact.find(
    favorite ? { owner: _id, favorite } : { owner: _id },
    "-__v",
    { skip, limit }
  ).populate("owner", "_id email subscription");

  res.json({
    status: "success",
    code: 200,
    data: { result: contacts },
  });
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);
  if (!result) {
    res
      .status(404)
      .json({ message: `Contact with id "${contactId}" not found` });
  }
  res.json({
    status: "success",
    code: 200,
    data: result,
  });
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const { _id } = req.user;
  const result = await Contact.findOneAndRemove({ _id: contactId, owner: _id });
  if (!result) {
    const error = new Error(`Contact with id "${contactId}" not found`);
    error.status = 404;
    throw error;
  }
  res.json({
    status: "success",
    code: 200,
    message: "contact deleted",
    data: { result },
  });
};

const addContact = async (req, res) => {
  const { _id } = req.user;
  const { error } = schema.validate(req.body);
  if (error) {
    throw res.status(400).json({ message: "missing required field" });
  }
  const newContact = await Contact.create({ ...req.body, owner: _id });

  res.status(201).json({
    status: "success",
    code: 201,
    data: newContact,
  });
};

const updateContact = async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    error.status = 400;
    error.message = "missing fields";
    throw error;
  }
  const { contactId } = req.params;
  const { _id } = req.user;
  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner: _id },
    req.body,
    {
      new: true,
    }
  );
  console.log(contactId);
  if (!result) {
    return res
      .status(404)
      .json({ message: `Contact with id "${contactId}" not found` });
  }
  res.json({
    status: "success",
    code: 201,
    data: { result },
  });
};

const updateStatusContact = async (req, res) => {
  const { error } = updateFavoriteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  const { contactId } = req.params;
  const { _id } = req.user;
  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner: _id },
    req.body,
    {
      new: true,
    }
  );
  if (!result) {
    return res
      .status(404)
      .json({ message: `Contact with id "${contactId}" not found` });
  }
  res.json({
    status: "success",
    code: 201,
    data: { result },
  });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};