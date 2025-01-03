import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import "moment/locale/vi";
import { useTranslation } from "react-i18next";
import { titleCase } from "../../utils/utils";
function Calendar(props) {
  const { className, calendar } = props;
  const calendarDate = typeof calendar === 'string' ? calendar : moment(calendar).format('DD/MM/YYYY');
  const dateFormat = (moment.defaultFormat = "DD/MM/YYYY");
  const { t } = useTranslation();
  var language = localStorage.getItem("i18nextLng");
  if (language === "en") {
    moment.locale("en");
  } else {
    moment.locale("vi");
  }
  var isToday = false;
  if (
    moment(calendarDate, dateFormat).format(dateFormat) ===
    moment().format(dateFormat)
  ) {
    isToday = true;
  }
  const calendarObj = {
    dayOfWeek: isToday
      ? t("date.today")
      : moment(calendarDate, dateFormat).format("dddd"),
    day: moment(calendarDate, dateFormat).format("D"),
    month: moment(calendarDate, dateFormat).format("MMMM"),
  };
  return (
    <div className={`${className} relative calendar-container`}>
      <div className="calendar-upper">
        <h1 className="text-[0.8rem] text-white calendar-month">
          {titleCase(calendarObj.month)}
        </h1>
      </div>
      <h1 className="font-bold text-5xl">{calendarObj.day}</h1>
      <h1
        className={
          isToday
            ? "text-[0.75rem] font-bold calendar-dayOfWeek text-red-600"
            : "text-[0.75rem] font-bold calendar-dayOfWeek"
        }
      >
        {titleCase(calendarObj.dayOfWeek)}
      </h1>
    </div>
  );
}
Calendar.propTypes = {
  calendar: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object  // Để chấp nhận moment object
  ]).isRequired,
};
Calendar.defaultProps = {
  calendar: moment(),
};
export default Calendar;
