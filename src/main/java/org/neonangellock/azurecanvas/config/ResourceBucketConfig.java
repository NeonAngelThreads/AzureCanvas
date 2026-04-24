package org.neonangellock.azurecanvas.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ResourceBucketConfig {
    @Value("${image.upload.dir}")
    private String imageUploadDir;

    @Bean
    public Path getImageUploadPath() {
        // 将相对路径转换为绝对路径
        return Paths.get(imageUploadDir).toAbsolutePath();
    }
}
