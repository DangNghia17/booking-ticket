import React from "react";
import Fuse from "fuse.js";
import { Input } from "antd";
import { BiSearchAlt } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  setKeywordsArray,
  setTicketSearchList,
  searchTextSelector,
  setSearchText,
} from "../../redux/slices/generalSlice";

function SearchTicketBox({ data, placeholder }) {
  const searchText = useSelector(searchTextSelector);
  const dispatch = useDispatch();

  // Cấu hình Fuse.js
  const fuse = new Fuse(data || [], {
    keys: ['eventName'],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: true,
    shouldSort: true,
  });

  const handleSearch = (value) => {
    dispatch(setSearchText(value));
    
    if (!value.trim()) {
      dispatch(setTicketSearchList([]));
      return;
    }

    const results = fuse.search(value);

    
    const filteredResults = results.filter(result => result.score < 0.6);
    dispatch(setTicketSearchList(filteredResults));
  };

  return (
    <Input
      className="relative rounded w-[60vw] h-full py-[10px] px-4"
      prefix={<BiSearchAlt fontSize={20} className="cursor-pointer mr-3" />}
      value={searchText}
      placeholder={placeholder}
      onChange={(e) => handleSearch(e.target.value)}
      style={{ padding: "0.5rem" }}
      allowClear
    />
  );
}

export default SearchTicketBox;
