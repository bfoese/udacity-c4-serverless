const dotenv = require('dotenv');

dotenv.config();

export const AppConfig = {
  todoIdIndex: process.env.TODO_ID_INDEX,
  todoItemTable: process.env.TODO_ITEM_TABLE,
  isOffline: process.env.IS_OFFLINE
};
