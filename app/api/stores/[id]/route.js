import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, isActive } = body;

        if (status !== undefined) {
            const activeVal = status === 'approved' ? 1 : 0;
            db.prepare('UPDATE stores SET status = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(status, activeVal, id);
        }

        if (isActive !== undefined) {
            db.prepare('UPDATE stores SET isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(isActive ? 1 : 0, id);
        }

        return NextResponse.json({ success: true, message: 'Store updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
