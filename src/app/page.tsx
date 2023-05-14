"use client";
import React, {useState,  ChangeEvent, FormEvent, useEffect} from 'react';
import axios  from  'axios';

type messageType = 'robot' | 'user' | 'robot-loading';

type Message = {
  text: string;
  type: messageType;
  avatar: string;
  reference?: string;
  similiarAnswers?: string[];
};

type TFile = {
  fileName: string;
  totalPages: number;
};

const messages: Message[] = [
  {
    text: '你好，我是 Local Mind 文件管家。你可以问我任何本地文件内容相关的问题。',
    type: 'robot',
    avatar: 'https://i.328888.xyz/2023/05/10/iY601o.png',
 
  },
  // {
  //   text: 'Local Mind 是XXXXXXXXXXXX',
  //   type: 'robot',
  //   avatar: 'https://i.328888.xyz/2023/05/10/iY601o.png',
  //   reference: '[xxx.pdf] 这里是另一些引用的相关内容或者信息。',
  //   similiarAnswers: [
  //     '如何恢复已删除的文件?',
  //     '如何分享文件?',
  //     '如何创建新的文件夹?'
  //   ]
  // },
];



const IndexPage = () => {
  const [messageText, setMessageText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  /** 已扫描到的文件列表 */
  const [scannedFiles, setScannedFiles] = useState<TFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  const refreshFiles = async () => {
    setLoadingFiles(true);
    axios.get('/api/getFiles').then( fileRes => {
     setScannedFiles(fileRes?.data || []);
     setLoadingFiles(false);
    })
  };

  useEffect( () => {
    refreshFiles();
  }, []);

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageText(event.target.value);
  };

  /** 点击发送按钮 */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (messageText.trim() === '') return;
  
    // 1. 添加用户消息
    setChatMessages([
      ...chatMessages,
      {
        type: 'user',
        text: messageText,
        avatar: 'https://i.328888.xyz/2023/05/10/iYz155.jpeg',
      },
    ]);

    /** 清空输入框内容 */
    setMessageText('');

  
    // 2. 添加 loading 状态的机器人消息
    setChatMessages([
      ...chatMessages,
      {
        type: 'user',
        text: messageText,
        avatar: 'https://i.328888.xyz/2023/05/10/iYz155.jpeg',
      },
      {
        type: 'robot-loading',
        text: 'Loading...',
        avatar: 'https://i.328888.xyz/2023/05/10/iY601o.png',
      },
    ]);
    /** 用 try catch 兼容问答后端出异常的情况 */
    try {
      const chatResult = await axios.post('/api/chat', {
        data: {ask: messageText}
      });
  
      // Replace loading message with the actual message from the robot
      setChatMessages(prevMessages => {
        let messages = [...prevMessages];

        messages[messages.length - 1] = {
          type: 'robot',
          text: chatResult.data.text,
          avatar: 'https://i.328888.xyz/2023/05/10/iY601o.png',
          reference: chatResult.data.reference,
          similiarAnswers: chatResult.data.similiarAnswers,
        };
        return messages;
      });
    } catch (error: any) {
      setChatMessages(prevMessages => {
        let messages = [...prevMessages];
        messages[messages.length - 1] = {
          type: 'robot',
          text: `抱歉，服务器开小差了： ${error}`,
          avatar: 'https://i.328888.xyz/2023/05/10/iY601o.png',
        };
        return messages;
      });
    }
  };
  



  return (
    <div className="local-mind-chat-container  min-h-screen py-20">
      <div className="flex  container mx-auto">
        <div className="flex flex-col w-1/4 mr-4  h-[80vh] min-w-250">
              <div className="flex justify-between text-[14px] bg-opacity-80 bg-black text-white text-2xl font-semibold px-8 p-4 rounded-2xl rounded-b-none ">
                <span>
                已扫描到的文件 {
                  !!scannedFiles?.length && `(${scannedFiles.length})`
                }
                  </span>
                <a 
                className="text-blue-500 hover:text-blue-400 cursor-pointer"
                onClick={ async () => {
                  setLoadingFiles(true);
                  setScannedFiles([]);
                  /** 本地文件初始化，建立向量数据库 */
                  // await axios.get('/api/initVectorStore');
                  /** 重新刷新文件 */
                  refreshFiles();
                }}
                >刷新</a>
              </div>
              <div className="flex-grow bg-opacity-60 bg-black py-4 px-8 h-80 overflow-y-auto rounded-2xl rounded-t-none">
              {
              loadingFiles &&   <div className="ml-2 flex space-x-3 justify-center ">
                    <div className="h-2 w-2 bg-green-100 rounded-full animate-bounce200"></div>
                    <div className="h-2 w-2 bg-green-100 rounded-full animate-bounce400"></div>
                    <div className="h-2 w-2 bg-green-100 rounded-full animate-bounce"></div>
                  </div> }
                <ul className="text-white ">
                  {scannedFiles.map((file, index) => (
                  <li key={index} className="mb-2 text-[12px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {index + 1} {file.fileName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        <div className="w-3/4 shadow-2xl flex flex-col" >
          <div className="flex items-center rounded-2xl rounded-b-none bg-opacity-80 bg-black  text-white text-2xl font-semibold  px-8 p-4">
            Local Mind<div className="text-sm">「你的本地文件管家」</div>
          </div>
          <div className="flex-grow bg-opacity-60 bg-black   messages overflow-y-auto h-80 py-4  px-8">
            {chatMessages.map((msg, index) => {
            if (msg.type === 'robot-loading') {
              return (
                <div key={index} className="flex items-start mb-4">
                  <div className="flex flex-col space-y-2 text-xs mx-2 order-2 items-start">
                    <div className="max-w-xs">
                      <div className="text-white opacity-80 pb-2">
                        Local Mind 文件管家
                      </div>
                      <div className="py-2 rounded-lg inline-block bg-gradient-to-r bg-opacity-40 bg-black text-white rounded-tl-none">
                        <div className='px-4 flex items-center'>
                          思考中
                          <div className="ml-2 flex space-x-3 ">
                                <div className="h-2 w-2 bg-green-100 rounded-full animate-bounce200"></div>
                                <div className="h-2 w-2 bg-green-100 rounded-full animate-bounce400"></div>
                                <div className="h-2 w-2 bg-green-100 rounded-full animate-bounce"></div>
                              </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <img src={msg.avatar} alt="用户头像" className="w-12 h-12 rounded-full order-1" />
                </div>
              );
            }
              return msg.type === 'robot' ? (
                <div key={index} className="flex items-start mb-4">
                <div className="flex flex-col space-y-2 text-xs mx-2 order-2 items-start">
                  <div className="max-w-xs">
                    <div className="text-white opacity-80 pb-2">
                      Local Mind 文件管家
                    </div>
                    <div className=" py-2 rounded-lg inline-block bg-gradient-to-r bg-opacity-40 bg-black text-white rounded-tl-none">
                      <div className='px-4'>
                        {msg.text}
                      </div>
                      {msg.reference &&  <div className='px-4' >
                      <div className="border border-gray-200 rounded p-2 mt-2 mb-2 bg-gray-600  text-white">
                          <div className="font-bold">以上回答参考来源：</div>
                          <p className="p-1">{msg.reference}</p>
                        </div>
                      </div>
                      }
                      {msg.similiarAnswers && 
                    <>
                      <hr className="opacity-60 border-gray-400 border-t-1 w-full" />
                      <div className="max-w-xs rounded py-1  px-4 mt-1 text-white">
                        <h3 className="font-bold mb-1">你可能还会问：</h3>
                        <ul>
                          {msg.similiarAnswers.map((question, index) => (
                            <li key={index} className="my-1">
                              <a 
                              href="#" 
                              className="text-blue-500 hover:text-blue-400 transition-colors"
                              onClick={e => {
                                setMessageText(question); 
                              }}
                              >{question}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  }
                    </div>
                  </div>
                </div>
                <img src={msg.avatar} alt="机器人头像" className="w-12 h-12 rounded-full order-1" />
              </div>
              ) : (
                <div key={index} className="flex items-start justify-end mb-4">
                  <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                    <div>
                    <div className=" text-white pb-2 text-right">
                        我
                      </div>
                      <div className="px-4 py-2 rounded-lg inline-block  bg-opacity-60  bg-black text-white rounded-tr-none">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                  <img src={msg.avatar} alt="提问者头像" className="w-12 h-12 rounded-full order-2" />
                </div>
              );
            })}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex h-12  items-center bg-opacity-80 bg-black rounded-2xl rounded-t-none">
              <input
                type="text"
                value={messageText}
                onChange={handleMessageChange}
                className="w-full bg-transparent text-white outline-none  placeholder-grey pl-4 pr-20"
                placeholder="输入本地文件内容相关问题进行提问..."
              />
              <button className="w-24 mr-6   text-white  font-semibold bg-green-500 py-2 px-4 rounded">发送</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;