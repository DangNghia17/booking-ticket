import { Modal } from "antd";
import { t } from "i18next";
import React from "react";

// Sử dụng link trực tiếp thay vì import
const PAYPAL_LOGO = "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png";
const VNPAY_LOGO = "https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg";

function PaymentMethodModal({ isOpen, onClose, onSelectMethod, loading }) {
  return (
    <Modal
      title={t("payment.select_method")}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
    >
      <div className="flex flex-col gap-4">
        <button
          className="payment-method-btn flex items-center gap-3 p-4 border rounded-lg hover:border-primary"
          onClick={() => onSelectMethod("PAYPAL")}
          disabled={loading}
        >
          <img src={PAYPAL_LOGO} alt="PayPal" className="h-8" />
          <div className="flex flex-col text-left">
            <span className="font-medium">{t("payment.paypal.title")}</span>
            <span className="text-sm text-gray-500">
              {t("payment.paypal.description")}
            </span>
          </div>
        </button>

        <button
          className="payment-method-btn flex items-center gap-3 p-4 border rounded-lg hover:border-primary"
          onClick={() => onSelectMethod("VNPAY")}
          disabled={loading}
        >
          <img src={VNPAY_LOGO} alt="VNPay" className="h-8" />
          <div className="flex flex-col text-left">
            <span className="font-medium">{t("payment.vnpay.title")}</span>
            <span className="text-sm text-gray-500">
              {t("payment.vnpay.description")}
            </span>
          </div>
        </button>
      </div>
      
      {loading && (
        <div className="text-center mt-4 text-gray-500">
          {t("payment.processing")}
        </div>
      )}
    </Modal>
  );
}

export default PaymentMethodModal; 