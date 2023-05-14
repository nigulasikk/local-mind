import { NextResponse } from 'next/server';
import {getLocalFiles,} from '@/scripts/data';
import {getFileName} from '@/utils/file';
import { Document } from 'langchain/document';

export async function GET(request: Request) {
  try {
    const filesDocs = await getLocalFiles();
    /** 格式化 本地文件元数据信息 */
    const files = filesDocs.map((doc: Document) => {
      return {
        fileName: getFileName(doc.metadata.source),
        totalPages: doc.metadata.pdf_numpages,
      }
    });
    return NextResponse.json( files );
  } catch (error: any) {
   
    return NextResponse.error();
  }
}
