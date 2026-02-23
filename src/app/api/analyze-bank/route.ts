import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const forceHighQuality = formData.get('forceHighQuality') === 'true';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API Key is missing. Check .env.local' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64Image}`;

        const systemPrompt = `You are an expert accounting assistant specialized in reading German bank statements.
    Analyze the uploaded bank statement image and extract ALL transactions into a strictly valid JSON array.
    For each transaction, provide an object with:
    - date (YYYY-MM-DD, try your best to parse it)
    - amount (number, negative for outgoing/expenses, positive for incoming/income)
    - sender_receiver (String, name of the counterparty, owner, or shop)
    - purpose (String, description, Verwendungszweck, or booking text)
    
    If the image contains no transactions, return an empty array [].
    Return ONLY a pure JSON array, no markdown formatting. Do not wrap in a JSON object. Just the array.`;

        let model = forceHighQuality ? 'gpt-4o' : 'gpt-4o-mini';
        console.log(`Analyzing bank statement with model: ${model}`);

        let completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: dataUrl } },
                    ],
                },
            ],
            max_tokens: 1500, // higher token limit to handle multiple rows
            temperature: 0,
        });

        let content = completion.choices[0].message.content;
        let result = parseJSON(content);

        // Fallback to high quality if parsing failed or array is empty when it shouldn't be
        if (model === 'gpt-4o-mini' && (!result || !Array.isArray(result) || result.length === 0)) {
            console.log("Mini model failed or returned empty array, retrying with GPT-4o...");
            completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: [
                            { type: "image_url", image_url: { url: dataUrl } },
                        ],
                    },
                ],
                max_tokens: 1500,
                temperature: 0,
            });
            content = completion.choices[0].message.content;
            result = parseJSON(content);
        }

        return NextResponse.json(result || { error: "Failed to parse bank statement" });

    } catch (error: any) {
        console.error('Error processing bank statement:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

function parseJSON(content: string | null) {
    if (!content) return null;
    try {
        const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON parse error:", e);
        return null;
    }
}
