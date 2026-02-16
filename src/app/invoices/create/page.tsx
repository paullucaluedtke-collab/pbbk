import { getCustomers } from '@/app/actions/customerActions';
import InvoiceForm from '@/components/InvoiceForm';

export const dynamic = 'force-dynamic';

export default async function CreateInvoicePage() {
    const customers = await getCustomers();

    return <InvoiceForm customers={customers} />;
}
