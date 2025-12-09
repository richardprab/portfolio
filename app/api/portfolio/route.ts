import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PortfolioItem from '@/models/PortfolioItem';

export async function GET() {
  try {
    await connectDB();
    const portfolioItems = await PortfolioItem.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, data: portfolioItems },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const portfolioItem = await PortfolioItem.create(body);
    
    return NextResponse.json(
      { success: true, data: portfolioItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}

