package org.neonangellock.azurecanvas.responses;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ErrorResponse extends StatusResponse <String>{
    private final String redirect;
    public ErrorResponse(String data, String redirect) {
        super(false, data);
        this.redirect = redirect;
    }
}
