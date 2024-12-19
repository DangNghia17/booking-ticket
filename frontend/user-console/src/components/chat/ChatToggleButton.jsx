import React from 'react';
import PropTypes from 'prop-types';

const ChatToggleButton = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`chat-button fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:bg-primary/90 ${
        isOpen ? "rotate-360" : ""
      }`}
    >
      <img 
        src="https://cdni.iconscout.com/illustration/premium/thumb/happy-chat-bot-illustration-download-in-svg-png-gif-file-formats--artificial-intelligence-robot-pack-science-technology-illustrations-7207939.png"
        alt="Chat Bot"
        className="w-12 h-12 object-contain p-1"
      />
    </button>
  );
};

ChatToggleButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default ChatToggleButton; 