const jwt = require('jsonwebtoken');
const {User} = require('../models/user')
require("dotenv").config();

const {JWT_SECRET} = process.env

const auth = async (req, res, next) => {
  const { authorization = ""} = req.headers;
  const [bearer, token] = authorization.split(" ");
  if(!bearer || bearer !== "Bearer") {
    throw res.status(401).json("Not authorized");
  };

  try {
    const {id} = jwt.verify(token, JWT_SECRET);
    const candidate = await User.findById(id);

    if(!candidate || token !== candidate.token){
      throw res.status(401).json("Not authorized");
    };

    req.user = candidate;
    next()
  } catch (error) {
    return res.status(401).json("Not authorized")
  }
};

module.exports = auth;