import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ratingSelector, updateRating } from "../../redux/slices/eventSlice";
function RatingStar({ value = 0 }) {
  const { t } = useTranslation();
  const labels = {
    0: "rate.none",
    1: "rate.bad",
    2: "rate.avg",
    3: "rate.good",
    4: "rate.excellent",
    5: "rate.perfect",
  };
  const dispatch = useDispatch();
  const ratingInfo = useSelector(ratingSelector);
  const validValue = Number.isFinite(value) ? value : 0;
  return (
    <div className="flex items-center gap-2">
      <Rating
        name="simple-controlled"
        value={validValue}
        onChange={(event, newValue) => {
          dispatch(
            updateRating({
              ...ratingInfo,
              star: newValue,
            })
          );
        }}
      />
      <p>{t(labels[validValue])}</p>
    </div>
  );
}

export default RatingStar;
