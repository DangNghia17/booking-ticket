package com.nghia.bookingevent.services;

import com.nghia.bookingevent.Implement.IPaymentService;
import com.nghia.bookingevent.payload.request.PriceRes;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.utils.StringUtils;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service("PayPalService")
@RequiredArgsConstructor
//@Component("PayPalService")
//@Qualifier("PayPalService")
public class PayPalService implements IPaymentService {
    // Sử dụng URL từ environment
    @Value("${app.payment.redirect-url}")
    private String MAIN_URL;

    @Value("${app.payment.success-url}")
    private String SUCCESS_URL;

    @Value("${app.payment.cancel-url}")
    private String CANCEL_URL;

    private final APIContext apiContext;


    @Override
    //@Transactional
    //@Qualifier("PayPalService")
    public ResponseEntity<?> createPayment(PriceRes priceRes, HttpServletRequest request) {
        try {
            log.info("Creating PayPal payment with amount: {}", priceRes.getPrice());
            
            String cancelUrl = StringUtils.getBaseURL(request) + CANCEL_URL;
            String successUrl = StringUtils.getBaseURL(request) + SUCCESS_URL;
            
            log.info("Success URL: {}", successUrl);
            log.info("Cancel URL: {}", cancelUrl);

            Payment payment = new Payment();
            payment.setIntent("sale");

            Payer payer = new Payer();
            payer.setPaymentMethod("paypal");
            payment.setPayer(payer);

            RedirectUrls redirectUrls = new RedirectUrls();
            redirectUrls.setReturnUrl(successUrl);
            redirectUrls.setCancelUrl(cancelUrl);
            payment.setRedirectUrls(redirectUrls);

            Amount amount = new Amount();
            amount.setCurrency("USD");
            
            // Đảm bảo format số tiền đúng chuẩn PayPal
            BigDecimal total = new BigDecimal(priceRes.getPrice())
                .setScale(2, RoundingMode.HALF_UP);
            amount.setTotal(total.toString());

            Transaction transaction = new Transaction();
            transaction.setAmount(amount);
            transaction.setDescription("Payment for tickets");

            List<Item> items = new ArrayList<>();
            Item item = new Item();
            item.setName("Event Tickets")
                .setCurrency("USD")
                .setPrice(total.toString())
                .setQuantity("1");
            items.add(item);

            ItemList itemList = new ItemList();
            itemList.setItems(items);
            transaction.setItemList(itemList);
            
            payment.setTransactions(Collections.singletonList(transaction));

            Payment createdPayment = payment.create(apiContext);
            
            String approvalUrl = createdPayment.getLinks().stream()
                .filter(link -> "approval_url".equals(link.getRel()))
                .findFirst()
                .map(Links::getHref)
                .orElseThrow(() -> new PayPalRESTException("No approval URL found"));

            return ResponseEntity.ok(new ResponseObject(true, "Payment URL created", approvalUrl, 200));

        } catch (PayPalRESTException e) {
            log.error("PayPal payment error: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject(false, "PayPal payment error: " + e.getMessage(), null, 400));
        }
    }


    @SneakyThrows
    @Override
    //@Qualifier("PayPalService")
    public ResponseEntity<?> executePayPalPayment(String paymentId, String payerId,   HttpServletRequest request, HttpServletResponse response)
    {
        try {
            log.info("Execute Payment");
          //  HttpSession session = request.getSession();
        //    Order order = (Order) session.getAttribute("id order");

            Payment payment= execute(paymentId, payerId);
            if (payment.getState().equals("approved")) {
                //handle bussiness logi

               // session.invalidate();

                //redirect

                response.sendRedirect(MAIN_URL + "success=true&cancel=false");
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ResponseObject(true, "Payment with Paypal complete", "",200)
                );
            }
        } catch (PayPalRESTException | IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, e.getMessage(), "",400));

        }
        response.sendRedirect(MAIN_URL + "success=false&cancel=false");
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(
                new ResponseObject(false, "Payment with Paypal failed", "",400)
        );
    }



    @SneakyThrows
    //@Qualifier("PayPalService")
    public   ResponseEntity<?> cancelPayPalPayment(HttpServletRequest request, HttpServletResponse response)
    {
        response.sendRedirect(MAIN_URL + "success=false&cancel=true");
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(
                new ResponseObject(true, "cancel payment", "",200));

    }

    public Payment createPayment(
            double total,
            String currency,
            String method,
            String intent,
            String description,
            String cancelUrl,
            String successUrl) throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setCurrency(currency);
        total = new BigDecimal(total).setScale(2, RoundingMode.HALF_UP).doubleValue();
        amount.setTotal(String.format("%.2f", total));

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod(method.toString());

        Payment payment = new Payment();
        payment.setIntent(intent.toString());
        payment.setPayer(payer);
        payment.setTransactions(transactions);
        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        return payment.create(apiContext);
    }

    public Payment execute(String paymentId, String payerId) throws PayPalRESTException{
        Payment payment = new Payment();
        payment.setId(paymentId);
        PaymentExecution paymentExecute = new PaymentExecution();
        paymentExecute.setPayerId(payerId);
        return payment.execute(apiContext, paymentExecute);
    }

}