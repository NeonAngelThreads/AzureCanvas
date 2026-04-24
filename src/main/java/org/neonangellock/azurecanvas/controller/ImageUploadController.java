package org.neonangellock.azurecanvas.controller;

import lombok.extern.slf4j.Slf4j;
import org.neonangellock.azurecanvas.responses.UploadResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOException;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;

@RestController
// API version 1
@Slf4j
@RequestMapping("/api/v1/images")
public class ImageUploadController {

    private final Path imageUploadPath;
    @Autowired
    public ImageUploadController(Path imageUploadPath) {
        this.imageUploadPath = imageUploadPath;
    }

    /**
     * 上传图片并转码为 WebP 格式
     * @param file 用户上传的图片文件
     * @return 包含新生成的 UUID 和 WebP 文件名的 ResponseEntity
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("File is empty", HttpStatus.BAD_REQUEST);
        }

        try {
            // 1. 读取原始图片
            BufferedImage originalImage = ImageIO.read(file.getInputStream());
            if (originalImage == null) {
                return new ResponseEntity<>("Unsupported image format or file is not an image.", HttpStatus.BAD_REQUEST);
            }

            // 2. 生成唯一的 UUID
            String uuid = UUID.randomUUID().toString();
            String fileName = uuid + ".webp"; // WebP 文件名

            // 3. 确定存储路径
            Path targetPath = imageUploadPath.resolve(fileName);

            // 4. 检查存储目录是否存在，如果不存在则创建
            if (!Files.exists(imageUploadPath)) {
                Files.createDirectories(imageUploadPath);
            }

            // 5. 将图片转码为 WebP 并保存
            ByteArrayOutputStream webpOutputStream = new ByteArrayOutputStream();
            ImageWriter writer = getImageWriter(); // 获取 WebP ImageWriter
            if (writer == null) {
                return new ResponseEntity<>("WebP encoder not available.", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // 设置写入参数，例如压缩质量 (0.0 - 1.0, 1.0 是最高质量)
            ImageWriteParam param = writer.getDefaultWriteParam();
            // param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT); // 如果需要设置质量
            // param.setCompressionQuality(0.8f); // 压缩质量，可以根据需求调整

            try (ImageOutputStream ios = ImageIO.createImageOutputStream(webpOutputStream)) {
                writer.setOutput(ios);
                writer.write(null, new javax.imageio.IIOImage(originalImage, null, null), param);
            }

            // 将转码后的 WebP 数据写入文件
            Files.write(targetPath, webpOutputStream.toByteArray());

            // 6. 返回新生成的 UUID 和文件名
            // 建议返回一个 JSON 对象，包含 URL 和原始文件名（如果需要）
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new UploadResponse(uuid, fileName)); // 自定义响应对象

        } catch (IIOException e) {
            // 处理 ImageIO 相关的错误
            return new ResponseEntity<>(Map.of("message","Image processing error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (IOException e) {
            log.error("文件读写错误 {}", e.getMessage());
            return new ResponseEntity<>(Map.of("message","Failed to upload and convert image: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("未知错误 {}", e.getMessage());
            return new ResponseEntity<>(Map.of("message","An unexpected error occurred: ") + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 获取 WebP ImageWriter
     *
     * @return ImageWriter 或 null
     */
    private ImageWriter getImageWriter() {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("webp");
        if (writers.hasNext()) {
            return writers.next();
        }
        return null;
    }
}