"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabaseServer';
import {
    TaxReturn, TaxReturnStatus, TaxStepId,
    defaultPersonalInfo, defaultIncomeData, defaultDeductionData,
    defaultSpecialExpenses, defaultExtraordinaryBurdens
} from '@/types/taxReturn';

export async function getTaxReturns(): Promise<TaxReturn[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('tax_returns')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false });

    if (error) {
        console.error('Error fetching tax returns:', error);
        return [];
    }

    return (data || []).map(parseTaxReturn);
}

export async function getTaxReturn(id: string): Promise<TaxReturn | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('tax_returns')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error || !data) return null;
    return parseTaxReturn(data);
}

export async function createTaxReturn(year: number): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    // Check if already exists for this year
    const { data: existing } = await supabase
        .from('tax_returns')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', year)
        .limit(1);

    if (existing && existing.length > 0) {
        return existing[0].id; // Return existing instead of creating duplicate
    }

    const newReturn: any = {
        user_id: user.id,
        year,
        status: 'Draft',
        current_step: 'personal',
        personal_data: defaultPersonalInfo,
        income_data: defaultIncomeData,
        deduction_data: defaultDeductionData,
        special_expenses_data: defaultSpecialExpenses,
        extraordinary_data: defaultExtraordinaryBurdens,
    };

    const { data, error } = await supabase
        .from('tax_returns')
        .insert(newReturn)
        .select('id')
        .single();

    if (error) {
        console.error('Error creating tax return:', error);
        throw new Error('Steuererklärung konnte nicht erstellt werden: ' + error.message);
    }

    revalidatePath('/steuer');
    return data.id;
}

export async function saveTaxStep(
    id: string,
    stepId: TaxStepId,
    stepData: any
): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const fieldMap: Record<TaxStepId, string> = {
        personal: 'personal_data',
        income: 'income_data',
        deductions: 'deduction_data',
        special: 'special_expenses_data',
        extraordinary: 'extraordinary_data',
        summary: 'current_step', // summary doesn't have its own data
    };

    const updatePayload: any = {
        current_step: stepId,
        status: 'InProgress' as TaxReturnStatus,
        updated_at: new Date().toISOString(),
    };

    if (stepId !== 'summary') {
        updatePayload[fieldMap[stepId]] = stepData;
    }

    const { error } = await supabase
        .from('tax_returns')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error saving step:', error);
        throw new Error('Speichern fehlgeschlagen: ' + error.message);
    }

    revalidatePath('/steuer');
}

export async function submitTaxReturn(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const { error } = await supabase
        .from('tax_returns')
        .update({
            status: 'Completed' as TaxReturnStatus,
            current_step: 'summary',
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw new Error('Abschließen fehlgeschlagen: ' + error.message);
    revalidatePath('/steuer');
}

export async function deleteTaxReturn(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht angemeldet');

    const { error } = await supabase
        .from('tax_returns')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw new Error('Löschen fehlgeschlagen: ' + error.message);
    revalidatePath('/steuer');
}

// Parse DB row → typed TaxReturn
function parseTaxReturn(row: any): TaxReturn {
    return {
        id: row.id,
        user_id: row.user_id,
        year: row.year,
        status: row.status,
        current_step: row.current_step || 'personal',
        personal: row.personal_data || defaultPersonalInfo,
        income: row.income_data || defaultIncomeData,
        deductions: row.deduction_data || defaultDeductionData,
        special_expenses: row.special_expenses_data || defaultSpecialExpenses,
        extraordinary: row.extraordinary_data || defaultExtraordinaryBurdens,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
