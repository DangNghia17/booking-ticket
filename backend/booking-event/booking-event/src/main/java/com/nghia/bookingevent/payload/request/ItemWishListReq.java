package com.nghia.bookingevent.payload.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data

public class ItemWishListReq {
    @NotBlank
    private String idItem;
}
