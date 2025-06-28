// // middleware/azureAuth.js
// const { BearerStrategy } = require('passport-azure-ad');
// const passport = require('passport');
// const { azureConfig } = require('../authconfig');

// const strategy = new BearerStrategy(
//   {
//     identityMetadata: azureConfig.metadata.discovery,
//     clientID: azureConfig.credentials.clientID,
//     validateIssuer: azureConfig.settings.validateIssuer,
//     passReqToCallback: azureConfig.settings.passReqToCallback,
//     loggingLevel: azureConfig.settings.loggingLevel,
//     scope: azureConfig.settings.scope,
//   },
//   (token, done) => {
//     // Here you would typically find or create a user in your database
//     // based on the Azure AD token information
//     const user = {
//       id: token.oid || token.sub,
//       displayName: token.name,
//       email: token.preferred_username || token.email,
//       // Add other user properties you need
//     };
    
//     return done(null, user, token);
//   }
// );

// passport.use(strategy);

// module.exports = passport;

const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const util = require("util");

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

exports.verifyAzureToken = async (req, res, next) => {
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
return res.status(401).json({ error: "Missing or invalid Authorization header" });
}

const token = authHeader.split(" ")[1];

try {
const decoded = await util.promisify(jwt.verify)(token, getKey, {
algorithms: ["RS256"],
audience: process.env.AZURE_CLIENT_ID,
issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
});


req.azureUser = decoded;
next();
} catch (err) {
console.error("Azure token verification failed:", err.message);
return res.status(401).json({ error: "Invalid Azure token" });
}
};