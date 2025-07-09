export const msalConfig = {
    auth: {
       // clientId: 'cec10081-d857-4e10-a58e-96379acd9777', 
       // authority: 'https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee',
       clientId: 'bccbf309-4609-4f16-866d-06c360b2f6ff', 
       authority: 'https://login.microsoftonline.com/a2ee14d0-e210-4462-9e7e-84dff94dce64',
      redirectUri: 'http://localhost:5173',

    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    }
  };
  
  export const loginRequest = {
    scopes: ['User.Read']
  };
  