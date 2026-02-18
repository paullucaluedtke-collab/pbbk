"use server";

import { createClient } from '@/lib/supabaseServer';
import { Customer } from '@/types/customer';
import { revalidatePath } from 'next/cache';

export async function getCustomers(): Promise<Customer[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id) // Ensure RLS is respected/explicit
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }

    return data as Customer[];
}

export async function getCustomer(id: string): Promise<Customer | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) return null;
    return data as Customer;
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'user_id' | 'created_at'>): Promise<Customer> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('customers')
        .insert({
            ...customer,
            user_id: user.id
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating customer:', error);
        throw new Error(error.message);
    }

    revalidatePath('/customers');
    return data as Customer;
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating customer:', error);
        throw new Error(error.message);
    }

    revalidatePath('/customers');
    revalidatePath(`/customers/${id}`);
    return data as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting customer:', error);
        throw new Error(error.message);
    }

    revalidatePath('/customers');
}
