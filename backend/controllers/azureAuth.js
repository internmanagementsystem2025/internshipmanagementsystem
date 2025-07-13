const staff = require("../models/Staff");
const nodemailer = require("nodemailer");
const util = require("util");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");



// JWK client setup for Azure AD
const azureClient = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.TENENT_ID}/discovery/v2.0/keys`,
});

const getKey = (header, callback) => {
  azureClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

exports.protect = async (req, res, next) => {
  // read the token
  const testToken = req.headers.authorization;

  let token;
  let decodedToken;

  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "UnAuthorized!" });
  }

  // validate token

  try {
    if (token.length < 500) {
      decodedToken = await util.promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      req.user = await staff.findById(decodedToken._id);
      if (!req.user) {
        return res.status(401).json({ error: "Token Does not Exist!" });
      }
    } else {
      decodedToken = await util.promisify(jwt.verify)(token, getKey, {
        algorithms: ["RS256"],
        audience: process.env.CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.TENENT_ID}/v2.0`,
      });
       
      req.user = decodedToken;
    }
  } catch (error) {
    console.log(error);
    // Handle token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired!" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token!" });
    }
    // Handle other unexpected errors
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }

  let user;
  if (token.length < 500) {
    user = await staff.findById(decodedToken._id);
  } else {
    const email = decodedToken.preferred_username;
    user = await staff.findOne({ userName: email });
  }

  if (!user) {
    return res.status(401).json({ error: "Token Does not Exist!" });
  }

  // allow user to access route

  req.user = user;
  next();
};

exports.restrict = (userType) => {
  return (req, res, next) => {
    if (!userType.includes(req.user.userType)) {
      return res
        .status(403)
        .json({ error: "You do not have permission for this action!" });
    }
    next();
  };
};

exports.checkAuth = async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(400);
  }
};
