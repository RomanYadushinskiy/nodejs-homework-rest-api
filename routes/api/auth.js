// const express = require("express");

// const { register } = require("../../controllers/auth/authControllers");
// const { joiRegisterSchema, joiLoginSchema } = require("../../models/user");

// const router = express.Router();

// router.post("/register", register);

// module.exports = router;

const router = require("express").Router();

const { register, login, getCurrent, logout, updateSubscriptionStatus} = require("../../controllers/authControllers");
const auth = require("../../middlewares/auth");

router.post("/register", register);
router.post("/login", login);

router.get("/current", auth, getCurrent);
router.post("/logout", auth, logout)
router.patch("/", auth, updateSubscriptionStatus)

module.exports = router;