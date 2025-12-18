import React from 'react';
import { Sender, Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
          isBot
            ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
            : 'bg-blue-600 text-white rounded-tr-none'
        }`}
      >
        <div className={`text-sm mb-1 opacity-70 ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
          {isBot ? 'App' : 'Tôi'}
        </div>
        <div className={`leading-relaxed whitespace-pre-wrap ${isBot ? 'prose prose-sm max-w-none text-gray-800' : ''}`}>
           {message.isMarkdown ? (
             <ReactMarkdown>{message.content}</ReactMarkdown>
           ) : (
             message.content
           )}
        </div>
      </div>
    </div>
  );
};
