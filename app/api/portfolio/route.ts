import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PortfolioItem, { type IPortfolioItem } from '@/models/PortfolioItem';
import { createSuccessResponse, createErrorResponse, isValidString } from '@/lib/utils';
import type { ApiResponse } from '@/app/types/api';

export async function GET(): Promise<NextResponse<ApiResponse<IPortfolioItem[]>>> {
  try {
    await connectDB();
    const portfolioItems = await PortfolioItem.find({}).sort({ title: 1 }).lean();
    
    return createSuccessResponse(portfolioItems, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch portfolio items';
    return createErrorResponse(errorMessage, 500, 'FETCH_ERROR');
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<IPortfolioItem>>> {
  try {
    await connectDB();
    const body = await request.json();
    
    // Input validation
    if (!isValidString(body.title)) {
      return createErrorResponse('Title is required and must be a non-empty string', 400, 'VALIDATION_ERROR');
    }
    
    const portfolioItem = await PortfolioItem.create({
      title: body.title.trim(),
      image: body.image?.trim() || '',
      description: body.description?.trim() || undefined,
      videoLink: body.videoLink?.trim() || undefined,
      demoLink: body.demoLink?.trim() || undefined,
      technologies: body.technologies?.map((t: string) => t.trim()) || undefined,
    });
    
    return createSuccessResponse(portfolioItem, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create portfolio item';
    return createErrorResponse(errorMessage, 500, 'CREATE_ERROR');
  }
}

