"use client";

import { Suspense } from 'react';
import OfferForm from '@/components/OfferForm';

export default function EditOfferPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div>Lade Formular...</div>}>
            <OfferForm params={params} />
        </Suspense>
    );
}
