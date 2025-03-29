import { NextRequest, NextResponse } from 'next/server';
import { predict } from '@/lib/tensorflow/model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs } = body as { inputs: number[] };
    
    if (!inputs || !Array.isArray(inputs)) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }
    
    const result = await predict(inputs);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error making prediction:', error);
    return NextResponse.json(
      { error: 'Failed to make prediction' },
      { status: 500 }
    );
  }
}