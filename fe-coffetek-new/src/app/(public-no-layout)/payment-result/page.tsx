// page.tsx
"use client";

import React, { Suspense } from "react";
import PaymentResultPageContent from "./PaymentResultPageContent";

const PaymentResultPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <PaymentResultPageContent />
    </Suspense>
);

export default PaymentResultPage;
