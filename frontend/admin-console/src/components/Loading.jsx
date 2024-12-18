import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 border-purple-200 border-2 rounded-full"></div>
        <div className="w-20 h-20 border-purple-700 border-t-2 animate-spin rounded-full absolute"></div>
      </div>
    </div>
  );
};

export default Loading;
