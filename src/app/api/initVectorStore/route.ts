import { NextResponse } from 'next/server';
// import { initVectorStore } from '@/scripts/data';

export async function GET(request: Request) {
  try {
    // const initResult = await initVectorStore();
    return NextResponse.json( {} );

  } catch (error: any) {
   
    return NextResponse.error();
  }
}
