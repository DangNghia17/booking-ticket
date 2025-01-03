package com.nghia.bookingevent.utils;

import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.payload.response.EventViewResponse;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class DateUtils {

    public static <T> List<T> sortListByDateAsc(List<T> objects, Function<T, String> dateExtractor) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Comparator<T> comparator = Comparator.comparing(obj -> LocalDate.parse(dateExtractor.apply(obj), formatter));
        return objects.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    public static List<Event> sortEventByDateAsc(List<Event> events) {
        return sortListByDateAsc(events, Event::getStartingDate);
    }
    public static List<EventViewResponse> sortEventViewResponseByDateAsc(List<EventViewResponse> events) {
        return sortListByDateAsc(events, EventViewResponse::getStartingDate);
    }
    /**
     * get current time
     *
     * @return converted time format
     */
    public static String getStringToday() {
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        String dateString = formatter.format(currentTime);
        return dateString;
    }

    /**
     * Convert string date to date
     *
     * @param dateStr string date
     * @return
     */
    public static Date stringToDate(String dateStr) {
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        try {
            return formatter.parse(dateStr);
        } catch (ParseException e) {
            return null;
        }
    }

    /**
     * date to string
     *
     * @param date
     * @return
     */
    public static String dateToString(Date date) {
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        return formatter.format(date);
    }

    /**
     * The interval between two time points (minutes)
     *
     * @param before start time
     * @param after end time
     * @return the interval between two time points (minutes)
     */
    public static long compareMin(Date before, Date after) {
        if (before == null || after == null) {
            return 0l;
        }
        long dif = 0;
        if (after.getTime() >= before.getTime()) {
            dif = after.getTime() - before.getTime();
        } else if (after.getTime() < before.getTime()) {
            dif = after.getTime() + 86400000 - before.getTime();
        }
        dif = Math.abs(dif);
        return dif / 60000;
    }
    public static boolean isAfterToday(String date ){
        Date today = new Date();
        Date startDate = null;
        try {
            startDate = stringToDate(date);

            if(startDate.after(today) || isToday(date)){
                return true;
            }
            return false;
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }public static boolean isBeforeToday(String date ){
        Date today = new Date();
        Date startDate = null;
        startDate = stringToDate(date);

        try {
            if(startDate.before(today) && !isToday(date)){
                return true;
            }
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        return false;
    }
    public static boolean isToday(String date) throws ParseException {
        Calendar today = Calendar.getInstance();
        Calendar specifiedDate  = Calendar.getInstance();
        Date startDate = stringToDate(date);
        specifiedDate.setTime(startDate);

        return today.get(Calendar.DAY_OF_MONTH) == specifiedDate.get(Calendar.DAY_OF_MONTH)
                &&  today.get(Calendar.MONTH) == specifiedDate.get(Calendar.MONTH)
                &&  today.get(Calendar.YEAR) == specifiedDate.get(Calendar.YEAR);
    }
    /**
     * Get the time after the specified interval in minutes
     *
     * The time specified by @param date
     * @param min interval minutes
     * @return time after interval minutes
     */
    public static Date addMinutes(Date date, int min) {
        if (date == null) {
            return null;
        }

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.MINUTE, min);
        return calendar.getTime();
    }

    /**
     * Return to the specified term according to the time, entertain yourself, and adjust it yourself
     *
     * @param hourday hour
     * @return
     */
    public static String showTimeView(int hourday) {
        if (hourday >= 22 && hourday <= 24) {
            return "night";
        } else if (hourday >= 0 && hourday <= 6) {
            return "early morning";
        } else if (hourday > 6 && hourday <= 12) {
            return "AM";
        } else if (hourday > 12 && hourday < 22) {
            return "afternoon";
        }
        return null;
    }
}
