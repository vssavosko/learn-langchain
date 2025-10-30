import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { supabase } from "../config/supabase";

import { EmbeddingService } from "./embedding-service";

export const createRetriever = async (
  content: string,
  embeddingService: EmbeddingService
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ["\n\n", "\n", " ", ""],
  });

  const documents = await splitter.createDocuments([content]);

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    documents,
    embeddingService,
    {
      client: supabase,
      tableName: "documents_two",
      queryName: "match_documents_two",
    }
  );

  return vectorStore.asRetriever();
};
