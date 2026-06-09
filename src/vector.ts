// the closer to 1, the more similar the vectors are
export function cosineSimilarity(a: number[], b: number[]): number {

    if (a.length !== b.length) {
        throw new Error('Vectors must be the same length')
    }

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        magnitudeA += a[i] * a[i]
        magnitudeB += b[i] * b[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    return dotProduct / (magnitudeA * magnitudeB)
}