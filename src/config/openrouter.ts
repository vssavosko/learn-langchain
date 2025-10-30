import * as dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";

dotenv.config();

export const openrouter = new ChatOpenAI({
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  modelName: "openai/gpt-oss-20b:free",
});
