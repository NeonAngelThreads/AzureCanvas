package org.neonangellock.azurecanvas.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class ItemDTO {
    // Getters and Setters
    private UUID itemId;
    private String title;
    private String description;
    private BigDecimal price;
    private UUID sellerId;
    private String sellerUsername;
    private String sellerAvatarUrl;
    private OffsetDateTime createdAt;
    private String status;
    private List<String> images;
    private String category;
    private Integer views;
    private String location;

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID itemId;
        private String title;
        private String description;
        private BigDecimal price;
        private UUID sellerId;
        private String sellerUsername;
        private String sellerAvatarUrl;
        private OffsetDateTime createdAt;
        private String status;
        private List<String> images;
        private String category;
        private Integer views;
        private String location;

        public Builder itemId(UUID itemId) { this.itemId = itemId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder sellerId(UUID sellerId) { this.sellerId = sellerId; return this; }
        public Builder sellerUsername(String sellerUsername) { this.sellerUsername = sellerUsername; return this; }
        public Builder sellerAvatarUrl(String sellerAvatarUrl) { this.sellerAvatarUrl = sellerAvatarUrl; return this; }
        public Builder createdAt(OffsetDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder images(List<String> images) { this.images = images; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder views(Integer views) { this.views = views; return this; }
        public Builder location(String location) { this.location = location; return this; }

        public ItemDTO build() {
            ItemDTO dto = new ItemDTO();
            dto.itemId = this.itemId;
            dto.title = this.title;
            dto.description = this.description;
            dto.price = this.price;
            dto.sellerId = this.sellerId;
            dto.sellerUsername = this.sellerUsername;
            dto.sellerAvatarUrl = this.sellerAvatarUrl;
            dto.createdAt = this.createdAt;
            dto.status = this.status;
            dto.images = this.images;
            dto.category = this.category;
            dto.views = this.views;
            dto.location = this.location;
            return dto;
        }
    }

}
