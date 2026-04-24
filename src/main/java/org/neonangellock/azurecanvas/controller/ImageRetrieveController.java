package org.neonangellock.azurecanvas.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Slf4j
@RestController
public class ImageRetrieveController {
    private final Path imageUploadPath;
    @Autowired
    public ImageRetrieveController(Path imageUploadPath) {
        this.imageUploadPath = imageUploadPath;
    }

    /**
     * 根据 UUID 获取 WebP 图片 API
     * @param uuid 要获取的图片的 UUID
     * @return WebP 图片文件流或 404 Not Found
     */
    @GetMapping("/resources/{uuid}")
    public ResponseEntity<?> getImage(@PathVariable String uuid) {
        // 1. 构建 WebP 文件的路径
        // 我们假设文件名就是 {uuid}.webp
        String webpFileName = uuid + ".webp";
        Path filePath = imageUploadPath.resolve(webpFileName);

        try {
            // 2. 检查文件是否存在
            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                return ResponseEntity.notFound().build(); // 图片未找到
            }

            // 3. 将文件以正确的 Content-Type 返回
            Resource resource = new UrlResource(filePath.toUri());

            // 明确 Content-Type 为 image/webp
            String contentType = "image/webp";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    // 设置 Content-Disposition 为 inline，表示在浏览器中显示
                    // filename 可以让浏览器在下载时使用原始文件名（在这里是 webp 文件名）
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("文件读取错误 {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message","Error retrieving image: " + e.getMessage()));
        } catch (Exception e) {
            log.error("其他异常 {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message","Invalid UUID or request: " + e.getMessage()));
        }
    }
}
