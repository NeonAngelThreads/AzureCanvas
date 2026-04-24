package org.neonangellock.azurecanvas.responses;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UploadResponse {
    private String uuid;
    private String fileName; // e.g., a1b2c3d4.webp
    public UploadResponse(String uuid, String fileName) {
        this.uuid = uuid;
        this.fileName = fileName;
    }
}
