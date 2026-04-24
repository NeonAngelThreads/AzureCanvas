package org.neonangellock.azurecanvas.responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusResponse<T> {
    private boolean success;
    private T data;

    public StatusResponse(boolean success, T data) {
        this.success = success;
        this.data = data;
    }
}
