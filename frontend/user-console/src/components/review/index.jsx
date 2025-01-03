/* eslint-disable react-hooks/exhaustive-deps */
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import orderServices from "../../api/services/orderServices";
import reviewServices, {
  useFetchReviewList,
} from "../../api/services/reviewServices";
import {
  tokenSelector,
  userInfoSelector,
} from "../../redux/slices/accountSlice";
import {
  isFeedbackSelector,
  ratingSelector,
  setIsFeedback,
  updateRating,
} from "../../redux/slices/eventSlice";
import { hideBadWords } from "../../utils/badwords";
import { isNotEmpty } from "../../utils/utils";
import {
  AlertError,
  AlertErrorPopup,
  AlertPopup,
  AlertQuestion,
} from "../common/alert";
import Feedback from "../feedback-box";
import FeedbackComment from "../feedback-item";
import FeedbackList from "../feedback-list";
import RatingStats from "../rating-stats";
import Unauthenticated from "../unauthenticated";
const { getOrderListByUserId } = orderServices;
const { checkExistReview, deleteReview, submitReview, editReview } =
  reviewServices;
function Review() {
  const token = useSelector(tokenSelector);
  const isFeedback = useSelector(isFeedbackSelector);
  const ratingInfo = useSelector(ratingSelector);
  const [isEdit, setIsEdit] = useState(false);
  const [paidTicket, setPaidTicket] = useState(false);
  const user = useSelector(userInfoSelector);
  const [reviewList, setReviewList] = useState([]);
  const [fullReviews, setFullReviews] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const dispatch = useDispatch();
  const { eventId } = useParams();
  const {
    data: allReviews,
    status: allReviewsStatus,
    isLoading,
  } = useFetchReviewList(eventId);
  const { t } = useTranslation();
  useEffect(() => {
    async function fetchOrderListByUser() {
      if (user) {
        const fetchOrderListByUser = await getOrderListByUserId(user.id);
        const idEventExists = fetchOrderListByUser.some(
          (item) => item.idEvent === eventId
        );
        setPaidTicket(idEventExists);
      }
    }
    fetchOrderListByUser();
  }, [user]);
  useEffect(() => {
    if (allReviewsStatus === "success" && allReviews?.status !== 404) {
      setFullReviews(allReviews.data);
    } else {
      setFullReviews([]);
    }
  }, [allReviewsStatus]);
  useEffect(() => {
    if (token && user) {
      const checkExistFeedback = async () => {
        try {
          const response = await checkExistReview(user.id, eventId);
          
          // Cập nhật logic kiểm tra feedback tồn tại
          const hasFeedback = response.status === 404; // Đảo ngược logic vì 404 nghĩa là đã có feedback
          dispatch(setIsFeedback(hasFeedback));
          
          if (hasFeedback) {
            // Nếu có feedback, cập nhật state để hiển thị
            const existingFeedback = allReviews?.data?.find(
              review => review.email === user.email
            );
            if (existingFeedback) {
              setUserFeedback([existingFeedback]);
            }
          }
        } catch (error) {
          console.error('Error checking feedback:', error);
          dispatch(setIsFeedback(false));
        }
      };
      
      checkExistFeedback();
    }
  }, [token, user, eventId, allReviews]);

  // Thêm useEffect để log reviews khi có thay đổi
  useEffect(() => {
    if (allReviews?.data) {
     
    }
  }, [allReviews, userFeedback]);

  // count stars
  useEffect(() => {
    if (user && isNotEmpty(allReviews)) {
      const reviewListTemp =
        allReviews.data.length > 0
          ? allReviews?.data.filter((e) => e.email !== user.email)
          : [];
      const feedbackInfo =
        allReviews.data.length > 0
          ? allReviews?.data.filter((e) => e.email === user.email)
          : [];
      setReviewList(reviewListTemp);
      setUserFeedback(feedbackInfo);
    }
  }, [user, isLoading, allReviews]);
  // delete review
  const handleDelete = () => {
    AlertQuestion({
      title: t("popup.review.delete"),
      callback: async (result) => {
        if (result.isConfirmed) {
          const response = await deleteReview(user.id, eventId);
          if (response.status === 200) {
            AlertPopup({
              title: t("popup.review.delete-success"),
              timer: 3000,
            });
          } else {
            AlertErrorPopup({
              title: t("popup.review.delete-failed"),
              timer: 3000,
            });
          }
        }
      },
    });
  };
  // submit feedback
  const handleSubmit = async () => {
    try {
      const response = await submitReview(user.id, {
        avatar: user.avatar,
        name: user.name,
        email: user.email,
        idEvent: eventId,
        message: ratingInfo.message,
        rate: ratingInfo.star,
      });

      if (response.status === 200) {
        AlertPopup({
          title: t("popup.review.submit-success"),
        });
        
        // Cập nhật state để hiển thị feedback mới
        const newFeedback = {
          avatar: user.avatar,
          name: user.name,
          email: user.email,
          message: ratingInfo.message,
          rate: ratingInfo.star,
          createdAt: new Date().toISOString()
        };
        
        setUserFeedback([newFeedback]);
        dispatch(setIsFeedback(true));
      } else {
        AlertError({ title: t("popup.review.submit-failed") });
      }
      
      dispatch(
        updateRating({
          star: 5,
          message: "",
        })
      );
    } catch (error) {
      console.error('Submit review error:', error);
      AlertError({ title: t("popup.review.submit-failed") });
    }
  };

  // edit feedback
  const handleUpdate = async () => {
    const response = await editReview(user.id, {
      avatar: user.avatar,
      name: user.name,
      email: user.email,
      idEvent: eventId,
      message: ratingInfo.message,
      rate: ratingInfo.star,
    });

    if (response.status === 200) {
      AlertPopup({
        title: t("popup.review.update-success"),
      });
    } else {
      AlertError({ title: t("popup.review.update-failed") });
    }
    dispatch(
      updateRating({
        star: 5,
        message: "",
      })
    );
    setIsEdit(false);
  };
  return (
    <div className="w-full h-full review-container mr-6">
      <RatingStats reviewList={allReviews} paidTicket={paidTicket} />
      <div className="mx-4">{!token && <Unauthenticated />}</div>

      <div className="mx-4">
        {token && isFeedback && userFeedback?.length > 0 && paidTicket && !isEdit && (
          <>
            <p className="text-[#1f3e82] font-bold text-2xl py-2">
              {t("your-feedback")}
            </p>
            <FeedbackComment
              avatar={user.avatar}
              name={user.name}
              message={hideBadWords(userFeedback[0]?.message || "")}
              rate={userFeedback[0]?.rate}
              isCurrentUser={isFeedback}
              setIsEditing={setIsEdit}
              onDelete={handleDelete}
              time={moment(userFeedback[0]?.createdAt).fromNow()}
            />
            <hr className="mb-4" />
          </>
        )}
        {token && isFeedback && userFeedback && paidTicket && isEdit && (
          <Feedback
            message={ratingInfo.message}
            star={ratingInfo.rate}
            isEditting={isEdit}
            onCancel={setIsEdit}
            onUpdate={handleUpdate}
            user={user}
          />
        )}
        {token && !isFeedback && paidTicket && userFeedback && !isEdit && (
          <Feedback
            isEditting={isEdit}
            star={ratingInfo.star}
            message={ratingInfo.message}
            onCancel={setIsEdit}
            onSubmit={handleSubmit}
            user={user}
          />
        )}
      </div>
      <div className="mx-10">
        <FeedbackList
          feedbacks={token && !isLoading ? reviewList : fullReviews}
          isFeedbackByCurrentUser={isFeedback}
        />
      </div>
    </div>
  );
}

export default Review;
