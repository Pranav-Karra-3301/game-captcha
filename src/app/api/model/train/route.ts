import { NextRequest, NextResponse } from 'next/server';
import { trainModel, TrainingData } from '@/lib/tensorflow/model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainingData, epochs } = body as { trainingData: TrainingData, epochs?: number };
    
    if (!trainingData || !trainingData.inputs || !trainingData.outputs) {
      return NextResponse.json(
        { error: 'Invalid training data format' },
        { status: 400 }
      );
    }
    
    const result = await trainModel(trainingData, epochs);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error training model:', error);
    return NextResponse.json(
      { error: 'Failed to train model' },
      { status: 500 }
    );
  }
}