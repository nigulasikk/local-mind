import { getLocalFiles, initVectorStoreFromLocalTempFiles } from './data';
import { searchAndAsk } from './askLLM';


(async () => {
    // await getLocalFiles();
      const vectorStore = await initVectorStoreFromLocalTempFiles();
      // const answer = await searchAndAsk(vectorStore, 'chatgpt能做什么？');
      const answer = await searchAndAsk(vectorStore, 'gpt4应用领域有那些');
      console.log('answer:', answer);
    })();
    
    