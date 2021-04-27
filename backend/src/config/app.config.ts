const dotenv = require('dotenv');

dotenv.config();

export const AppConfig = {
  jsonWebKeySet: 'https://ataraxia.eu.auth0.com/.well-known/jwks.json',
  awsBucket: process.env.AWS_BUCKET,
  awsBucketSignedUrlExpiry: process.env.AWS_BUCKET_SIGNED_URL_EXPIRY,
  userIdIndex: process.env.User_ID_INDEX,
  todoItemTable: process.env.TODO_ITEM_TABLE,
  isOffline: process.env.IS_OFFLINE
};
