import { Document } from "langchain/document";

export const combineDocuments = (
  documents: Document<Record<string, any>>[]
): string => {
  return documents.map((document) => document.pageContent).join("\n\n");
};
