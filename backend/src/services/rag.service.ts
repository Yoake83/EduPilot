import Groq from 'groq-sdk';
import fs from 'fs/promises';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Text extraction ──────────────────────────────────────────────────────────
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[rag] PDF extraction error:', err);
    return '';
  }
}

// ── Chunking ─────────────────────────────────────────────────────────────────
export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      // Overlap — keep last part of previous chunk
      const words = current.split(' ');
      current = words.slice(-Math.floor(overlap / 6)).join(' ') + ' ' + sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.filter(c => c.length > 50); // skip tiny chunks
}

// ── Simple TF-IDF similarity (no embeddings API needed) ─────────────────────
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function tfIdfScore(query: string, chunk: string): number {
  const queryTokens = new Set(tokenize(query));
  const chunkTokens = tokenize(chunk);
  const chunkLen = chunkTokens.length;
  if (chunkLen === 0) return 0;

  let score = 0;
  const tokenCounts = new Map<string, number>();
  for (const t of chunkTokens) tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);

  for (const qt of queryTokens) {
    const tf = (tokenCounts.get(qt) || 0) / chunkLen;
    score += tf;
  }

  return score;
}

// ── Find top-k relevant chunks ───────────────────────────────────────────────
export function findRelevantChunks(
  query: string,
  chunks: Array<{ text: string; index: number }>,
  topK = 4
): string[] {
  const scored = chunks.map(c => ({
    text: c.text,
    score: tfIdfScore(query, c.text),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.text);
}

// ── RAG answer generation ────────────────────────────────────────────────────
export async function generateRAGAnswer(
  question: string,
  relevantChunks: string[],
  materialTitle: string
): Promise<string> {
  const context = relevantChunks.join('\n\n---\n\n');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a study assistant helping a student understand their study material.
Answer questions ONLY based on the provided context from "${materialTitle}".
If the answer is not in the context, say "I couldn't find this in your uploaded material."
Be clear, concise, and educational. Use simple language.`,
      },
      {
        role: 'user',
        content: `CONTEXT FROM STUDY MATERIAL:
${context}

STUDENT'S QUESTION:
${question}

Answer based only on the context above:`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  });

  return response.choices[0].message.content || 'Could not generate an answer.';
}