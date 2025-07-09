const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const util = require("util");
const Staff = require("../models/Staff");

const azureClient = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`,
});

const getKey = (header, callback) => {
  azureClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  // Try to decode the header to check the algorithm
  let decodedHeader;
  try {
    decodedHeader = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
  } catch (e) {
    return res.status(401).json({ message: "Invalid Token Header" });
  }

  try {
    if (decodedHeader.alg === "RS256") {
      // Azure AD token
      const decoded = await util.promisify(jwt.verify)(token, getKey, {
        algorithms: ["RS256"],
        audience: process.env.AZURE_CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
      });
      // Find staff by Azure AD ID or email
      let staffUser = null;
      if (decoded.oid || decoded.sub) {
        staffUser = await Staff.findOne({ azureId: decoded.oid || decoded.sub });
      }
      if (!staffUser && (decoded.preferred_username || decoded.email)) {
        staffUser = await Staff.findOne({ email: decoded.preferred_username || decoded.email });
      }
      if (!staffUser) {
        console.error("Staff user not found for Azure AD token.");
        return res.status(401).json({ message: "Staff user not found for Azure AD token." });
      }
      req.user = staffUser;
      return next();
    } else {
      // Local JWT (HS256)
      const verified = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
      req.user = {
         id: verified.id,
         username: verified.username,
        email: verified.email,
        userType: verified.userType,
      };
      return next();
    }
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = { verifyToken };
