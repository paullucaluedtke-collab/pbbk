"use client";

import { useState } from 'react';
import { Customer } from '@/types/invoice';
import { createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customerActions';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import styles from '@/app/page.module.css'; // Reuse existing styles

interface CustomerManagerProps {
    initialCustomers: Customer[];
}

export default function CustomerManager({ initialCustomers }: CustomerManagerProps) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [loading, setLoading] = useState(false);

    const handleCreate = () => {
        setFormData({});
        setIsCreating(true);
        setIsEditing(null);
    };

    const handleEdit = (customer: Customer) => {
        setFormData(customer);
        setIsEditing(customer.id);
        setIsCreating(false);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setIsEditing(null);
        setFormData({});
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (isCreating) {
                if (!formData.name) return alert('Name ist erforderlich');

                const newCustomer = await createCustomer({
                    name: formData.name,
                    address: formData.address || '',
                    email: formData.email || '',
                    tax_id: formData.tax_id || ''
                });

                setCustomers([...customers, newCustomer]);
                setIsCreating(false);
            } else if (isEditing) {
                if (!formData.name) return alert('Name ist erforderlich');

                const updated = await updateCustomer(isEditing, {
                    name: formData.name,
                    address: formData.address,
                    email: formData.email,
                    tax_id: formData.tax_id
                });

                setCustomers(customers.map(c => c.id === isEditing ? updated : c));
                setIsEditing(null);
            }
            setFormData({});
        } catch (error) {
            console.error(error);
            alert('Fehler beim Speichern');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Diesen Kunden wirklich löschen?')) return;

        setLoading(true);
        try {
            await deleteCustomer(id);
            setCustomers(customers.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            alert('Fehler beim Löschen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Kunden</h1>
                <button onClick={handleCreate} className={styles.primaryButton} disabled={isCreating || !!isEditing}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> Neuer Kunde
                </button>
            </div>

            {isCreating && (
                <div className={styles.card} style={{ marginBottom: '2rem', border: '2px solid #0070f3' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Neuer Kunde</h3>
                    <CustomerForm
                        data={formData}
                        onChange={setFormData}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            )}

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {customers.map(customer => (
                    <div key={customer.id} className={styles.card} style={{ position: 'relative' }}>
                        {isEditing === customer.id ? (
                            <CustomerForm
                                data={formData}
                                onChange={setFormData}
                                onSave={handleSave}
                                onCancel={handleCancel}
                                loading={loading}
                            />
                        ) : (
                            <>
                                <h3 style={{ marginTop: 0 }}>{customer.name}</h3>
                                {(customer.address || customer.email || customer.tax_id) && (
                                    <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
                                        {customer.address && <p style={{ margin: '0.2rem 0' }}>{customer.address}</p>}
                                        {customer.email && <p style={{ margin: '0.2rem 0' }}>{customer.email}</p>}
                                        {customer.tax_id && <p style={{ margin: '0.2rem 0' }}>Steuer-ID: {customer.tax_id}</p>}
                                    </div>
                                )}
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleEdit(customer)}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                                        title="Bearbeiten"
                                    >
                                        <Edit2 size={16} color="#666" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        style={{ padding: '0.5rem', border: '1px solid #fdd', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                                        title="Löschen"
                                    >
                                        <Trash2 size={16} color="#c62828" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {customers.length === 0 && !isCreating && (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '4rem' }}>
                    <p>Noch keine Kunden angelegt.</p>
                </div>
            )}
        </div>
    );
}

function CustomerForm({ data, onChange, onSave, onCancel, loading }: any) {
    const handleChange = (field: string, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Name*</label>
                <input
                    type="text"
                    value={data.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    className={styles.input}
                    style={{ width: '100%', padding: '0.5rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Adresse</label>
                <textarea
                    value={data.address || ''}
                    onChange={e => handleChange('address', e.target.value)}
                    className={styles.input}
                    style={{ width: '100%', padding: '0.5rem', height: '80px', fontFamily: 'inherit' }}
                />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>E-Mail</label>
                    <input
                        type="email"
                        value={data.email || ''}
                        onChange={e => handleChange('email', e.target.value)}
                        className={styles.input}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Steuer-ID / USt-IdNr.</label>
                    <input
                        type="text"
                        value={data.tax_id || ''}
                        onChange={e => handleChange('tax_id', e.target.value)}
                        className={styles.input}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                    onClick={onCancel}
                    disabled={loading}
                    style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <X size={16} /> Abbrechen
                </button>
                <button
                    onClick={onSave}
                    disabled={loading}
                    className={styles.primaryButton}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <Save size={16} /> Speichern
                </button>
            </div>
        </div>
    );
}
