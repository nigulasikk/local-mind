import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { getFileName } from "../utils/file";

interface IAsk {
  /** 提问 */
  question: string;
  /** 上下文 */
  referenceContext: string;
}

/** 调用 LLM 接口 */
async  function  askLLM({question, referenceContext}: IAsk) {
  //  LLM 用 openai
  const model = new OpenAI({ temperature: 0 });
  /** prompt 模板 */
  const prompt = PromptTemplate.fromTemplate(
    `作为一位专业的文档工程师，你的任务是从给定的上下文回答问题。
    你的回答应该基于我提供的上下文回答我的问题，并以对话的形式呈现。

    问题如下：
    {question}
    
    给定的上下文：
    {context}
    
    请综合上述信息,你给出的回复需要包含以下3个字段:
    1.text: 用于存放你总结性的文字回复,尽量精简
    2.similiarAnswers: 基于我提的问题联想2个不同维度的问题
    3.reference: 用于显示你参考的上下文原文, reference若不是一句完整的话，用省略号结尾，大概40个字左右

    请按照以下JSON格式来回答：

    前括号
      "text": "<这里放你的回答>",
      "similiarAnswers": [
          "<联想的问题1>",
          "<联想的问题2>"
      ]
      "reference": "<这里放你参考的上下文原文>",
    后括号
  
    最后强调一下：你的回复将直接用于javascript的JSON.parse解析，所以注意一定要以标准的JSON格式做回答，不要包含任何其他非JSON内容，否则你将被扣分！！！
    `,
  );

  // 通过 PromptTemplate + LLM 创建 chain
  const chain = new LLMChain({ 
    llm: model,
     prompt, 
    // verbose: true 
  });

  const res = await chain.call({ question, context: referenceContext });
  console.log('res log:', res);
  return res;

}

/** 先本地执行相似搜索，再向 LLM 发问 */
async  function  searchAndAsk(loadedVectorStore: HNSWLib, question: string) {
  /** 向量相似搜索 */
  const referenceContextDocuments = await loadedVectorStore.similaritySearch(question, 1);
  /** 向量搜索相似结果string化 */
 const contextString = (referenceContextDocuments || []).map(docItem => `[${getFileName(docItem.metadata.source)}] ${docItem.pageContent}`).join('/n')

  /** 带着本地信息， 向 LLM 发问 */  
  const llmAnswer = await askLLM({
    question, 
    referenceContext: contextString
  });


  return llmAnswer;
}

export {
  askLLM,
  searchAndAsk
}