// authconfig.js
const azureConfig = {
    credentials: {
      clientID: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantID: process.env.AZURE_TENANT_ID,
    },
    metadata: {
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
      discovery: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    },
    settings: {
      redirectUri: process.env.AZURE_REDIRECT_URI || `${process.env.BASE_URL}/api/auth/azure/callback`,
      postLogoutRedirectUri: process.env.BASE_URL,
      validateIssuer: true,
      passReqToCallback: false,
      loggingLevel: 'info',
      scope: ['openid', 'profile', 'email'],
    },
  };
  
  const loginRequest = {
    scopes: ["openid", "profile", "email"],
  };
  
  module.exports = {
    azureConfig,
    loginRequest,
  };