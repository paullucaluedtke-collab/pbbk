export interface Subscription {
    id: string;
    customer_id: string;
    interval: 'monthly' | 'quarterly' | 'yearly';
    next_run: string;
    status: 'active' | 'paused' | 'cancelled';
    template_data: {
        items: any[];
        // Add other template fields as needed
        footer_text?: string;
    };
    created_at?: string;
    // Joined fields
    customers?: {
        name: string;
    };
}
