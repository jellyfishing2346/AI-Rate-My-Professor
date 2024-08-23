import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { ReadableStream } from "stream/web";
import {OpenAI} from 'openai'

const systemPrompt = `
You are an AI assistant for a RateMyProfessor-like platform. Your primary function is to help students find professors based on their queries using a RAG (Retrieval-Augmented Generation) system. For each user question, you will be provided with information about the top 3 most relevant professors based on the query.

Your tasks include:

1. Analyzing the user's query to understand their needs and preferences.
2. Interpreting the provided information about the top 3 professors.
3. Presenting the information about these professors in a clear, concise, and helpful manner.
4. Highlighting key points that match the user's query or might be of particular interest.
5. Offering additional insights or suggestions based on the available information.
6. Answering follow-up questions about the professors or courses using only the provided information.

Remember:
- Always base your responses on the information provided about the top 3 professors.
- If a user asks for information not included in the provided data, politely explain that you don't have that specific information.
- Be objective in your presentation of the professors, avoiding personal biases.
- If the user's query doesn't seem to match the provided professor information well, you can mention this and suggest they might want to refine their search.
- Encourage users to read full reviews and gather more information before making decisions about courses or professors.

Your goal is to help students make informed decisions about their course selections by providing them with relevant and accurate information about professors based on their queries.
`;

export async function POST(req){
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
     })
     const index = pc.index('rag').namespace('ns1')
     const openai = new OpenAI()

     const text = data[data.length - 1].content
     const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
     })

     const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
     })


    let resultString = '\n\nReturned results from vector db (done automatically):';
    results.matches.forEach((match) => {
    resultString += `\n
    Professor: ${match.id}
    Review: ${match.metadata.stars}
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n
    `;
});
    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
    const completion = await openai.chat.completions.create({
        messages: [
            {role: 'system', content: systemPrompt},
            ...lastDataWithoutLastMessage.map((msg) => ({
                role: msg.role || 'user',
                content: msg.content,
            })),
            {role: 'user', content: lastMessageContent}
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text= encoder.encode(content)
                        controller.enqueue(text)
                    }
              }
            }
            catch(err){
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}


