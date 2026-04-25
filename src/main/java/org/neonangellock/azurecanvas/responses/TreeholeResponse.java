package org.neonangellock.azurecanvas.responses;

import lombok.Data;

import java.util.List;

@Data
public class TreeholeResponse {
    private String id;
    private String author;
    private String authorId;
    private String avatarLetter;
    private long timestamp;
    private String content;
    private String category;
    private List<String> images;
    private int likes;
    private boolean liked;
    private boolean collected;
    private List<CommentResponse> comments;

}
