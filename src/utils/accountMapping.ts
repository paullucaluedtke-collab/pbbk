import { TaxCategory, ReceiptType } from '@/types/receipt';

export type AccountFrame = 'SKR03' | 'SKR04';

// Mapping Internal Category -> SKR Account Number
export const getAccount = (category: TaxCategory, type: ReceiptType, frame: AccountFrame = 'SKR03'): number => {
    if (type === 'Einnahme') {
        // Income usually maps to Revenue accounts
        // SKR03: 8400 (Erlöse 19% USt), 8195 (Erlöse Kleinunternehmer)
        // SKR04: 4400 (Erlöse 19% USt)
        // Check for specific categories if we had them, defaulting to standard revenue for now
        return frame === 'SKR03' ? 8400 : 4400;
    }

    // Expense Mappings
    const mapSKR03: Record<TaxCategory, number> = {
        'Büromat./Porto/Tel.': 4900, // Sonstige Betriebsbedarf
        'Fortbildung': 4945,
        'KFZ-Kosten': 4530, // Laufende KFZ-Betriebskosten
        'Miete/Nebenkosten': 4210, // Miete
        'Reisekosten': 4670, // Reisekosten Arbeitnehmer oder 4670 Reisekosten Unternehmer
        'Bewirtung': 4650, // Bewirtungskosten
        'Wareneingang': 3400, // Wareneingang 19%
        'Fremdleistung': 3100, // Fremdleistungen
        'Geldtransit': 1360,
        'Privatentnahme': 1800,
        'Sonstiges': 4980 // Betriebsbedarf
    };

    const mapSKR04: Record<TaxCategory, number> = {
        'Büromat./Porto/Tel.': 6800,
        'Fortbildung': 6821,
        'KFZ-Kosten': 6530,
        'Miete/Nebenkosten': 6310,
        'Reisekosten': 6670,
        'Bewirtung': 6650,
        'Wareneingang': 5400,
        'Fremdleistung': 5900,
        'Geldtransit': 1460,
        'Privatentnahme': 2100,
        'Sonstiges': 6300
    };

    if (frame === 'SKR03') {
        return mapSKR03[category] || 4980;
    } else {
        return mapSKR04[category] || 6300;
    }
};

export const getExportHeaders = (format: 'DATEV' | 'Standard') => {
    if (format === 'DATEV') {
        // Simplified DATEV-Format columns (often needed by import tools)
        // Real DATEV is fixed-width or specific CSV. We use a "DATEV-compatible" CSV structure often accepted (e.g. Lerneinheit)
        // Umsatz, Soll-Haben, Konto, Gegenkonto, Datum, Belegfeld1, Buchungstext
        return [
            "Umsatz (ohne Soll/Haben-Kz)", "Soll/Haben-Kennzeichen", "Währungskennzeichen", "Wechselkurs", "Rechnungsdatum", "Belegfeld 1", "Buchungstext", "Konto", "Gegenkonto (ohne BU-Schlüssel)", "BU-Schlüssel"
        ];
    }
    return ["Datum", "Typ", "Kategorie", "Händler", "Netto", "Steuer", "Brutto", "Status"];
};
