const config = {
  apiUrl: process.env.REACT_APP_API_URL || "http://localhost:3001",

  auth: {
    region: process.env.REACT_APP_AWS_REGION || "us-east-1",
    userPoolId: process.env.REACT_APP_USER_POOL_ID || "",
    userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || "",
  },

  amplify: {
    Auth: {
      Cognito: {
        userPoolId: process.env.REACT_APP_USER_POOL_ID || "",
        userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || "",
      },
    },
  },
};

export default config;
