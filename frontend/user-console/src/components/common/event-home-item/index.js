/* eslint-disable jsx-a11y/alt-text */
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PlaceholderCover from "../../../assets/cover-fallback.jpg";
import AppConfig from "../../../configs/AppConfig";
import { Rating } from "@mui/material";
import { useFetchReviewList } from "../../../api/services/reviewServices";
import { EventStatus } from "../../../utils/constants";
import { displayRatingStar, isNotEmpty } from "../../../utils/utils";
function EventHomeItem(props) {
  const { event } = props;
  const { data: reviewList, isLoading } = useFetchReviewList(event?.id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const goToEventDetail = () => {
    navigate(`/event/${event.id}`);
  };
  const showRating = !isLoading && 
    reviewList?.data && 
    Array.isArray(reviewList.data) &&
    reviewList.data.length > 0 && 
    event?.status === EventStatus.COMPLETED;
  const rating = showRating ? displayRatingStar(reviewList) : 0;
  return (
    <div
      className="event-home-item-container cursor-test float cursor-pointera"
      onClick={(e) => {
        e.preventDefault();
        goToEventDetail();
      }}
    >
      <img
        src={event?.background || PlaceholderCover}
        style={{ height: 180, width: 320 }}
        className="event-home-item-image"
      />
      <h1 className="w-full mb-2 event-home-item-name">{event.name}</h1>
      <div className="flex justify-start gap-x-8 items-end">
        <div>
          <span className="font-medium text-sm">{event.startingDate}</span>
          <div className="flex items-center justify-start gap-x-2">
            {event.eventCategoryList?.map((category, index) => (
              <h2 
                key={`category-${category.id || index}`} 
                className="font-thin text-sm text-gray-400"
              >
                {t(category.name)}
              </h2>
            ))}
          </div>
        </div>
        <span className="text-xs font-medium text-gray-400 tracking-wide">
          {t("sold-ticket", {
            val: event?.ticketTotal - event?.ticketRemaining,
          })}
        </span>
      </div>
      {showRating && (
        <div className="flex items-center gap-x-2">
          <span>{rating}/5</span>
          <Rating
            name="size-small"
            value={Number(rating)}
            precision={0.5}
            readOnly
            size="small"
          />
        </div>
      )}
      <div>
        <strong className="text-xl">{event.price}</strong>
      </div>
    </div>
  );
}
EventHomeItem.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    background: PropTypes.string,
    startingDate: PropTypes.string,
    ticketTotal: PropTypes.number,
    ticketRemaining: PropTypes.number,
    price: PropTypes.string,
    status: PropTypes.string,
    eventCategoryList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string
      })
    )
  }).isRequired
};
EventHomeItem.defaultProps = {
  event: PropTypes.shape({
    image: AppConfig.DEFAULT_PROPS.EVENT.image,
    title: AppConfig.DEFAULT_PROPS.EVENT.title,
    price: AppConfig.DEFAULT_PROPS.EVENT.price,
    categories: AppConfig.DEFAULT_PROPS.EVENT.categories,
  }),
  status: "HOT",
};
export default EventHomeItem;
