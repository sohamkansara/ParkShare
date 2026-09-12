import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error fetching booking by id:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (status === 'CHECKED_IN') dataToUpdate.actualCheckin = new Date();
    if (status === 'COMPLETED') dataToUpdate.actualCheckout = new Date();

    const updated = await db.booking.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        listing: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}
