package org.neonangellock.azurecanvas.controller;

import lombok.extern.slf4j.Slf4j;
import org.neonangellock.azurecanvas.model.TreeholeComment;
import org.neonangellock.azurecanvas.model.TreeholePost;
import org.neonangellock.azurecanvas.model.es.EsTreeHole;
import org.neonangellock.azurecanvas.responses.TreeholeResponse;
import org.neonangellock.azurecanvas.service.EsTreeHoleService;
import org.neonangellock.azurecanvas.service.IMarketService;
import org.neonangellock.azurecanvas.service.IStoryMapService;
import org.neonangellock.azurecanvas.service.TreeholeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@Slf4j
@RequestMapping("/api/treeholes")
public class TreeholeController {

    @Autowired
    private TreeholeService treeholeService;

    @Autowired
    private IMarketService marketService;

    @Autowired
    private IStoryMapService storyMapService;

    @Autowired
    private EsTreeHoleService esTreeHoleService;


    @GetMapping("/posts")
    public ResponseEntity<List<TreeholePost>> getAllPosts() {
        return ResponseEntity.ok(treeholeService.findAllPosts());
    }

    @GetMapping("/posts/recent")
    public ResponseEntity<List<TreeholePost>> getRecentPosts(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(treeholeService.findRecentPosts(limit));
    }

    @GetMapping("/newest")
    public ResponseEntity<?> getNewestPosts(){

        try {
            return ResponseEntity.ok(
                    Map.of(
                            "items", this.marketService.findNewest(),
                            "treehole", this.treeholeService.getNewest(),
                            "storymap", this.storyMapService.findNewest()
                    )
            );
        } catch (Exception e) {
            log.error("error loading the newest posts {}", e.getMessage());
        }
        return ResponseEntity.internalServerError().build();
    }
    @GetMapping("/posts/{id}")
    public ResponseEntity<TreeholePost> getPostById(@PathVariable Integer id) {
        TreeholePost post = treeholeService.findPostById(id);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts")
    public ResponseEntity<TreeholePost> createPost(@RequestBody TreeholePost post) {
        return ResponseEntity.ok(treeholeService.savePost(post));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Integer id) {
        treeholeService.deletePostById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Void> likePost(@PathVariable Integer id) {
        treeholeService.incrementLikeCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{id}/unlike")
    public ResponseEntity<Void> unlikePost(@PathVariable Integer id) {
        treeholeService.decrementLikeCount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<TreeholeComment>> getCommentsByPostId(@PathVariable Integer postId) {
        return ResponseEntity.ok(treeholeService.findCommentsByPostId(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<TreeholeComment> createComment(
            @PathVariable Integer postId,
            @RequestBody TreeholeComment comment) {
        TreeholePost post = treeholeService.findPostById(postId);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        comment.setPost(post);
        return ResponseEntity.ok(treeholeService.saveComment(comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer id) {
        treeholeService.deleteCommentById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/search", produces = "application/json; charset=utf-8")
    public ResponseEntity<List<TreeholeResponse>> searchTreeholes(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "all") String category) {

        // 调用ES服务进行搜索
        SearchHits<EsTreeHole> searchHits = esTreeHoleService.searchTreeHole(keyword, 0, 100);

        // 转换为前端需要的格式
        List<TreeholeResponse> responseList = new ArrayList<>();

        // 检查searchHits是否为null，以及是否有搜索结果
        if (searchHits != null && searchHits.hasSearchHits()) {
            responseList = searchHits.getSearchHits().stream()
                    .map(searchHit -> {
                        EsTreeHole treeHole = searchHit.getContent();
                        TreeholeResponse response = new TreeholeResponse();
                        response.setId(treeHole.getId());
                        response.setAuthor(treeHole.getBoardName() != null && !treeHole.getBoardName().isEmpty()
                                ? treeHole.getBoardName()
                                : "匿名用户");
                        response.setAuthorId(treeHole.getId());
                        response.setAvatarLetter(treeHole.getBoardName() != null && !treeHole.getBoardName().isEmpty()
                                ? treeHole.getBoardName().substring(0, 1)
                                : "匿");
                        response.setTimestamp(System.currentTimeMillis());

                        // 处理高亮信息
                        String content = treeHole.getContent() != null ? treeHole.getContent()
                                : (treeHole.getTitle() != null ? treeHole.getTitle() : "");

                        // 检查是否有高亮信息
                        if (searchHit.getHighlightFields() != null && !searchHit.getHighlightFields().isEmpty()) {
                            // 优先使用高亮的内容
                            if (searchHit.getHighlightFields().containsKey("content")) {
                                List<String> highlightContent = searchHit.getHighlightFields().get("content");
                                if (highlightContent != null && !highlightContent.isEmpty()) {
                                    content = String.join(" ", highlightContent);
                                }
                            } else if (searchHit.getHighlightFields().containsKey("title")) {
                                List<String> highlightTitle = searchHit.getHighlightFields().get("title");
                                if (highlightTitle != null && !highlightTitle.isEmpty()) {
                                    content = String.join(" ", highlightTitle);
                                }
                            }
                        }

                        response.setContent(content);
                        response.setCategory(category);
                        response.setImages(List.of());
                        response.setLikes(0);
                        response.setLiked(false);
                        response.setCollected(false);
                        response.setComments(List.of());
                        return response;
                    })
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(responseList);
    }

    /**
     * 更新树洞数据
     *
     * @return 更新结果
     */
    @GetMapping("/update")
    public ResponseEntity<String> updateTreeholes() {
        try {
            // 调用ES服务同步数据
            esTreeHoleService.syncTreeHoleFromApi();
            return ResponseEntity.ok("数据更新成功");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("数据更新失败: " + e.getMessage());
        }
    }
}
