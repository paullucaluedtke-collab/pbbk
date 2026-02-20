"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabaseServer';
import { CompanySettings } from '@/types/companySettings';

export async function getCompanySettings(): Promise<CompanySettings | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        user_id: data.user_id,
        company_name: data.company_name || '',
        address_line1: data.address_line1 || '',
        address_line2: data.address_line2 || '',
        city_zip: data.city_zip || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        bank_name: data.bank_name || '',
        iban: data.iban || '',
        bic: data.bic || '',
        tax_id: data.tax_id || '',
        vat_id: data.vat_id || '',
    };
}

export async function saveCompanySettings(settings: CompanySettings): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const payload = {
        user_id: user.id,
        company_name: settings.company_name,
        address_line1: settings.address_line1,
        address_line2: settings.address_line2,
        city_zip: settings.city_zip,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        bank_name: settings.bank_name,
        iban: settings.iban,
        bic: settings.bic,
        tax_id: settings.tax_id,
        vat_id: settings.vat_id,
        updated_at: new Date().toISOString(),
    };

    // Upsert: insert or update based on user_id
    const { error } = await supabase
        .from('company_settings')
        .upsert(payload, { onConflict: 'user_id' });

    if (error) {
        console.error('Company settings save error:', error);
        throw new Error('Einstellungen konnten nicht gespeichert werden: ' + error.message);
    }

    revalidatePath('/invoices');
}
