import React from "react";

function LotusTicketLogo() {
  return (
    <svg
      className="container"
      viewBox="0 0 40 40"
      height="80"
      width="80"
    >
      <circle 
        className="track"
        cx="20" 
        cy="20" 
        r="17.5" 
        pathLength="100" 
        strokeWidth="5px" 
        fill="none" 
      />
      <circle 
        className="car"
        cx="20" 
        cy="20" 
        r="17.5" 
        pathLength="100" 
        strokeWidth="5px" 
        fill="none" 
      />
    </svg>
  );
}

export default LotusTicketLogo;
