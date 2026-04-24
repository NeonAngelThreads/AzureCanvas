package org.neonangellock.azurecanvas.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.neonangellock.azurecanvas.model.TreeholePost;
import org.neonangellock.azurecanvas.model.UserFollower;
import org.neonangellock.azurecanvas.service.AbstractQueryService;
import org.neonangellock.azurecanvas.service.UserFollowService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserFollowServiceImpl extends AbstractQueryService implements UserFollowService{
    protected UserFollowServiceImpl(EntityManager entityManager) {
        super(entityManager);
    }

    @Override
    @Transactional
    public UserFollower followUser(UserFollower follower) {
        if (follower.getId() == null) {
            entityManager.persist(follower);
            return follower;
        }
        return entityManager.merge(follower);
    }

    @Override
    public boolean checkIsFollowed(UUID current, UUID another) {
        return !this.findById(current, another).isEmpty();
    }

    @Override
    @Transactional
    public boolean unfollowUser(UserFollower follower) {
        if (follower != null) {
            entityManager.remove(follower);
            return true;
        }
        return false;
    }

    public List<UserFollower> findById(UUID follower, UUID following){
        Query query = entityManager.createQuery(
                "SELECT f FROM UserFollower f where f.follower.id = :followerId AND f.following.id = :followingId");

        query.setParameter("followerId", follower);
        query.setParameter("followingId", following);

        return query.getResultList();
    }
}
