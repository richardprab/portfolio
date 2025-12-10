import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience, { type IExperience } from '@/models/Experience';
import { createSuccessResponse, createErrorResponse, isValidString, isValidStringArray } from '@/lib/utils';
import type { ApiResponse } from '@/app/types/api';

export async function GET(): Promise<NextResponse<ApiResponse<IExperience[]>>> {
  try {
    await connectDB();
    const experiences = await Experience.find({}).lean();
    
    return createSuccessResponse(experiences, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch experiences';
    return createErrorResponse(errorMessage, 500, 'FETCH_ERROR');
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<IExperience>>> {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!isValidString(body.title)) {
      return createErrorResponse('Title is required and must be a non-empty string', 400, 'VALIDATION_ERROR');
    }
    
    if (!isValidStringArray(body.description)) {
      return createErrorResponse('Description is required and must be a non-empty array of strings', 400, 'VALIDATION_ERROR');
    }
    
    if (!isValidString(body.dates)) {
      return createErrorResponse('Dates is required and must be a non-empty string', 400, 'VALIDATION_ERROR');
    }
    
    if (body.technologies && !isValidStringArray(body.technologies)) {
      return createErrorResponse('Technologies must be an array of strings', 400, 'VALIDATION_ERROR');
    }
    
    const experience = await Experience.create({
      title: body.title.trim(),
      description: body.description.map((d: string) => d.trim()),
      dates: body.dates.trim(),
      image: body.image?.trim() || undefined,
      technologies: body.technologies?.map((t: string) => t.trim()) || undefined,
    });
    
    return createSuccessResponse(experience, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create experience';
    return createErrorResponse(errorMessage, 500, 'CREATE_ERROR');
  }
}

