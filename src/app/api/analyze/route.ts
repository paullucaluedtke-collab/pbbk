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

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64Image}`;

        // Define the extraction prompt
        // Define the extraction prompt
        const systemPrompt = `You are an expert accounting assistant.
    Analyze the uploaded receipt image and extract the following data into a strictly valid JSON object:
    - date (YYYY-MM-DD)
    - vendor (Name of the shop/vendor)
    - type (enum: "Einnahme", "Ausgabe". Most receipts are "Ausgabe". Invoices to others are "Einnahme".)
    - category (One of: "Verpflegung", "Reise", "Werkzeug", "Büro", "Material", "KFZ", "Vermietung und Verpachtung", "Sonstiges")
    - property (If category is "Vermietung und Verpachtung", try to extract the address or object name. Otherwise null.)
    - taxAmount (Extract the total tax amount, as a number. If multiple tax rates, sum them up.)
    - totalAmount (The final total, as a number)
    - confidence (enum: "high", "medium", "low". Based on legibility and completeness)
    
    If the image is not a receipt, return fields with null values and confidence "low".
    Return ONLY pure JSON, no markdown formatting.`;

        // Strategy: Try Mini first, unless forced
        let model = 'gpt-4o-mini';
        if (forceHighQuality) {
            model = 'gpt-4o';
        }

        console.log(`Analyzing receipt with model: ${model}`);

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
            max_tokens: 500,
            temperature: 0,
        });

        let content = completion.choices[0].message.content;
        let result = parseJSON(content);

        // Hybrid Logic: If Mini was used but result is low confidence/unsure, retry with GPT-4o
        if (model === 'gpt-4o-mini' && (result?.confidence === 'low' || !result)) {
            console.log("Low confidence with Mini, upgrading to GPT-4o...");
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
                max_tokens: 500,
                temperature: 0,
            });
            content = completion.choices[0].message.content;
            result = parseJSON(content);
        }

        return NextResponse.json(result || { error: "Failed to parse receipt" });

    } catch (error: any) {
        console.error('Error processing receipt:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

function parseJSON(content: string | null) {
    if (!content) return null;
    try {
        // Remove markdown code blocks if present
        const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON parse error:", e);
        return null;
    }
}
