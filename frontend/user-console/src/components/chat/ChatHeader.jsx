import React from 'react';
import { useTranslation } from 'react-i18next';

const ChatHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="chat-header">
      <p className="text-white font-bold">Lotus Ticket Assistant</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
        <span className="text-sm">Online</span>
      </div>
    </div>
  );
};

export default ChatHeader; 