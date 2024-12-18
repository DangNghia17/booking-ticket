import { Empty, Input } from "antd";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import { BiSearchAlt } from "react-icons/bi";
import { GrMore } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setKeyword,
  setSearchResults,
  keywordsSelector,
} from "../../../redux/slices/searchSlice";
import { isEmpty } from "../../../utils/utils";
const SearchBox = (props) => {
  const { data, placeholder } = props;
  const location = useLocation();
  const keyword = useSelector(keywordsSelector);
  const [keywordsArray, setResultSplit] = useState([]);
  const [expand, setExpand] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ref = useRef();
  // framer motion
  const container = {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };
  const fuse = new Fuse(data, {
    isCaseSensitive: false,
    findAllMatches: true,
    includeMatches: true,
    includeScore: true,
    useExtendedSearch: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
    shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    keys: [
      "name",
      "venue",
      "startingDate",
      "eventCategoryList.name",
      "province",
    ],
  });
  const results = data ? fuse.search(keyword) : [];
  useEffect(() => {
    dispatch(setSearchResults(results));
    const arraySplit = keyword.split(" ");
    setResultSplit(arraySplit);
  }, [keyword]);
  return (
    <div className="SearchBox" ref={ref}>
      <Input
        className="relative rounded w-full h-full py-[10px] px-4"
        prefix={<BiSearchAlt fontSize={20} className="cursor-pointer mr-3" />}
        value={keyword}
        placeholder={placeholder}
        onChange={({ currentTarget }) => {
          dispatch(setKeyword(currentTarget.value));
          if (location.pathname === "/events") {
            navigate(`/events?search=${currentTarget.value}`);
          }
        }}
        style={{ padding: "0.5rem" }}
        allowClear
      />
      {keyword && results && results.length > 0 && (
        <motion.ul
          className="SearchBox_Results_List"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <p className="search-result-header">
            {t("search.result", { val: results.length })}
          </p>
          {results.map((result) => {
            const item = result.item;

            if (!item) return null;
            
            return (
              <div
                key={`search-${item.id}`}
                className="SearchBox_Results_List_Item"
                onClick={() => {
                  navigate(`/event/${item.id}`);
                }}
              >
                <img
                  src={item.background}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://salt.tkbcdn.com/ts/ds/03/21/08/2aff26681043246ebef537f075e2f861.png";
                  }}
                />
                <div className="event-info">
                  <div>
                    <Highlighter
                      highlightClassName="search-highlight"
                      className="event-name"
                      searchWords={keywordsArray}
                      autoEscape={true}
                      textToHighlight={item.name || ""}
                    />
                  </div>
                  <div className="event-details">
                    <span className="date">
                      {item.startingDate} • {item.venue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {results.length > 5 && (
            <li
              className="view-all-link"
              onClick={() => {
                navigate(`/events?search=${keyword}`);
              }}
            >
              {t("search.view-all")}
              <GrMore />
            </li>
          )}
        </motion.ul>
      )}
      {keyword && results.length === 0 && (
        <motion.ul
          className="SearchBox_Results_List"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <li className="p-4 text-center">
            <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{
                height: 60,
                margin: "0 auto"
              }}
              description={
                <span className="text-gray-500">{t("search.empty")}</span>
              }
            />
          </li>
        </motion.ul>
      )}
    </div>
  );
};
SearchBox.propTypes = {
  isExpand: PropTypes.bool,
  placeholder: PropTypes.string,
};
SearchBox.defaultProps = {
  isExpand: true,
};
export default SearchBox;
