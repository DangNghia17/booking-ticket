package com.nghia.bookingevent.services;

import com.nghia.bookingevent.common.Constants;
import com.nghia.bookingevent.models.Order;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.models.ticket.Ticket;
import com.nghia.bookingevent.repository.AccountRepository;
import com.nghia.bookingevent.services.mail.EMailType;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender emailSender;
    private final Configuration configuration;
    private final AccountRepository accountRepository;
    // private final Constants constants;
    final String MAIL_TEMPLATE = "newmail-template.ftl";

    final String OTP_CONTENT = "Please enter this code to verify your action with LotusTicket. This code use only once. Please do not share this code to with anyone else due to security for yourself. The code is only valid for 5 minutes. ";
    // "<br>Regards,\n";
    final String NEWPASSWORD_CONTENT = "You are receiving this email because we received a password reset request for your account. Please visit our website to change your new password. You should keep a secure record of your password and not disclose it to any unauthorized party.";
    // "<br>Regards,";
    final String REGISTER_CONTENT = "Welcome to LotusTicket! You have successfully registered. Please visit our website to explore ";
    // "<br>Regards,";
    final String BECOME_ORGANIZATION_CONTENT = "Thank you for your application to become an official partner organization with <b>Lotus Ticket</b>! We’ve successfully received your application form. Our team will begin verifying your information shortly. Please allow a few days for us to complete the verification process.<br><br>"
            +
            "Once your details are confirmed, we will grant you full access to our platform, and you’ll be able to enjoy all the benefits and features of Lotus Ticket. We will notify you of the results as soon as possible.<br><br>"
            +
            "If you have any questions or need further assistance in the meantime, don’t hesitate to reach out to us.<br><br>"
            +
            "Thank you for choosing <b>Lotus Ticket</b>, and we look forward to partnering with you!<br><br>" +
            "<b>Best regards,</b><br>" +
            "<i>The Lotus Ticket Team</i>";
    final String OFFICIAL_ORGANIZATION_CONTENT = "We have reviewed your application form. After taking into consideration based on our term conditions. We officially inform that you have full authorization of organization role."
            +
            "<br>Please use this password: <b>%s</b> to sign in your account in our system. Click <a href=\"https://lotusticket-admin.netlify.app\">here</a> to login";
    // "<br>Regards,";
    final String REFUSE_ORGANIZATION_CONTENT = "After reviewing your application form thoroughly, We have to refuse your form. This is because you may not satisfy one of our strict criteria";
    // "<br>Regards,";
    // final String NEW_EVENT ="After reviewing your application form thoroughly, We
    // have to refuse your form. This is because you may not satisfy one of our
    // strict criteria" +
    // "<br>Regards,";
    final String TYPE_EMAIL = "text/html; charset=UTF-8";

    public void sendMail(Account account, String content, String messageContent, EMailType type)
            throws MessagingException, TemplateException, IOException {
        try {
            Map<String, Object> model = new HashMap<>();
            MimeMessage mimeMailMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMailMessage, true, "UTF-8");
            Template template = configuration.getTemplate(MAIL_TEMPLATE);

            if (type.equals(EMailType.OTP)) {
                // String testHtml = " Click <a
                // href=\"https://lotusticket-vn.netlify.app/event/" +
                // "gm-vietnam---vietnam-blockchain-week-28120" + "\">here</a> to visit new
                // event";
                // String NEW_EVENT ="We want to notify you that <span
                // style=\"color:black;font-weight: 700;\">"+ "ST.319 Entertainment" +"</span>
                // has just created a new event called " +" <span
                // style=\"color:black;font-weight: 700;\"> ILIZA SHLESINGER - Back In Action
                // Tour - Standup Comedy in HCMC </span>" + "<br>" + testHtml;
                //
                // model.put("header", "Upcoming event");
                // model.put("content", NEW_EVENT);
                // model.put("contentColor", "1234");
                model.put("header", "[Lotus Ticket] - Account Verification Request");
                model.put("content", OTP_CONTENT);
                model.put("contentColor", messageContent);

            } else if (type.equals(EMailType.NEW_PASSWORD)) {
                model.put("header", "[Lotus Ticket] - New Password Request Confirmation");
                model.put("content", NEWPASSWORD_CONTENT);
            } else if (type.equals(EMailType.REGISTER)) {
                model.put("header", "[Lotus Ticket] - Registration Completed Successfully");
                model.put("content", REGISTER_CONTENT);
            } else if (type.equals(EMailType.BECOME_ORGANIZATION)) {
                model.put("header", "[Lotus Ticket] - Complete Your Organization Setup");
                model.put("content", BECOME_ORGANIZATION_CONTENT);
            } else if (type.equals(EMailType.OFFICIAL_ORGANIZATION)) {
                model.put("header", "[Lotus Ticket] - Register For Organization Successfully");
                model.put("content", String.format(OFFICIAL_ORGANIZATION_CONTENT, messageContent));
                model.put("contentColor", "");

            } else if (type.equals(EMailType.REFUSE_ORGANIZATION)) {
                model.put("header", "[Lotus Ticket] - Refuse For Organization Successfully");
                model.put("content", REFUSE_ORGANIZATION_CONTENT);
                model.put("contentColor", messageContent);
            } else if (type.equals(EMailType.NEW_EVENT)) {
                model.put("header", "[Lotus Ticket] - Upcoming Event Notification");
                model.put("content", content);
            } else if (type.equals(EMailType.UPDATE_EVENT)) {
                model.put("header", "[Lotus Ticket] - Updating Event Notification");
                model.put("content", content);
            } else if (type.equals(EMailType.DELETE_EVENT)) {
                model.put("header", "[Lotus Ticket] - Remove Event Notification");
                model.put("content", content);
                model.put("contentColor", messageContent);
            } else if (type.equals(EMailType.CHECK_OUT)) {
                model.put("header", "[Lotus Ticket] - Purchase Confirmation Notification");
                model.put("content", content);
                model.put("contentColor", messageContent);
            }
            model.put("title", "LOTUS TICKET");
            model.put("name", account.getName());
            if (messageContent.equals("")) {
                model.put("contentColor", "<br>");
            }

            String html = FreeMarkerTemplateUtils.processTemplateIntoString(Objects.requireNonNull(template), model);
            helper.setText(html, true);
            helper.setTo(account.getEmail());
            helper.setSubject(new String(((String) model.get("header")).getBytes("UTF-8"), "UTF-8"));

            emailSender.send(mimeMailMessage);
        } catch (Exception ex) {
            log.error("Error sending mail: ", ex);
            throw ex;
        }
    }

    public void sendMailWhenCreatingEvent(List<Account> accountList, Map<String, String> map, String organizationName,
            EMailType type) throws MessagingException, TemplateException, IOException {
        // String testHtml = " Click <a
        // href=\"https://lotusticket-vn.netlify.app/event/" + map.get("id") +
        // "\">here</a> to visit new event";
        String testHtml = " Click  <a href=\"http://localhost:3000/event/" + map.get("id")
                + "\">here</a> to visit new event";
        String NEW_EVENT = "We want to notify you that <span style=\"color:black;font-weight: 700;\">"
                + organizationName
                + "</span> has just created a new event called <span style=\"color:black;font-weight: 700;\">"
                + map.get("eventName") + "</span> <br>" + testHtml;
        for (Account account : accountList) {
            sendMail(account, NEW_EVENT, "", type);
        }
    }

    public void sendMailWhenUpdatingEvent(List<Account> accountList, Map<String, String> map, String organizationName,
            EMailType type) throws MessagingException, TemplateException, IOException {
        StringBuilder htmlBuilder = new StringBuilder();
        // htmlBuilder.append("We want to notify you that <span
        // style=\"color:black;font-weight:
        // 700;\">").append(organizationName).append("</span> has just changed a event
        // called <span style=\"color:black;font-weight: 700; font-family:Calibri
        // \">").append(map.get("eventName")).append("</span> <br>").append(" Click <a
        // href=\"https://lotusticket-vn.netlify.app/event/").append(map.get("id")).append("\">here</a>
        // to visit this event");
        htmlBuilder.append("We want to notify you that <span style=\"color:black;font-weight: 700;\">")
                .append(organizationName)
                .append("</span> has just changed a event called <span style=\"color:black;font-weight: 700; font-family:Calibri \">")
                .append(map.get("eventName")).append("</span> <br>")
                .append(" Click  <a href=\"http://localhost:3000/event/").append(map.get("id"))
                .append("\">here</a> to visit this event");

        for (Account account : accountList) {
            sendMail(account, htmlBuilder.toString(), "", type);
        }
    }

    // send mail và hoàn tiền
    public void sendMailWhenDeletingEvent(List<Order> orders, Map<String, String> map, String organizationName,
            EMailType type) throws MessagingException, TemplateException, IOException {
        String moneyRefund = "We will refund the amount you paid for the order, which is ";
        String DELETE_EVENT = "We want to notify you that <span style=\"color:black;font-weight: 700;\">"
                + organizationName
                + "</span> has just deleted a event called <span style=\"color:black;font-weight: 700;\">"
                + map.get("eventName") + "</span> <br>";
        for (Order order : orders) {
            Optional<Account> account = accountRepository.findByEmail(order.getEmail());
            sendMail(account.get(), DELETE_EVENT + moneyRefund + order.getTotalPrice() + order.getCurrency(), "", type);
        }
    }

    public void sendMailCheckOut(Order order, Map<String, String> map, String organizationName, EMailType type)
            throws MessagingException, TemplateException, IOException {
        StringBuilder htmlBuilder = new StringBuilder(
                "Thank you for your purchase of tickets for the <span style=\"color:black;font-weight: 700;\">"
                        + map.get("eventName") + "</span>. Your payment has been successfully processed. <br><br> Below is the detailed information about your order <br>");
        // htmlBuilder.append("Click <a
        // href=\"https://lotusticket-vn.netlify.app/event/").append(map.get("id")).append("\">here</a>
        // for more details <br>");
        htmlBuilder.append("Click  <a href=\"http://localhost:3000/event/").append(map.get("id"))
                .append("\">here</a> for more details the events<br><br>");

        htmlBuilder.append("Your order number is <strong>").append(order.getId()).append("</strong> <br><br>");
        htmlBuilder.append("<table style=\"border: 1px solid black; border-collapse: collapse;width:100%;\">\n" +
                "                                        <tbody>\n" +
                "                                          <tr>\n" +
                "                                            <td\n" +
                "                                              style=\"border: 2px solid black; padding: 8px; background-color: #2d3142; color: white; font-weight: 600;\">\n"
                +
                "                                              ID Ticket</td>\n" +
                "                                            <td\n" +
                "                                              style=\"border: 2px solid black; padding: 8px; background-color: #2d3142; color: white; font-weight: 600;\">\n"
                +
                "                                              Ticket name</td>\n" +
                "                                            <td\n" +
                "                                              style=\"border: 2px solid black; padding: 8px; background-color: #2d3142; color: white; font-weight: 600; text-align: center;\">\n"
                +
                "                                              Price</td>\n" +
                "                                            <td\n" +
                "                                              style=\"border: 2px solid black; padding: 8px; background-color: #2d3142; color: white; font-weight: 600;\">\n"
                +
                "                                              Quantity</td>\n" +
                "                                          </tr>");
        for (Ticket ticket : order.getCustomerTicketList()) {
            String test = "<tr>  <td style=\"border: 1px solid black; padding: 8px;\">" + ticket.getId() + "</td>";
            test += "<td style=\"border: 1px solid black; padding: 8px;\">" + ticket.getTicketName() + "</td>";
            test += "<td style=\"font-weight: bold; padding: 8px;display: flex;\">";
            test += "<div class=\"myDIV\">" + Constants.convertCurrencyFormat(
                    Constants.formatCurrency(ticket.getCurrency(), ticket.getPrice()), ticket.getCurrency()) + "</div>";
            test += "</td>";
            test += "<td style=\"border: 1px solid black; padding: 8px; text-align: center;\">" + ticket.getQuantity()
                    + "</td>";
            test += "</tr>";
            htmlBuilder.append(test);
        }
        htmlBuilder.append("</tbody>" +
                "        </table>");
        String totalPriceOfOrder = "<div style=\"margin-top: 10px; display: flex;\">"
                + "<br><strong style=\"text-transform: uppercase;\">Total price of order : </strong> <div class=\"myDIV\"> "
                + Constants.convertCurrencyFormat(Constants.formatCurrency(order.getCurrency(), order.getTotalPrice()),
                        order.getCurrency())
                + "</div>"
                + "</div>";

        if (order.getCurrency().equals("USD")) {
            totalPriceOfOrder = "<div style=\"margin-top: 10px; display: flex;\">"
                    + "<strong style=\"text-transform: uppercase;\">Total price of order : </strong>  $<div class=\"myDIV\">" + order.getTotalPrice()
                    + "</div>"
                    + "</div>";
        }
        htmlBuilder.append(totalPriceOfOrder);

        htmlBuilder.append("<br>Note: Your tickets have been confirmed and will be available in your account. You can log in to <a href=\"http://localhost:3000/my-orders\"> <bold>Ticket Download Link</bold></a> to view and download your tickets. If you have any questions, please feel free to contact us.\r\n" + //
                        "\r\n" + //
                        "Thank you for trusting us and supporting the event. We look forward to welcoming you at the event!");
        htmlBuilder.append("<br><b style=\"font-size: large; font-style: oblique; color: #2d3142;\">Lotus Ticket</b>");
        Optional<Account> account = accountRepository.findByEmail(order.getEmail());
        sendMail(account.get(), htmlBuilder.toString(), "", type);
    }
}
