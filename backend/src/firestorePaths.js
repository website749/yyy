import "dotenv/config";

const appId = process.env.APP_ID;

if (!appId) {
  throw new Error("APP_ID is missing in .env");
}

export const userAdminDataPath =
  `artifacts/${appId}/public/data/user_admin_data`;

export const chatDataPath =
  `artifacts/${appId}/public/data/CHAT_DATA`;

export const cyberLogsPath =
  `artifacts/${appId}/public/data/cyber_logs`;

export const appealsPath =
  `artifacts/${appId}/public/data/appeals`;