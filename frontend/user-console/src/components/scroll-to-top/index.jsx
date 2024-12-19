import React from "react";
import ScrollToTop from "react-scroll-to-top";
import { BiArrowToTop } from "react-icons/bi";
import PropTypes from "prop-types";
import theme from "../../shared/theme";

const ScrollToTopPage = ({ top }) => {
  return (
    <ScrollToTop
      smooth
      style={{
        background: theme.main,
        width: 48,
        height: 48,
        right: "5rem",
        bottom: "1rem",
        position: "fixed",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        border: "none",
        transformOrigin: "50% 50%"
      }}
      top={top}
      className="heartbeat hover:opacity-90"
      component={
        <div className="text-white text-[1.5rem] flex items-center justify-center">
          <BiArrowToTop size={25} />
        </div>
      }
    />
  );
};

ScrollToTopPage.propTypes = {
  top: PropTypes.number,
};

ScrollToTopPage.defaultProps = {
  top: 10000,
};

export default ScrollToTopPage;
