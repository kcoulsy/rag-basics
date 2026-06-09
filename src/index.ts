import { Hono } from 'hono'
import { chunkText } from './chunk'
import { cosineSimilarity } from './vector'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono!' })
})


app.post('/api/chunk', async (c) => {
  const { text } = await c.req.json()
  console.log(text)
  const chunks = chunkText(text)
  return c.json({ length: chunks.length, chunks })
})

app.post('/api/similarity', async (c) => {
  const { a, b } = await c.req.json()
  const similarity = cosineSimilarity(a, b)
  return c.json({ similarity })
})

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Hono!' })
})

export default app
