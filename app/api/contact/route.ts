import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fullName, email, phoneNumber, request: message } = data;

    // Validate required fields
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }



      return NextResponse.json({ error: 'Email functionality has been removed.' }, { status: 501 });
    } catch (error) {
      console.error('Email submission error:', error);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
  }
}
