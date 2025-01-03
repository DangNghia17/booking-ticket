/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable quotes */
import { Alert, Col, Row, Switch, Select as AntSelect } from "antd";
import { Field, FieldArray, Form, FormikProvider, useFormik } from "formik";
import { decode, encode } from "js-base64";
import { has, map, sumBy } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import * as Yup from "yup";
import { useFetchCategories } from "../api/services/categoryServices";
import eventServices from "../api/services/eventServices";
import organizationServices, {
  useFetchTemplateTicket,
} from "../api/services/organizationServices";
import { Header } from "../components";
import { AlertErrorPopup, AlertPopup } from "../components/Alert";
import ThreeDotsLoading from "../components/ThreeLoading";
import UploadImage from "../components/Upload";
import {
  DatePicker,
  Input,
  Select,
  SelectHorizonal,
  TimePicker,
} from "../components/customField";
import { userInfoSelector } from "../redux/slices/accountSlice";
import { setInitialBackground } from "../redux/slices/eventSlice";
import constants, { TicketStatus } from "../utils/constants";
import { provinces } from "../utils/provinces";
import {
  convertMongodbTimeToString,
  generateId,
  isNotEmpty,
} from "../utils/utils";
import { YupValidations } from "../utils/validate";
import Editor from "./Editor";
const { getEventById, createEvent, uploadEventBackground, updateEvent } =
  eventServices;
const { createTemplateTicket } = organizationServices;
const { PATTERNS } = constants;

export const StyledSwitch = styled(Switch)`
  &&&.ant-switch-checked {
    background-color: #1f3e82;
  }
  &&&.ant-switch {
    outline: 1.2px solid gray;
  }
`;

function AddEditEvent(props) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [useTemplate, setUseTemplate] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [isOneDay, setIsOneDay] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [date, setDate] = useState(moment().format(PATTERNS.DATE_FORMAT));
  const user = useSelector(userInfoSelector);
  const [event, setEvent] = useState({});
  const { data: categories, status } = useFetchCategories();
  const { data: templateTickets, status: templateStatus } =
    useFetchTemplateTicket(user.id);
  const initialValues = {
    background: null,
    name: "",
    startingDate: moment(),
    endingDate: moment(),
    startingTime: moment(),
    eventCategoryList: [],
    endingTime: moment(),
    description: "",
    province: "",
    currency: "VND",
    // currency: "USD",
    venue: "",
    venue_address: "",
    ticketList: [
      {
        id: generateId(user.name, date),
        price: 0,
        ticketName: "",
        status: TicketStatus.AVAILABLE,
        description: "",
        currency: "VND",
        // currency: "USD",
        quantity: 0,
        quantityRemaining: 0,
      },
    ],
    modifyTimes: 0,
  };
  const handleTemplateTicket = () => {
    let newArr = [];
    if (isNotEmpty(templateTickets)) {
      for (const element of templateTickets) {
        newArr.push({
          id: generateId(user.name, date),
          ticketName: element?.ticketName,
          price: element?.price,
          description: element?.description,
          quantity: element?.quantity,
          quantityRemaining: element?.quantity,
          currency: element?.currency,
          // currency: "USD",
          status: "ticket.available",
        });
      }
    }
    return newArr;
  };
  const handleEventCategoryList = (list) => {
    return list.map(category => ({
      name: category
    }));
  };

  // console.log("currency", event?.organizationTickets[0].currency);
  const handleFormData = (value) => {
    var formData = new FormData();
    formData.append("file", value);
    return formData;
  };
  // single day
  const EventSchema = isOneDay
    ? Yup.object().shape({
        name: YupValidations.name,
        startingDate: YupValidations.startingDateSingleDay,
        startingTime: YupValidations.startingTime,
        eventCategoryList: YupValidations.categories,
        endingTime: YupValidations.endingTime,
        description: YupValidations.description,
        venue: YupValidations.venue,
        province: YupValidations.province,
        venue_address: YupValidations.address,
        ticketList: YupValidations.ticketList,
      })
    : Yup.object().shape({
        name: YupValidations.name,
        startingDate: YupValidations.startingDate,
        startingTime: YupValidations.startingTime,
        eventCategoryList: YupValidations.categories,
        endingDate: YupValidations.endingDate,
        endingTime: YupValidations.endingTime,
        description: YupValidations.description,
        venue: YupValidations.venue,
        province: YupValidations.province,
        venue_address: YupValidations.address,
        ticketList: YupValidations.ticketList,
      });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: EventSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const request = {
          name: values.name,
          description: encode(values.description),
          endingDate: moment(
            isOneDay ? values.startingDate : values.endingDate
          ).format(PATTERNS.DATE_FORMAT),
          endingTime: moment(values.endingTime).format(PATTERNS.TIME_FORMAT),
          startingDate: moment(values.startingDate).format(PATTERNS.DATE_FORMAT),
          startingTime: moment(values.startingTime).format(PATTERNS.TIME_FORMAT),
          eventCategoryList: handleEventCategoryList(values.eventCategoryList),
          province: values.province,
          venue: values.venue,
          venue_address: values.venue_address,
          organizationTickets: handleTicketList(values.ticketList),
          ticketTotal: sumBy(handleTicketList(values.ticketList), "quantity"),
          ticketRemaining: sumBy(handleTicketList(values.ticketList), "quantity"),
          host_id: user.id,
          modifyTimes: values.modifyTimes < 2 ? values.modifyTimes + 1 : 2,
        };
        
        if (saveTemplate) {
          await createTemplateTicket(user.id, request.organizationTickets);
        }
        if (!eventId) {
          let responseUpdate = await createEvent(user.id, request);
          if (responseUpdate.status === 200) {
            var uploadBackground = await uploadEventBackground(
              responseUpdate.data,
              user.id,
              handleFormData(values.background)
            );
          }

          if (responseUpdate?.status === 200) {
            formik.setValues(initialValues);
            setUseTemplate(false);
            dispatch(setInitialBackground(null));
            showNotification(true);
            navigate("/events");
          } else {
            showNotification(false);
          }
          setLoading(false);
        } else {
          let responseUpdate = await updateEvent(eventId, user.id, request);
          var uploadBackgroundUpdate =
            typeof values.background === "object" ??
            (await uploadEventBackground(
              eventId,
              user.id,
              handleFormData(values.background)
            ));
          setLoading(false);
          showNotification(
            responseUpdate.status === 200 || uploadBackgroundUpdate.status === 200
          );
          navigate("/events");
        }
      } catch (error) {
        console.error(error);
        AlertErrorPopup({
          title: t("popup.edit-event.error")
        });
      } finally {
        setLoading(false);
      }
    },
  });
  const { handleSubmit, setFieldValue, values, setValues } = formik;
  useEffect(() => {
    setDate(moment(values.startingDate).format(PATTERNS.DATE_FORMAT));
  }, [values.startingDate]);
  // For fetch template tickets
  useEffect(() => {
    if (useTemplate && useDefaultAddress) {
      setFieldValue("province", user.province);
      setFieldValue("venue", user.venue);
      setFieldValue("venue_address", user.address);
      setFieldValue("ticketList", handleTemplateTicket());
    } else if (useTemplate && !useDefaultAddress) {
      setFieldValue("ticketList", handleTemplateTicket());
    } else if (!useTemplate && useDefaultAddress) {
      setFieldValue("province", user.province);
      setFieldValue("venue", user.venue);
      setFieldValue("venue_address", user.address);
    }
    if (!useTemplate) {
      setFieldValue("ticketList", initialValues.ticketList);
    }
  }, [useTemplate, useDefaultAddress]);

  // For edit event
  useEffect(() => {
    if (eventId) {
      async function fetchEvent() {
        const res = await getEventById(eventId);
        setEvent(res);
        dispatch(setInitialBackground(res.background));
        setValues({
          background: res.background,
          name: res.name,
          currency: res.organizationTickets[0].currency,
          startingDate: moment(res.startingDate, PATTERNS.DATE_FORMAT),
          startingTime: moment(res.startingTime, PATTERNS.TIME_FORMAT),
          endingDate: moment(res.endingDate, PATTERNS.DATE_FORMAT),
          eventCategoryList: map(res.eventCategoryList, "id"),
          endingTime: moment(res.endingTime, PATTERNS.TIME_FORMAT),
          description: decode(res.description),
          province: res.province,
          venue: res.venue,
          venue_address: res.venue_address,
          ticketList: res.organizationTickets,
          modifyTimes: res.modifyTimes,
        });
      }
      fetchEvent();
    }
  }, []);
  const handleTicketList = (list) => {
    const newArr = list.map((t) => ({
      ...t,
      currency: values.currency,
      // currency: "USD",
      quantity: Number(t.quantity),
      quantityRemaining: Number(t.quantity),
      status:
        Number(t.quantity) === 0
          ? TicketStatus.SOLDOUT
          : TicketStatus.AVAILABLE,
    }));
    return newArr;
  };
  const showNotification = (code) => {
    if (code) {
      return AlertPopup({
        title: !eventId
          ? t("popup.create-event.success")
          : t("popup.edit-event.success"),
      });
    }
    return AlertErrorPopup({
      title: !eventId
        ? t("popup.create-event.error")
        : t("popup.edit-event.error"),
    });
  };

  const categoryOptions = status === "success" && categories ? 
    categories.map(category => ({
      label: t(category),
      value: category,
      key: category
    })) : [];

  const currencyOptions = [
    { value: "USD", label: "USD", key: "USD" },
    { value: "VND", label: "VND", key: "VND" }
  ].map((field) => ({
    value: field.value,
    name: field.label,
    key: field.key
  }));

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header
        category={eventId ? t("event.edit") : t("event.create")}
        title={t("sider.event")}
      />
      <div>
        <div className="flex justify-between w-full">
          <h1 className="font-medium text-lg text-gray-400">
            {eventId
              ? `${t("event.createDate")}${convertMongodbTimeToString(
                  event.createdDate
                )}`
              : null}
          </h1>
          <h1 className="font-medium text-lg text-gray-400">
            {has(event, "updatedDate") && event.updatedDate
              ? `${t("event.updateDate")}${convertMongodbTimeToString(
                  event.updatedDate
                )}`
              : null}
          </h1>
        </div>
        <Alert
          message={
            <p
              dangerouslySetInnerHTML={{
                __html: t("limited-modify-times", {
                  remainingTimes: 2 - values.modifyTimes,
                }),
              }}
            />
          }
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
        <FormikProvider value={formik}>
          <Form
            style={{
              width: "100%",
            }}
            onSubmit={handleSubmit}
          >
            <Row gutter={[48, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={24}>
                <Field
                  name="background"
                  component={UploadImage}
                  label={t("event.background")}
                />
              </Col>
            </Row>
            <Row gutter={[48, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={24}>
                <Field name="name" component={Input} label={t("event.name")} />
              </Col>
            </Row>
            <Row gutter={[48, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={24}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("event.category")}
                  </label>
                  <AntSelect
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder={t("event.select-category")}
                    options={categoryOptions}
                    value={formik.values.eventCategoryList}
                    onChange={(values) => {
                      formik.setFieldValue('eventCategoryList', values);
                    }}
                    className="w-full rounded-md"
                    optionFilterProp="label"
                    key={`category-select-${formik.values.eventCategoryList.length}`}
                  />
                  {formik.touched.eventCategoryList && formik.errors.eventCategoryList && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.eventCategoryList}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
            <div className="flex gap-x-3 items-center mb-4">
              <h1 className="text-primary text-xl font-semibold">
                {t("one-day")}
              </h1>
              <StyledSwitch
                defaultChecked={false}
                checked={isOneDay}
                onChange={(checked) => setIsOneDay(checked)}
              />
            </div>
            <Row gutter={[8, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={12}>
                <Field
                  name="startingDate"
                  component={DatePicker}
                  label={t("event.startingDate")}
                  disabled={values.modifyTimes >= 2 ? true : false}
                />
              </Col>
              <Col span={12}>
                {!isOneDay && (
                  <Field
                    name="endingDate"
                    component={DatePicker}
                    label={t("event.endingDate")}
                    disabled={values.modifyTimes >= 2 ? true : false}
                  />
                )}
              </Col>
            </Row>

            <Row gutter={[8, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={12}>
                <Field
                  name="startingTime"
                  component={TimePicker}
                  label={t("event.startingTime")}
                  disabled={values.modifyTimes >= 2 ? true : false}
                />
              </Col>

              <Col span={12}>
                <Field
                  name="endingTime"
                  component={TimePicker}
                  label={t("event.endingTime")}
                  disabled={values.modifyTimes >= 2 ? true : false}
                />
              </Col>
            </Row>
            <Row gutter={[8, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={12}>
                <Field
                  name="province"
                  component={Select}
                  label={t("event.province")}
                  options={Object.values(provinces).map((field) => ({
                    value: field.name,
                    name: field.name,
                    key: field.name
                  }))}
                />
              </Col>
              <Col span={12}>
                <Field
                  name="venue"
                  component={Input}
                  label={t("event.venue")}
                />
              </Col>
            </Row>
            <Row gutter={[48, 40]} style={{ lineHeight: "2rem" }}>
              <Col span={24}>
                <Field
                  name="venue_address"
                  component={Input}
                  label={t("event.venue_address")}
                />
              </Col>
            </Row>

            <Col span={8}>
              <div className="flex gap-x-3 items-center mb-4">
                <h1 className="text-primary text-xl font-semibold">
                  {t("default-address")}
                </h1>
                <StyledSwitch
                  defaultChecked={false}
                  checked={useDefaultAddress}
                  onChange={(checked) => setUseDefaultAddress(checked)}
                  className="my-4"
                />
              </div>
            </Col>
            <FieldArray name="ticketList">
              {(fieldArrayProps) => {
                const { push, remove, form } = fieldArrayProps;
                const { values } = form;
                return (
                  <>
                    <Row gutter={[8, 40]}>
                      <Col span={8}>
                        <button
                          className="primary-button self-start w-64"
                          onClick={() =>
                            push({
                              id: generateId(user.name, date),
                              price: 0,
                              ticketName: "",
                              status: TicketStatus.AVAILABLE,
                              description: "",
                              currency: values.currency,
                              // currency: "USD",
                              quantity: 0,
                              quantityRemaining: 0,
                            })
                          }
                        >
                          {t("ticket.create")}
                        </button>
                      </Col>
                      <Col span={8}>
                        <div className="flex gap-x-4">
                          <Field
                            name="currency"
                            component={SelectHorizonal}
                            label={t("event.currency")}
                            options={currencyOptions}
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="flex gap-x-3 items-center">
                          <h1 className="text-primary text-xl font-semibold">
                            {t("template-ticket")}
                          </h1>

                          <StyledSwitch
                            defaultChecked={false}
                            checked={useTemplate}
                            onChange={(checked) => setUseTemplate(checked)}
                          />
                        </div>
                      </Col>
                    </Row>
                    {values.ticketList?.map((ticket, index) => {
                      const ticketKey = ticket.id || ticket._id || `ticket-${index}-${Date.now()}`;
                      return (
                        <div 
                          key={ticketKey}
                          className="p-3 border-gray-400 border-4 border-dashed my-2 rounded-lg bg-gray-200 relative"
                        >
                          <Row gutter={[4, 24]} className="flex items-start">
                            <Col span={10}>
                              <Field
                                name={`ticketList[${index}].ticketName`}
                                component={Input}
                                label={t("event.ticketList.ticketName", {
                                  val: index + 1,
                                })}
                              />
                            </Col>
                            <Col span={6}>
                              <Field
                                name={`ticketList[${index}].price`}
                                component={Input}
                                label={t("event.ticketList.price", {
                                  val: index + 1,
                                })}
                              />
                            </Col>
                            <Col span={6}>
                              <Field
                                name={`ticketList[${index}].quantity`}
                                component={Input}
                                label={t("event.ticketList.quantity", {
                                  val: index + 1,
                                })}
                              />
                            </Col>
                          </Row>
                          <Row gutter={[8, 24]}>
                            <Col span={22}>
                              <Editor
                                name={`ticketList[${index}].description`}
                                label={t("event.ticketList.description", {
                                  val: index + 1,
                                })}
                              />
                            </Col>
                          </Row>
                          {values.ticketList.length > 1 && (
                            <FaTrashAlt
                              className="text-red-600 text-2xl absolute bottom-5 right-5 hover:animate-bounce cursor-pointer"
                              type="button"
                              onClick={() => {
                                if (values.ticketList.length > 1) {
                                  remove(index);
                                }
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              }}
            </FieldArray>
            <div className="flex gap-x-3 items-center mb-4">
              <h1 className="text-primary text-xl font-semibold">
                {t("save-template-ticket")}
              </h1>
              <StyledSwitch
                defaultChecked={false}
                onChange={(checked) => setSaveTemplate(checked)}
              />
            </div>
            <Row gutter={[48, 40]}>
              <Col span={24}>
                <Editor name="description" label={t("event.description")} />
              </Col>
            </Row>
            <Row gutter={[48, 40]} style={{ marginTop: "1rem" }}>
              <Col span={12}>
                <button className="primary-button font-bold" type="submit">
                  {loading ? <ThreeDotsLoading /> : t("Submit")}
                </button>
              </Col>
              <Col span={12}>
                <button
                  className="secondary-button border-primary border-1 text-primary bg-white font-bold"
                  type="submit"
                  onClick={() => formik.setValues(initialValues)}
                >
                  {t("Reset")}
                </button>
              </Col>
            </Row>
          </Form>
        </FormikProvider>
      </div>
    </div>
  );
}

export default AddEditEvent;
