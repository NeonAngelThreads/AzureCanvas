package org.neonangellock.azurecanvas.controller;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

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
     * @param files 用户上传的图片文件
     * @return 包含新生成的 UUID 和 WebP 文件名的 ResponseEntity
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("files") MultipartFile[] files) {
        log.error(Arrays.toString(files));
        if (files.length == 0) {
            return new ResponseEntity<>("File is empty", HttpStatus.BAD_REQUEST);
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file: files) {
            try {
                // 1. 使用 Thumbnailsator 读取图片
                // 传递 InputStream 给 Thumbnails.of()
                //Thumbnails.Builder<?> builder = Thumbnails.of(file.getInputStream());

                // 2. 获取图片信息（可选，用于校验）
                //builder.size(2000, 2000); // 设置一个最大尺寸，防止过大图片处理
                // builder.outputFormat("jpeg"); // 确保输出格式是 jpeg (即使原始是 jpeg，这里也明确一下)
                //Thumbnails.Builder<?> processedBuilder = builder.scale(1.0); // 1.0 表示不缩放，只进行格式校验和转换
                // 这是一个关键点：Thumbnailsator 的 `forceFormat()` 方法用于强制转码
                // 如果原始文件不是 JPEG，它会尝试转为 JPEG。
                // 如果原始文件是 JPEG，它可以重新编码。

                // 3. 确定存储路径
                String uuid = UUID.randomUUID().toString();
                String fileName = uuid + ".webp"; // 目标是 WebP
                Path targetPath = imageUploadPath.resolve(fileName);

                if (!Files.exists(imageUploadPath)) {
                    Files.createDirectories(imageUploadPath);
                }

                // 4. 转码为 WebP 并保存
                ByteArrayOutputStream webpOutputStream = new ByteArrayOutputStream();

                // 使用 Thumbnailsator 进行转换
                // scale(1.0) 只是为了保持原始尺寸，forceFormat("webp") 是关键
                Thumbnails.of(file.getInputStream())
                        .outputFormat("jpeg")
                        // .outputQuality(0.8f) // 可以设置 WebP 的压缩质量
                        .size(2000,2000)
                        .toOutputStream(webpOutputStream);

                // 将转码后的 WebP 数据写入文件
                Files.write(targetPath, webpOutputStream.toByteArray());

                // 5. 返回结果
                urls.add(uuid);

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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(urls);
    }

    /**
     * 获取 WebP ImageWriter
     *
     * @return ImageWriter 或 null
     */
    private ImageWriter getImageWriter() {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByMIMEType("image/webp");
        if (writers.hasNext()) {
            return writers.next();
        }
        return null;
    }
}