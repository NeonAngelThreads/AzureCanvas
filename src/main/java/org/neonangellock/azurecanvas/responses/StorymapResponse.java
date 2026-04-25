package org.neonangellock.azurecanvas.responses;

import lombok.Data;

@Data
public class StorymapResponse {
    private String storyMapId;
    private String title;
    private String description;
    private String category;
    private String location;
    private Double lat;
    private Double lng;
    private Integer likes;
    private Integer comments;
    private String authorID;
    private String author;
    private String createdAt;
    private String updatedAt;
}
