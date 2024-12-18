package com.nghia.bookingevent.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizerResponse {
    private String id;
    private String name;
    private String avatar;
    private String phone;
    private String role;
    private String email;
    private String biography;
    private String province;
    private String venue;
    private String address;
    private String USDBalance;
    private String VNDBalance;
}
