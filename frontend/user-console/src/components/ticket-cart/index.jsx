/* eslint-disable react-hooks/exhaustive-deps */
import { t } from "i18next";
import { map, sumBy } from "lodash";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import paymentServices from "../../api/services/paymentServices";
import { userInfoSelector } from "../../redux/slices/accountSlice";
import {
  createOrderRequest,
  eventIdSelector,
  setErrors,
  ticketTypeSelector,
} from "../../redux/slices/ticketSlice";
import { formatter } from "../../utils/utils";
import { AlertErrorPopup } from "../common/alert";
import ThreeDotsLoading from "../loading/three-dots";
import TicketCartItem from "../ticket-cart-item";
import PaymentMethodModal from "../modals/payment-method-modal";
const { payOrder, checkOrderAvailability, payOrderVNPay } = paymentServices;

function TicketCart() {
  const tickets = useSelector(ticketTypeSelector);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const newArr = tickets.map((t) => ({
    ...t,
    totalPrice: t.ticketInCartQuantity * Number(t.price),
  }));
  const user = useSelector(userInfoSelector);
  const ticketCart = newArr.filter((ticket) => ticket.ticketInCartQuantity > 0);
  var currency = map(ticketCart, "currency")[0];
  const cartTotalPrice = sumBy(ticketCart, "totalPrice");
  const cartTotalQuantity = sumBy(ticketCart, "ticketInCartQuantity");
  const eventId = useSelector(eventIdSelector);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const convertToUSD = (vndAmount) => {
    // Tỷ giá cố định: 1 USD = 24,000 VND (bạn có thể thay đổi tỷ giá này)
    const exchangeRate = 24000;
    const usdAmount = vndAmount / exchangeRate;
    return usdAmount.toFixed(2); // Làm tròn đến 2 chữ số thập phân
  };

  const handleSelectPaymentMethod = async (method) => {
    try {
      setLoading(true);
      
      let paymentData = {
        price: cartTotalPrice.toString(),
        currency: currency
      };

      if (method === "PAYPAL" && currency === "VND") {
        paymentData = {
          price: convertToUSD(cartTotalPrice),
          currency: "USD"
        };
      }

      let paymentResponse;
      if (method === "PAYPAL") {
        paymentResponse = await payOrder(paymentData);
        if (paymentResponse.success && paymentResponse.data) {
          window.location.href = paymentResponse.data;
        }
      } else if (method === "VNPAY") {
        paymentResponse = await payOrderVNPay(paymentData);
        if (paymentResponse.success && paymentResponse.data) {
          // Load required scripts
          if (paymentResponse.data.scripts) {
            await Promise.all(
              paymentResponse.data.scripts.map(src => {
                return new Promise((resolve, reject) => {
                  const script = document.createElement('script');
                  script.src = src;
                  script.onload = resolve;
                  script.onerror = reject;
                  document.head.appendChild(script);
                });
              })
            );
          }
          // Redirect to payment URL
          window.location.href = paymentResponse.data.paymentUrl;
        }
      }

      if (!paymentResponse.success) {
        AlertErrorPopup({
          text: paymentResponse.message || "Payment initialization failed"
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      AlertErrorPopup({
        text: "Error processing payment. Please try again."
      });
    } finally {
      setShowPaymentModal(false);
      setLoading(false);
    }
  };

  const handlePayOrder = async () => {
    try {
      setLoading(true);
      
      const orderPayload = {
        createdDate: new Date().toISOString(),
        currency: map(ticketCart, "currency")[0],
        customerTicketList: handleTicketCart(ticketCart),
        email: user.email,
        idEvent: eventId,
        totalPrice: String(cartTotalPrice),
        totalQuantity: cartTotalQuantity
      };

      // Save order data to redux before payment
      dispatch(createOrderRequest(orderPayload));

      // Check availability
      const checkOrderResponse = await checkOrderAvailability(user.id, orderPayload);
      
      if (checkOrderResponse.status !== 200) {
        AlertErrorPopup({
          text: checkOrderResponse.message || "Error checking order"
        });
        return;
      }

      setShowPaymentModal(true);

    } catch (error) {
      console.error("Error in handlePayOrder:", error);
      AlertErrorPopup({
        text: error.message || "Error processing payment"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCart = (cart) => {
    return cart.map((item) => ({
      id: item.id,
      ticketName: item.ticketName,
      price: item.price,
      quantity: item.ticketInCartQuantity,
      currency: item.currency,
      description: item.description || '',
      status: item.status || 'ticket.available'
    }));
  };
  return (
    <>
      <div className="ticket-cart">
        <div className="ticket-cart-title">{t("ticket.cart")}</div>
        <table className="w-full">
          <tr className="ticket-cart-header">
            <th>{t("ticket.type")}</th>
            <th>{t("ticket.quantity")}</th>
          </tr>
          {ticketCart.map((ticket) => (
            <TicketCartItem ticket={ticket} />
          ))}
        </table>
      </div>
      <div className="ticket-cart-total">
        <th>{t("ticket.total")}</th>
        <th>{formatter(currency).format(cartTotalPrice)}</th>
      </div>
      <button
        className="primary-button text-xl p-3 mt-2"
        onClick={handlePayOrder}
      >
        {loading ? <ThreeDotsLoading /> : t("ticket.submit")}
      </button>
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handleSelectPaymentMethod}
        loading={loading}
      />
    </>
  );
}

export default TicketCart;
