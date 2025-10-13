// app/test/page.tsx

import { SuspenseWrapper } from "@/components/commons";
// test SuspenseWrapper
async function fetchData() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return { message: '✅ Dữ liệu đã tải xong!' };
}

async function DataComponent() {
    const data = await fetchData();
    return <h2>{data.message}</h2>;
}

export default function Page() {
    return (
        <SuspenseWrapper >
            <DataComponent />
        </SuspenseWrapper>
    );
}
