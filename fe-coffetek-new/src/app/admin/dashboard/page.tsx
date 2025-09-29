import DashboardCards from "@/components/features/DashboardCards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
    return (
        <div className="space-y-6 py-4">
            {/* Cards thống kê */}
            <DashboardCards />

            {/* Biểu đồ (placeholder) */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Chart Placeholder
                    </div>
                </CardContent>
            </Card>

            {/* Bảng đơn hàng gần đây */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>#1024</TableCell>
                                <TableCell>John Doe</TableCell>
                                <TableCell>Completed</TableCell>
                                <TableCell className="text-right">$250</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>#1025</TableCell>
                                <TableCell>Jane Smith</TableCell>
                                <TableCell>Pending</TableCell>
                                <TableCell className="text-right">$180</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>#1026</TableCell>
                                <TableCell>Michael Lee</TableCell>
                                <TableCell>Cancelled</TableCell>
                                <TableCell className="text-right">$90</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
