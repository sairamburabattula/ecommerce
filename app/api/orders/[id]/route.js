import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, isPaid } = body;

        if (status !== undefined) {
            db.prepare('UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(status, id);
        }

        if (isPaid !== undefined) {
            db.prepare('UPDATE orders SET isPaid = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(isPaid ? 1 : 0, id);
        }

        return NextResponse.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
