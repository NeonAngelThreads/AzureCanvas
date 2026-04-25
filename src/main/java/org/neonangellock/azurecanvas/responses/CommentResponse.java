package org.neonangellock.azurecanvas.responses;

import lombok.Data;

@Data
public class CommentResponse {
    private String id;
    private String author;
    private String authorId;
    private String text;
    private long timestamp;
    private CommentResponse replyTo;
}