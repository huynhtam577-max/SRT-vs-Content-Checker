import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Since we can't install uuid, I'll implement a simple generator below
import { AppStep, Message, Sender } from './types';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { compareContentWithSrt } from './services/geminiService';

// Simple UUID generator since we can't use external node modules easily in this strict environment
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<AppStep>(AppStep.REQUEST_ORIGINAL);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [srtContent, setSrtContent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Bot Message
  useEffect(() => {
    addMessage(Sender.BOT, "Chào bạn. Cho tôi file Content gốc của bạn?", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender: Sender, content: string, isMarkdown: boolean = false) => {
    const newMessage: Message = {
      id: generateId(),
      sender,
      content,
      timestamp: new Date(),
      isMarkdown
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserResponse = async (text: string) => {
    // 1. Add User Message
    addMessage(Sender.USER, text.length > 300 ? `${text.substring(0, 300)}... (Đã nhận nội dung)` : text);

    // 2. Process based on current step
    if (step === AppStep.REQUEST_ORIGINAL) {
      setOriginalContent(text);
      setStep(AppStep.REQUEST_SRT);
      // Simulate Bot thinking/typing delay slightly for realism
      setTimeout(() => {
        addMessage(Sender.BOT, "Ok. Tiếp theo hãy cung cấp file SRT chưa hoàn thiện cho tôi.");
      }, 500);
    } 
    else if (step === AppStep.REQUEST_SRT) {
      setSrtContent(text);
      setStep(AppStep.PROCESSING);
      
      setTimeout(() => {
        addMessage(Sender.BOT, "Ok, cảm ơn bạn, tôi đã nhận đủ Content gốc và SRT chưa hoàn thiện. Bây giờ tôi sẽ tiến hành rà soát...");
        processComparison(originalContent, text); // Use current text as SRT since state update is async
      }, 500);
    }
  };

  const processComparison = async (original: string, srt: string) => {
    try {
      const result = await compareContentWithSrt(original, srt);
      addMessage(Sender.BOT, result, true); // Render output as markdown
      setStep(AppStep.COMPLETED);
    } catch (error) {
      addMessage(Sender.BOT, "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý. Vui lòng làm mới trang và thử lại.");
      setStep(AppStep.ERROR);
    }
  };

  const resetProcess = () => {
    setMessages([]);
    setOriginalContent('');
    setSrtContent('');
    setStep(AppStep.REQUEST_ORIGINAL);
    setTimeout(() => {
        addMessage(Sender.BOT, "Cho tôi file Content gốc của bạn?");
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
             </div>
             <div>
                <h1 className="text-xl font-bold text-gray-900">SRT Content Auditor</h1>
                <p className="text-xs text-gray-500">Powered by Gemini AI</p>
             </div>
          </div>
          {(step === AppStep.COMPLETED || step === AppStep.ERROR) && (
              <button 
                onClick={resetProcess}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Làm mới
              </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                    Đang khởi động...
                </div>
            )}
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {step === AppStep.PROCESSING && (
                <div className="flex w-full mb-4 justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        <span className="text-sm text-gray-500 ml-2">Đang rà soát lỗi...</span>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <InputArea 
        onSend={handleUserResponse} 
        disabled={step === AppStep.PROCESSING || step === AppStep.COMPLETED || step === AppStep.ERROR}
        placeholder={
            step === AppStep.REQUEST_ORIGINAL ? "Dán nội dung Content Gốc hoặc tải file..." :
            step === AppStep.REQUEST_SRT ? "Dán nội dung SRT hoặc tải file..." :
            "Vui lòng đợi..."
        }
      />
    </div>
  );
};

export default App;
