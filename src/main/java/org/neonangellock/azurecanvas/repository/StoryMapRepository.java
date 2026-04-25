package org.neonangellock.azurecanvas.repository;

import org.neonangellock.azurecanvas.model.storymap.StoryMap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StoryMapRepository extends JpaRepository<StoryMap, UUID> {
    Page<StoryMap> findByAuthorId(UUID authorId, Pageable pageable);

    // 搜索方法：根据关键字模糊匹配标题、内容和地点
    @org.springframework.data.jpa.repository.Query("SELECT s FROM StoryMap s WHERE s.title LIKE %?1% OR s.content LIKE %?1% OR EXISTS (SELECT l FROM StoryMapLocation l WHERE l.storyMap = s AND (l.title LIKE %?1% OR l.description LIKE %?1%))")
    List<StoryMap> searchByKeyword(String keyword);
}
