"use client";

import OfferForm from '@/components/OfferForm';

export default function EditOfferPage({ params }: { params: { id: string } }) {
    return <OfferForm params={params} />;
}
