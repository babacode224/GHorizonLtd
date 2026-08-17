import "dotenv/config";
import { createApp } from "../server/app";

/**
 * Vercel invokes this exported Express application as a Node.js serverless
 * function for all /api/* routes. Do not start a listener in this module.
 */
const app = createApp();

export default app;
