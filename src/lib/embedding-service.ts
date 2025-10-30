import { FlagEmbedding } from "fastembed";
import { Embeddings } from "langchain/embeddings/base";

import { asyncIterableToArray } from "./async-iterable-to-array";

export class EmbeddingService extends Embeddings {
  private embedder: FlagEmbedding;

  constructor(flagEmbeddingInstance: FlagEmbedding) {
    super({});

    this.embedder = flagEmbeddingInstance;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings = await asyncIterableToArray(this.embedder.embed(texts));

    return embeddings.map((embedding) => Object.values(embedding));
  }

  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embedDocuments([text]);

    return embedding;
  }
}
