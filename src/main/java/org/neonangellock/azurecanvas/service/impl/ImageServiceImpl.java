package org.neonangellock.azurecanvas.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.neonangellock.azurecanvas.model.Item;
import org.neonangellock.azurecanvas.model.ItemImage;
import org.neonangellock.azurecanvas.model.TreeholeComment;
import org.neonangellock.azurecanvas.model.TreeholePost;
import org.neonangellock.azurecanvas.model.storymap.StoryMap;
import org.neonangellock.azurecanvas.service.AbstractQueryService;
import org.neonangellock.azurecanvas.service.ImageService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImageServiceImpl extends AbstractQueryService implements ImageService {
    protected ImageServiceImpl(EntityManager entityManager) {
        super(entityManager);
    }

    @Override
    public List<ItemImage> findByItem(Item item) {
        Query query = entityManager.createQuery("select im from ItemImage im where im.item.id = :targetId");
        query.setParameter("targetId", item.getItemId());

        return query.getResultList();
    }

    @Override
    public List<ItemImage> findByTreeholePost(TreeholePost treeholePost) {
        return null;
    }

    @Override
    public List<ItemImage> findByTreeholeComment(TreeholeComment treeholeComment) {
        return null;
    }

    @Override
    public List<ItemImage> findByStoryMap(StoryMap storyMap) {
        return null;
    }
}
