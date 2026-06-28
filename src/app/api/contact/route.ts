import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  message: z.string().min(10).max(5000),
});

const limiter = rateLimit({ interval: 60000, maxRequests: 3 });

export async function POST(req: NextRequest) {
  // Rate limit
  const { success: rateOk } = limiter.check(req);
  if (!rateOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    // Try to save to database if Prisma is configured
    try {
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          message: data.message,
        },
      });
    } catch (dbError) {
      console.warn('Database not configured, skipping save:', dbError);
    }

    // Try to send email notification if Resend is configured
    try {
      if (process.env.RESEND_API_KEY) {
        const { sendContactNotification } = await import('@/lib/resend');
        await sendContactNotification(data);
      }
    } catch (emailError) {
      console.warn('Email notification failed:', emailError);
    }

    return NextResponse.json({ success: true, message: 'Message received!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
