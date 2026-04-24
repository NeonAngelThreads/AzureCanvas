package org.neonangellock.azurecanvas.service;

import org.neonangellock.azurecanvas.model.UserFollower;

import java.util.UUID;

public interface UserFollowService {
    UserFollower followUser(UserFollower follower);
    boolean checkIsFollowed(UUID current, UUID another);
    boolean unfollowUser(UserFollower follower);
}
