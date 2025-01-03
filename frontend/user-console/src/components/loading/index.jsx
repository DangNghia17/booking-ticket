import React from "react";
import LotusTicketLogo from "../logo";
const Loading = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="loading-container">
      <div className="loading-page">
        <LotusTicketLogo />
      </div>
    </div>
  );
};

export default Loading;
