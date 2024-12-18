import React from "react";
import ScrollToTop from "react-scroll-to-top";
import { BiArrowToTop } from "react-icons/bi";
import PropTypes from "prop-types";
import theme from "../../shared/theme";
const ScrollToTopPage = ({ top }) => {
  return (
    <ScrollToTop
      smooth
      style={{ background: theme.main, width: 40, height: 40 }}
      top={top}
      className="heartbeat mb-16"
      component={
        <div className="text-white text-[1.5rem] flex items-center justify-center">
          <BiArrowToTop />
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
