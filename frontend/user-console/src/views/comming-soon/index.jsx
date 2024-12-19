import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Header from "../../components/common/header";
import FooterComponent from "../../components/FooterComponent";
import HelmetHeader from "../../components/helmet";
import HomeDrawer from "../../components/home-drawer";
import ComingSoonImage from "../../assets/Dreaming.svg";

function CommingSoon() {
  const { t } = useTranslation();
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const location = useLocation();

  // Xác định nội dung dựa trên route hiện tại
  const getContent = () => {
    switch (location.pathname) {
      case '/contact':
        return {
          title: t("org.contact"),
          content: (
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-lg text-gray-600 mb-4">
                Email: support@lotusticket.com
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Hotline: 1900 xxxx
              </p>
              <p className="text-lg text-gray-600">
                Địa chỉ: 123 Nguyễn Văn Linh, Phường Vĩnh Trung, Quận Thanh Khê, TP.Đà Nẵng
              </p>
            </div>
          )
        };
      case '/help-center':
        return {
          title: t("org.faq"),
          content: (
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-left space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Làm thế nào để đặt vé?</h3>
                  <p className="text-gray-600">Chọn sự kiện → Chọn loại vé → Thanh toán → Nhận vé qua email</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Các hình thức thanh toán?</h3>
                  <p className="text-gray-600">Chúng tôi chấp nhận thanh toán qua VNPay và PayPal</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Chính sách hoàn tiền?</h3>
                  <p className="text-gray-600">Vui lòng liên hệ hotline để được hỗ trợ về vấn đề hoàn tiền</p>
                </div>
              </div>
            </div>
          )
        };
      case '/about':
        return {
          title: t("org.about"),
          content: (
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-lg text-gray-600 mb-6">
                Lotus Ticket là nền tảng đặt vé sự kiện hàng đầu tại Việt Nam, 
                cung cấp dịch vụ đặt vé trực tuyến cho các sự kiện giải trí, 
                thể thao, âm nhạc và nhiều lĩnh vực khác.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <h3 className="font-bold text-2xl text-blue-600">1M+</h3>
                  <p className="text-gray-600">Người dùng</p>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-2xl text-blue-600">5K+</h3>
                  <p className="text-gray-600">Sự kiện</p>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-2xl text-blue-600">100+</h3>
                  <p className="text-gray-600">Đối tác</p>
                </div>
              </div>
            </div>
          )
        };
      default:
        return {
          title: t("coming-soon"),
          content: null
        };
    }
  };

  const pageContent = getContent();

  return (
    <>
      <HelmetHeader title={pageContent.title} content={pageContent.title} />
      <Header />
      <div className="w-full min-h-[60vh] flex flex-col justify-center items-center my-4 px-4">
        <h1 className="font-bold text-4xl text-[#1f3e82] mb-8">
          {pageContent.title}
        </h1>
        {pageContent.content || (
          <img src={ComingSoonImage} className="w-[40vw]" alt="commingsoon" />
        )}
      </div>
      <HomeDrawer
        toggleDrawer={toggleDrawer}
        onClose={() => setToggleDrawer(false)}
      />
      <FooterComponent
        toggleDrawer={toggleDrawer}
        setToggleDrawer={setToggleDrawer}
      />
    </>
  );
}

export default CommingSoon;
