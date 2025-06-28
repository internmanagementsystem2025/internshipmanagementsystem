module.exports = {
    azureAd: {
      // Credentials (now includes clientSecret)
      credentials: {
        clientId: process.env.AZURE_CLIENT_ID,
        
        tenantId: process.env.AZURE_TENANT_ID
      },
  
      // Metadata Configuration (unchanged)
      metadata: {
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
        discovery: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`
      },
  
      // Settings (enhanced)
      settings: {
        redirectUri: process.env.AZURE_REDIRECT_URI || `${process.env.BASE_URL}/api/auth/azure/callback`,
        postLogoutRedirectUri: process.env.BASE_URL,
        validateIssuer: true,
        passReqToCallback: false,
        loggingLevel: 'info',
        scope: ['openid', 'profile', 'email'],
        cookieEncryptionKeys: [
          {
            key: process.env.COOKIE_ENCRYPTION_KEY,
            iv: process.env.COOKIE_ENCRYPTION_IV
          }
        ]
      }
    },
  
    // Preserved loginRequest for MSAL compatibility
    loginRequest: {
      scopes: ["openid", "profile", "email"]
    }
  };