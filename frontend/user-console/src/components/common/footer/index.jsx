/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppConfig from "../../../configs/AppConfig";
import Lincense from "../../../assets/license.png";
import { BsTelephoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
const { MENU_ORG, SOCIAL_MENU } = AppConfig;
const PAYPAL_LOGO = "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png";
const VNPAY_LOGO = "https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg";

function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <footer className="p-4 bg-white sm:p-6 dark:bg-gray-900 footer-container">
      <div className="md:flex md:justify-between w-full">
        <div className="mb-6 md:mb-0 md:w-1/4">
          <a href="/" className="flex items-center">
            <img
              src={process.env.PUBLIC_URL + "/logo.png"}
              className="mr-3 h-12"
              alt="Lotus Ticket Logo"
              onClick={() => navigate("/")}
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
              Lotus Ticket
            </span>
          </a>
          <h1 className="self-center mt-2 text-white">{t("lotus.slogan")}</h1>
        </div>

        <div className="mb-6 md:mb-0 md:w-1/4">
          <div className="text-white">
            <h2 className="font-semibold text-lg mb-2 text-white">{t("footer.customer_support")}</h2>
            <ul className="space-y-2">
              <li className="text-gray-200 hover:text-[#FFD933] cursor-pointer">
                {t("footer.refund_policy")}
              </li>
              <li className="text-gray-200 hover:text-[#FFD933] cursor-pointer">
                {t("footer.booking_guide")}
              </li>
            </ul>
          </div>
          
          <div className="mt-4">
            <h2 className="text-white font-semibold text-lg mb-2">{t("footer.payment_partners")}</h2>
            <div className="flex items-center gap-4">
              <img 
                src={PAYPAL_LOGO} 
                alt="PayPal" 
                className="h-8 bg-white rounded-md p-1"
              />
              <img 
                src={VNPAY_LOGO} 
                alt="VNPay" 
                className="h-8 bg-white rounded-md p-1"
              />
            </div>
          </div>
        </div>

        <div className="footer-grid md:w-2/4">
          <div className="sm:w-[300px]">
            <h1 className="text-white font-semibold text-lg mb-1">
              {t("lotus.hotline-title")}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <BsTelephoneFill className="text-sm font-semibold text-gray-200" />
              <span className="text-sm text-gray-200">
                {t("lotus.hotline")}
              </span>
            </div>
            <span className="text-xl font-semibold text-[#FFD933]">
              1900 xxxx
            </span>
            <h1 className="text-white font-semibold text-lg mt-2 mb-2">
              {t("lotus.email-title")}
            </h1>
            <div className="flex items-center gap-2">
              <MdEmail className="text-sm font-semibold text-gray-200" />
              <span className="text-sm text-gray-200">
                lotusticketvn2gmail.com
              </span>
            </div>
          </div>
          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase text-white">
              {t("org.menu")}
            </h2>
            <ul className="text-gray-200 dark:text-gray-400">
              {MENU_ORG.map((item, index) => (
                <li className="mb-4" key={index}>
                  <a href={item.link} className="hover:underline" target="_blank">
                    {t(item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase text-white">
              {t("lotus.follow-us")}
            </h2>
            <ul className="text-gray-600 text-gray-400 flex gap-x-2">
              {SOCIAL_MENU.map((item, index) => (
                <a href={item.link} key={index}>
                  {item.icon}
                </a>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-300 lg:my-8" />
      <div className="flex items-center justify-center text-gray-400">
        <span className="text-sm sm:text-center dark:text-gray-400">
          © Nghia Dang 2024{" "}
          <a href="/" className="hover:underline">
            Lotus Ticket™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
