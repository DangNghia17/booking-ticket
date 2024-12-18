package com.nghia.bookingevent.payload.response;

import com.nghia.bookingevent.models.organization.Organization;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllOrganizationRes {
    private String name;
    private Organization organization;

}
