import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CustomPDFLoader } from '../utils/PDFLoader';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";

/** 本地默认文件路径 */
const  LOCAL_FILE_PATH = 'files';
const LOCAL_VENCTOR_DATA_PATH = "./vectorData/";

/** 获取本地文件 */
async function getLocalFiles(){
  const directoryLoader = new DirectoryLoader(LOCAL_FILE_PATH, {
    '.pdf': (path) => new CustomPDFLoader(path),
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
  });

  /** 文件执行加载，得到 Document */
  const fileDocs = await directoryLoader.load();

  return fileDocs;

}


/** 加载本地固定 目录文件 */
async function initVectorStore(){
      /** 文件执行加载，得到 Document */
      const rawDocs = await getLocalFiles();
      /* 文字 转 切片 */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
  
      /** 切片文档 */
      const docs = await textSplitter.splitDocuments(rawDocs);

      /** 创建和存储 vectorStore 嵌入, 这个步骤会生成向量数据（按 token 计费，给 openai 送钱） */
      const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({
          verbose: true,
      }));
      /** 初始化完数据库后，存成本地文件 */
      await vectorStore.save(LOCAL_VENCTOR_DATA_PATH);
      console.log('向量数据库初始化成功!');
      return vectorStore;
}

/** 从 本地 文件初始化 仓库  */
async  function  initVectorStoreFromLocalTempFiles() {
    /**  从本地文件 */
        const loadedVectorStore = await HNSWLib.load(
          LOCAL_VENCTOR_DATA_PATH,
            new OpenAIEmbeddings()
        );
        return loadedVectorStore;  
       
}



export {
  initVectorStore,
  initVectorStoreFromLocalTempFiles,
  getLocalFiles
}
