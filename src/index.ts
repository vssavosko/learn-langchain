import * as fs from "fs/promises";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";
import { EmbeddingModel, FlagEmbedding } from "fastembed";

import { openrouter } from "./config/openrouter";
import { EmbeddingService } from "./lib/embedding-service";
import { createRetriever } from "./lib/create-retriever";
import { combineDocuments } from "./lib/combine-documents";

const main = async () => {
  try {
    const flagEmbedding = await FlagEmbedding.init({
      model: EmbeddingModel.MLE5Large,
    });

    const embeddingService = new EmbeddingService(flagEmbedding);

    const fileContent = await fs.readFile("./src/scrimba-info.txt", "utf8");

    const retriever = await createRetriever(fileContent, embeddingService);

    const standaloneQuestionTemplate =
      "Given a question, convert it to a standalone question. question: {question} standalone question:";
    const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
      context: {context}
      question: {question}
      answer:
      `;

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate
    );
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

    const standaloneQuestionChain = RunnableSequence.from([
      standaloneQuestionPrompt,
      openrouter,
      new StringOutputParser(),
    ]);
    const retrieverChain = RunnableSequence.from([
      ({ standalone_question }) => standalone_question,
      retriever,
      combineDocuments,
    ]);
    const answerChain = RunnableSequence.from([
      answerPrompt,
      openrouter,
      new StringOutputParser(),
    ]);

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
      },
      answerChain,
    ]);

    const response = await chain.invoke({
      question:
        "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
    });

    console.log("response", response);

    // const { error: insertError } = await supabase
    //   .from("documents_two")
    //   .insert(embeddings);

    // if (insertError) throw insertError;

    // console.log("Embedding and storing complete!");
  } catch (error: unknown) {
    console.error(
      "Error: ",
      error instanceof Error ? error.message : String(error)
    );
  }
};

main();
