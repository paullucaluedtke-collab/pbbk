import { getCustomers } from '@/app/actions/customerActions';
import CustomerManager from '@/components/CustomerManager';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const customers = await getCustomers();

    return <CustomerManager initialCustomers={customers} />;
}
