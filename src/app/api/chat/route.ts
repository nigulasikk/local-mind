import { NextResponse } from 'next/server';
import {initVectorStoreFromLocalTempFiles } from '@/scripts/data';
import {searchAndAsk } from '@/scripts/askLLM';

export async function POST(request: Request) {
  try {
       /** 读取并解析请求体 */
       const requestBody = await request.text();
       const data = JSON.parse(requestBody);
      /** 提问text */
       const askText = data?.data?.ask;

    /** 从 本地 文件初始化 仓库, (从本地缓存文件初始数据库会省 token 消耗) */
    const vectorStore = await initVectorStoreFromLocalTempFiles();
    /** 本地向量搜索并向 LLM 发问 */
    const answer = await searchAndAsk(vectorStore, askText);

    try {
      let jsonObj = JSON.parse(answer.text);
      return NextResponse.json( jsonObj );
    } catch (error) {
      console.error('Invalid JSON string:', error);
      return NextResponse.json( {
        text: '对不起，解析过程中出了点问题，您可以尝试重新提问 ~',
        reference: answer.text
      } );
      // return NextResponse.error(  );
    }

  } catch (error: any) {
    /** 常见错误提醒 */
    let extraTip = '';
    if (error?.message === 'Network Error') {
      extraTip = '请检命令行工具是否处于科学的网络状态...'
    }
    return NextResponse.error();
  }
}
