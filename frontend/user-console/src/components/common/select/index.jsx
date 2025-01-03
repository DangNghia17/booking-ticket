/* eslint-disable no-unused-vars */
import React, { Component }  from 'react';
import { Select as AntSelect } from "antd";
import { orderBy } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setCategoryId,
  setDateType,
  setProvince,
  setStatus,
  setDate,
} from "../../../redux/slices/filterSlice";
import { isNotEmpty } from "../../../utils/utils";
import { useFetchCategories } from "../../../api/services/categoryServices";
export function Select(props) {
  const { data, icon, type, defaultValue } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const keys = isNotEmpty(data) && Object.keys(Object.assign({}, ...data));
  const { data: categories, status } = useFetchCategories();
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.filter.filter);
  function handleValue(value) {
    if (type === "location") {
      if (value === "others") {
        return dispatch(setProvince("others"));
      }
      return dispatch(setProvince(value));
    }
    if (type === "category") {
      if (value === null) {
        navigate("/events");
        return dispatch(setCategoryId(null));
      } else {
        return dispatch(setCategoryId(value));
      }
    }
    if (type === "status") {
      return dispatch(setStatus(value));
    }
    if (type === "date") {
      return dispatch(setDate(value));
    }
  }
  const validatedData = orderBy(
    data,
    [(user) => user[keys[1]].toLowerCase()],
    ["asc"]
  );
  return (
    <div className="select-container">
      {icon}
      <AntSelect
        style={{
          width: "100%",
        }}
        defaultValue={defaultValue}
        bordered={false}
        value={
          type === "location"
            ? filter.province
            : type === "category"
            ? filter.category
            : type === "status"
            ? filter.status
            : filter.date
        }
        onChange={handleValue}
      >
        {validatedData?.map((item, index) => (
          <AntSelect.Option key={index} value={item[keys[0]]}>
            {t(item[keys[1]])}
          </AntSelect.Option>
        ))}
      </AntSelect>
    </div>
  );
}
