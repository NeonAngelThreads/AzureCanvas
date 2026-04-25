package org.neonangellock.azurecanvas.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class StoryMapDTO {
    // Getters and Setters
    private UUID storyMapId;
    private String title;
    private String description;
    private UUID authorId;
    private String author;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String coverImageUrl;
    private List<LocationDTO> locations;
    private Integer likes;
    private String comments;
    private BigDecimal lat;
    private BigDecimal lng;
    private String category;
    private String location;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID storyMapId;
        private String title;
        private String description;
        private UUID authorId;
        private String author;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private String coverImageUrl;
        private List<LocationDTO> locations;
        private Integer likes;
        private String comments;
        private BigDecimal lat;
        private BigDecimal lng;
        private String category;
        private String location;

        public Builder storyMapId(UUID storyMapId) { this.storyMapId = storyMapId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder authorId(UUID authorId) { this.authorId = authorId; return this; }
        public Builder author(String author) { this.author = author; return this; }
        public Builder createdAt(OffsetDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder coverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; return this; }
        public Builder locations(List<LocationDTO> locations) { this.locations = locations; return this; }
        public Builder likes(Integer likes) { this.likes = likes; return this; }
        public Builder comments(String comments) { this.comments = comments; return this; }
        public Builder lat(BigDecimal lat) { this.lat = lat; return this; }
        public Builder lng(BigDecimal lng) { this.lng = lng; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder location(String location) { this.location = location; return this; }

        public StoryMapDTO build() {
            StoryMapDTO dto = new StoryMapDTO();
            dto.storyMapId = this.storyMapId;
            dto.title = this.title;
            dto.description = this.description;
            dto.authorId = this.authorId;
            dto.author = this.author;
            dto.createdAt = this.createdAt;
            dto.updatedAt = this.updatedAt;
            dto.coverImageUrl = this.coverImageUrl;
            dto.locations = this.locations;
            dto.likes = this.likes;
            dto.comments = this.comments;
            dto.lat = this.lat;
            dto.lng = this.lng;
            dto.category = this.category;
            dto.location = this.location;
            return dto;
        }
    }

    @Setter
    @Getter
    public static class LocationDTO {
        // Getters and Setters
        private UUID locationId;
        private BigDecimal lat;
        private BigDecimal lng;
        private String title;
        private String description;
        private String imageUrl;

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private UUID locationId;
            private BigDecimal lat;
            private BigDecimal lng;
            private String title;
            private String description;
            private String imageUrl;

            public Builder locationId(UUID locationId) { this.locationId = locationId; return this; }
            public Builder lat(BigDecimal lat) { this.lat = lat; return this; }
            public Builder lng(BigDecimal lng) { this.lng = lng; return this; }
            public Builder title(String title) { this.title = title; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }

            public LocationDTO build() {
                LocationDTO dto = new LocationDTO();
                dto.locationId = this.locationId;
                dto.lat = this.lat;
                dto.lng = this.lng;
                dto.title = this.title;
                dto.description = this.description;
                dto.imageUrl = this.imageUrl;
                return dto;
            }
        }

    }

}
