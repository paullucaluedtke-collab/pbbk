"use server";

import { createClient } from '@/lib/supabaseServer';

export interface FinancialSummary {
    revenue: number;
    expenses: number;
    profit: number;
    taxEstimate: number; // 30% flat estimation
}

export interface MonthlyData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export async function getFinancialSummary(year: number): Promise<FinancialSummary> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { revenue: 0, expenses: 0, profit: 0, taxEstimate: 0 };

    // 1. Get Revenue (Paid Invoices)
    const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('total')
        .eq('user_id', user.id)
        .eq('status', 'Paid')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

    if (invError) console.error('Error fetching revenue:', invError);
    const revenue = (invoices || []).reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    // 2. Get Expenses (Receipts)
    const { data: receipts, error: recError } = await supabase
        .from('receipts')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

    if (recError) console.error('Error fetching expenses:', recError);
    const expenses = (receipts || []).reduce((sum, rec) => sum + (Number(rec.amount) || 0), 0);

    const profit = revenue - expenses;
    const taxEstimate = profit > 0 ? profit * 0.30 : 0; // Simplified 30% tax rate

    return {
        revenue,
        expenses,
        profit,
        taxEstimate
    };
}

export async function getMonthlyData(year: number): Promise<MonthlyData[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Initialize all months
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(year, i, 1).toLocaleString('de-DE', { month: 'short' }),
        revenue: 0,
        expenses: 0,
        profit: 0
    }));

    // 1. Revenue
    const { data: invoices } = await supabase
        .from('invoices')
        .select('total, date')
        .eq('user_id', user.id)
        .eq('status', 'Paid')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

    (invoices || []).forEach(inv => {
        const monthIndex = new Date(inv.date).getMonth();
        months[monthIndex].revenue += Number(inv.total) || 0;
    });

    // 2. Expenses
    const { data: receipts } = await supabase
        .from('receipts')
        .select('amount, date')
        .eq('user_id', user.id)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

    (receipts || []).forEach(rec => {
        const monthIndex = new Date(rec.date).getMonth();
        months[monthIndex].expenses += Number(rec.amount) || 0;
    });

    // Calculate Profit
    return months.map(m => ({
        ...m,
        profit: m.revenue - m.expenses
    }));
}
