/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import HelmetHeader from "../../components/helmet";
import LanguageSwitch from "../../components/language-switch";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, FormikProvider, useFormik } from "formik";
import { YupValidations } from "../../utils/validate";
import { Col, Row } from "antd";
import { Input } from "../../components/common/input/customField";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { AlertErrorPopup, AlertPopup } from "../../components/common/alert";
// import OtpInput from "../../components/common/otp";
import OTPInput from 'react-otp-input';
import authServices from "../../api/services/authServices";
import { isNotEmpty } from "../../utils/utils";
import ThreeDotsLoading from "../../components/loading/three-dots";
import { useDispatch, useSelector } from "react-redux";
import { emailSelector, setEmail } from "../../redux/slices/accountSlice";
const { forgotPassword, verifyOTP } = authServices;
function ForgotPassword() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = useSelector(emailSelector);
  const dispatch = useDispatch();
  const [showOTPInput, setShowOTPInput] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object().shape({
      email: YupValidations.email,
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const { email } = values;
        setLoading(true);
        dispatch(setEmail(email));
        const response = await forgotPassword({ email });
        
        if (isNotEmpty(response)) {
          setLoading(false);
        }
        
        if (response.status === 404) {
          AlertErrorPopup({
            title: t("status.forgot.404"),
            text: response.message || "Email không tồn tại"
          });
        }
        
        if (response.status === 200) {
          setShowOTPInput(true);
          AlertPopup({
            title: t("popup.email.title"),
            text: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).",
            timer: 5000,
          });
        }
      } catch (error) {
        console.error('Error during forgot password:', error);
        AlertErrorPopup({
          title: "Lỗi",
          text: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại sau."
        });
      } finally {
        setLoading(false);
      }
    },
  });
  const formikOTP = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object().shape({
      otp: Yup.string()
        .required(t("validate.otp.required"))
        .min(6, t("validate.otp.min"))
        .matches(/^\d+$/, t("validate.otp.min"))
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      const { otp } = values;
      const response = await verifyOTP({ email, otpCode: otp });

      if (response.status === 200) {
        setLoading(false);
        AlertPopup({
          title: t("status.verify.200"),
        });
        navigate("/new-password");
      } else {
        setLoading(false);
        AlertErrorPopup({
          title: t("status.verify.404"),
        });
      }
    },
  });
  const { handleSubmit } = formik;
  const { handleSubmit: handleSubmitOTP } = formikOTP;
  return (
    <>
      <HelmetHeader title={t("pages.forgot-password")} content="Login" />
      <div className="auth-container">
        <img
          src={process.env.PUBLIC_URL + "logo-color.png"}
          alt="logo"
          className="brand-logo absolute top-5 left-5 w-[10vw] z-10"
          onClick={() => navigate("/")}
        />
        <LanguageSwitch className="absolute top-5 right-5 z-10" />
        <div className="auth-content">
          <FormikProvider value={showOTPInput ? formikOTP : formik}>
            <Form
              className="auth-form"
              onSubmit={showOTPInput ? handleSubmitOTP : handleSubmit}
            >
              <Row className="leading-8">
                <h1 className="auth-title mb-2">{t("user.forgot-password")}</h1>
              </Row>
              <Row
                align="middle"
                style={{
                  height: "auto",
                  display: "flex",
                  alignContent: "center",
                }}
                gutter={[0, 8]}
              >
                {!showOTPInput ? (
                  <Col flex={4} className="relative">
                    <AiOutlineQuestionCircle
                      className="absolute top-[7px] left-[3.5rem]"
                      data-toggle="tooltip"
                      data-placement="right"
                      title={t("user.forgot-password-tip")}
                    />
                    <Field component={Input} name="email" label={"Email"} />
                  </Col>
                ) : (
                  <Col flex={4} className="relative">
                    <OTPInput
                      value={formikOTP.values.otp}
                      onChange={value => formikOTP.setFieldValue('otp', value)}
                      numInputs={6}
                      renderInput={(props) => <input {...props} />}
                      inputStyle="otp-modal__input" 
                      containerStyle="otp-modal__input-container"
                      shouldAutoFocus
                      inputType="number"
                      separator={<span>&nbsp;</span>}
                      onBlur={() => formikOTP.setFieldTouched('otp', true)}
                    />
                    {formikOTP.touched.otp && formikOTP.errors.otp && (
                      <p className="error-message">
                        {formikOTP.errors.otp}
                      </p>
                    )}
                  </Col>
                )}
              </Row>
              <Col span={24}>
                <button className={"primary-button"} type="submit">
                  {loading ? <ThreeDotsLoading /> : t("submit")}
                </button>
              </Col>
            </Form>
          </FormikProvider>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
