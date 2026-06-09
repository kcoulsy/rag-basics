export type DocumentChunk = {
  id: string
  source: string
  content: string
  embedding: number[]
}

export const chunks: DocumentChunk[] = []