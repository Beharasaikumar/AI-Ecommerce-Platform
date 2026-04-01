import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'products-index';

const MODEL = "llama-3.3-70b-versatile";

export async function getEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MODEL,
            input: text,
        }),
    });
    const data = await response.json() as any;
    return generateSimpleEmbedding(text);
}

function generateSimpleEmbedding(text: string): number[] {
    const vector = new Array(1024).fill(0);
    for (let i = 0; i < text.length; i++) {
        vector[i % 1024] += text.charCodeAt(i) / 1000;
    }
    const magnitude = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
    return vector.map(v => v / (magnitude || 1));
}

export async function upsertProductVector(
    productId: number,
    text: string,
    metadata: Record<string, any>
): Promise<void> {
    const vector = await getEmbedding(text);
    const host = await getPineconeHost();
    await fetch(`${host}/vectors/upsert`, {
        method: 'POST',
        headers: {
            'Api-Key': PINECONE_API_KEY!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vectors: [{
                id: String(productId),
                values: vector,
                metadata,
            }],
        }),
    });
    console.log(`📌 Pinecone: upserted product ${productId}`);
}

export async function searchSimilarProducts(
    query: string,
    topK: number = 5
): Promise<number[]> {
    const vector = await getEmbedding(query);
    const host = await getPineconeHost();
    const response = await fetch(`${host}/query`, {
        method: 'POST',
        headers: {
            'Api-Key': PINECONE_API_KEY!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vector,
            topK,
            includeMetadata: true,
        }),
    });
    const data = await response.json() as any;
    return (data.matches || []).map((m: any) => Number(m.id));
}

export async function askShoppingAssistant(
    userMessage: string,
    productContext: string
): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful shopping assistant for an e-commerce platform. 
Use the following product catalog to answer questions:
${productContext}
Be concise, friendly, and always suggest specific products with their prices in INR (₹).`,
                },
                { role: 'user', content: userMessage },
            ],
            max_tokens: 500,
            temperature: 0.7,
        }),
    });
    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
}

async function getPineconeHost(): Promise<string> {
    const response = await fetch(
        `https://api.pinecone.io/indexes/${PINECONE_INDEX}`,
        { headers: { 'Api-Key': PINECONE_API_KEY! } }
    );
    const data = await response.json() as any;
    return `https://${data.host}`;
}