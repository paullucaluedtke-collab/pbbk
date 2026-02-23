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
        const systemPrompt = `You are an expert accounting assistant for a German Pension / Hotel business.
    Analyze the uploaded receipt image and extract the following data into a strictly valid JSON object:
    - date (YYYY-MM-DD)
    - vendor (Name of the shop/vendor)
    - type (enum: "Einnahme", "Ausgabe". Most receipts are "Ausgabe". Invoices to others are "Einnahme".)
    - category (Extract the best fitting category from the exact string values below. Use these rules to decide:
        "Büromat./Porto/Tel.": Büromaterial, Stifte, Papier, Briefmarken, Porto, Telefonrechnungen, Internetkosten (außerhalb der Pension).
        "Fortbildung": Bücher für berufliche Zwecke, Seminare, Schulungen, Kurse.
        "KFZ-Kosten": Tankquittungen, Benzin, Diesel, Autowäsche, Parkscheine, Reparaturen am Auto, KFZ-Versicherung.
        "Miete/Nebenkosten": Miete für Büro/Gewerbe, Rechnungen für Strom, Wasser, Heizung, Internet (nur für das Gebäude/Objekt).
        "Reisekosten": Zugtickets, Flugtickets, Hotelübernachtungen (wenn man selbst reist), Fahrkarten, Taxi.
        "Bewirtung": Restaurantrechnungen mit Kunden (Bewirtungsbeleg), Geschäftsessen.
        "Wareneingang": Waren, die eingekauft werden, um sie direkt weiterzuverkaufen (für eine Pension unüblich).
        "Fremdleistung": Rechnungen von Handwerkern, Putzkräften, Dienstleistern, Reparaturdienste (die nicht fest angestellt sind).
        "Geldtransit": Überweisungen zwischen eigenen Konten, Bargeldabhebung am Automaten.
        "Privatentnahme": Alle privaten Einkäufe, die nichts mit der Pension oder dem Geschäft zu tun haben (z.B. private Kleidung, privater Supermarkt-Einkauf).
        "Grundstückskosten": Rechnungen, die direkt das Land/Grundstück betreffen, wie Grundbesitzabgaben, Müllabfuhr, Gebäudeversicherungen, Schornsteinfeger, Grundsteuer.
        "Betriebskosten allgemein": Rechnungen für den laufenden Betrieb der Pension, z.B. GEZ, Software-Abos, allgemeine Werkzeuge, Deko für die Pension, Reinigungsmittel.
        "Kartenzahlung": Terminal-Belege, die nur bestätigen, dass eine EC-Karte benutzt wurde, aber keine gekauften Artikel auflisten.
        "Barquittung Pension & Frühstück": Einkäufe im Supermarkt, Bäcker oder Metzger (Kaffee, Brötchen, Wurst, Eier, Käse, Getränke) die für das Gäste-Frühstück der Pension bestimmt sind. Auch handschriftliche Barquittungen von Gästen.
        "Sonstiges": Nur verwenden, wenn absolut keine der obigen Kategorien passt!
    )
    - property (If relevant, e.g. for rent or property costs)
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
