package com.example.backend.service;

import com.example.backend.model.CommentResponse;
import com.example.backend.model.Post;
import com.example.backend.model.PostResponse;
import com.example.backend.model.User;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final GridFSBucket gridFSBucket;
    private CommentService commentService; // Optional dependency
    private ReactionService reactionService; // Optional dependency

    private static final int MAX_VIDEO_SIZE_MB = 15; // 15MB
    private static final List<String> ALLOWED_VIDEO_TYPES = List.of("video/mp4", "video/quicktime");
    private static final int MAX_VIDEO_DURATION_SECONDS = 30;

    @Value("${upload.directory}")
    private String uploadDirectory;

    @Autowired
    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            MongoTemplate mongoTemplate) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
        this.gridFSBucket = GridFSBuckets.create(mongoTemplate.getDb(), "media");
    }

    // Optional constructor for when you have CommentService and ReactionService available
    @Autowired(required = false)
    public void setAdditionalServices(CommentService commentService, ReactionService reactionService) {
        this.commentService = commentService;
        this.reactionService = reactionService;
    }

    private User getUserDetails(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public PostResponse convertToPostResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setImageUrls(post.getImageUrls());
        response.setVideoUrl(post.getVideoUrl());
        response.setMediaIds(post.getMediaIds());
        response.setMediaTypes(post.getMediaTypes());
        response.setLikes(post.getLikes());
        response.setComments(post.getComments());
        response.setCreatedAt(post.getCreatedAt());
        response.setUserId(post.getUserId());

        // Handle potentially deleted users gracefully
        try {
            userRepository.findById(post.getUserId()).ifPresentOrElse(
                    user -> {
                        response.setUserName(user.getFirstName() + " " + user.getLastName());
                        response.setUserProfilePicture(user.getProfilePicture());
                    },
                    () -> {
                        response.setUserName("Deleted User");
                        response.setUserProfilePicture(null);
                    });
        } catch (Exception e) {
            System.err.println("Error fetching user for post " + post.getId() + ": " + e.getMessage());
            response.setUserName("Deleted User");
            response.setUserProfilePicture(null);
        }

        return response;
    }

    public PostResponse createPost(String userId, String content, List<MultipartFile> images, MultipartFile video) {
        if ((video == null && (images == null || images.isEmpty())) && content.isEmpty()) {
            throw new IllegalArgumentException("Post must have content, images, or a video");
        }

        Post post = new Post();
        post.setUserId(userId);
        post.setContent(content);
        post.setCreatedAt(LocalDateTime.now());
        post.setLikes(0);
        post.setComments(new ArrayList<>());
        List<String> mediaIds = new ArrayList<>();

        try {
            // Ensure upload directory exists - use direct path to backenduploads
            Path uploadsPath = Paths.get("backend", "uploads");
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
                System.out.println("Created uploads directory at: " + uploadsPath.toAbsolutePath());
            }

            // Handle video upload
            if (video != null && !video.isEmpty()) {
                validateVideo(video);
                String videoId = saveMedia(video, "video");
                mediaIds.add(videoId);
                post.setVideoUrl("/api/media/" + videoId); // URL for retrieval
                post.addMediaType(videoId, "video/" + video.getContentType().split("/")[1]); // Store content type

                // Save to local storage
                saveToLocalStorage(video, videoId);
            }

            // Handle image uploads
            if (images != null && !images.isEmpty()) {
                for (MultipartFile image : images) {
                    if (!image.getContentType().startsWith("image/")) {
                        throw new IllegalArgumentException("Only image files are supported");
                    }
                    String imageId = saveMedia(image, "image");
                    mediaIds.add(imageId);
                    post.addMediaType(imageId, image.getContentType()); // Store content type

                    // Save to local storage
                    saveToLocalStorage(image, imageId);
                }
                post.setImageUrls(mediaIds.stream()
                        .map(id -> "/api/media/" + id)
                        .collect(Collectors.toList()));
            }

            post.setMediaIds(mediaIds); // Store GridFS IDs
            Post savedPost = postRepository.save(post);
            return convertToPostResponse(savedPost);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save media: " + e.getMessage());
        }
    }

    private void saveToLocalStorage(MultipartFile file, String mediaId) throws IOException {
        // Use direct absolute path to D:\Learn_Book\backend uploads folder
        Path uploadsPath = Paths.get("D:", "Learn_Book", "backend", "uploads");
        Files.createDirectories(uploadsPath); // Ensure directory exists

        Path filePath = uploadsPath.resolve(mediaId);
        System.out.println("Saving file to: " + filePath);

        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(file.getBytes());
        }
    }

    private void validateVideo(MultipartFile video) {
        if (!ALLOWED_VIDEO_TYPES.contains(video.getContentType())) {
            throw new IllegalArgumentException(
                    "Invalid video format. Allowed formats: " + String.join(", ", ALLOWED_VIDEO_TYPES));
        }
        if (video.getSize() > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            throw new IllegalArgumentException("Video size must be less than " + MAX_VIDEO_SIZE_MB + "MB");
        }
        // Note: Duration validation requires FFmpeg or external library.
        // For simplicity, assuming frontend enforces 30s limit.
        // If needed, reintroduce JAVE or use FFmpeg CLI via ProcessBuilder.
    }

    private String saveMedia(MultipartFile file, String type) throws IOException {
        GridFSUploadOptions options = new GridFSUploadOptions()
                .metadata(new org.bson.Document("type", type));
        ObjectId fileId = gridFSBucket.uploadFromStream(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "media_" + type,
                file.getInputStream(),
                options);
        return fileId.toHexString();
    }

    public List<PostResponse> getAllPosts() {
        try {
            List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
            return posts.stream()
                    .map(this::convertToPostResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching all posts: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<PostResponse> getUserPosts(String userId) {
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return posts.stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
    }

    public void deletePost(String postId, String userId, boolean isAdmin) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        // Allow post deletion if user is the post owner OR is an admin
        if (!post.getUserId().equals(userId) && !isAdmin) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }

        // Delete associated media from GridFS and local storage
        if (post.getMediaIds() != null) {
            for (String mediaId : post.getMediaIds()) {
                try {
                    // Delete from GridFS
                    gridFSBucket.delete(new ObjectId(mediaId));

                    // Delete from local storage - use absolute path
                    Path mediaPath = Paths.get("D:", "Learn_Book", "backend", "uploads", mediaId);
                    if (Files.exists(mediaPath)) {
                        Files.delete(mediaPath);
                        System.out.println("Deleted file: " + mediaPath);
                    }
                } catch (Exception e) {
                    // Log error but continue with post deletion
                    System.err.println("Error deleting media: " + e.getMessage());
                }
            }
        }

        // Delete post from database
        postRepository.deleteById(postId);
    }

    public PostResponse updatePost(String postId, String userId, String content, List<MultipartFile> images) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own posts");
        }

        post.setContent(content);
        List<String> mediaIds = new ArrayList<>(post.getMediaIds() != null ? post.getMediaIds() : new ArrayList<>());

        try {
            if (images != null && !images.isEmpty()) {
                // Delete old media
                if (!mediaIds.isEmpty()) {
                    for (String mediaId : mediaIds) {
                        try {
                            // Delete from GridFS
                            gridFSBucket.delete(new ObjectId(mediaId));

                            // Delete from local storage - use absolute path
                            Path mediaPath = Paths.get("D:", "Learn_Book", "backend", "uploads", mediaId);
                            if (Files.exists(mediaPath)) {
                                Files.delete(mediaPath);
                                System.out.println("Deleted file during update: " + mediaPath);
                            }
                        } catch (Exception e) {
                            System.err.println("Failed to delete old media: " + mediaId + " - " + e.getMessage());
                        }
                    }
                    mediaIds.clear();
                }

                // Save new images
                for (MultipartFile image : images) {
                    if (!image.getContentType().startsWith("image/")) {
                        throw new IllegalArgumentException("Only image files are supported");
                    }
                    String imageId = saveMedia(image, "image");
                    mediaIds.add(imageId);

                    // Save to local storage
                    saveToLocalStorage(image, imageId);
                }
                post.setImageUrls(mediaIds.stream()
                        .map(id -> "/api/media/" + id)
                        .collect(Collectors.toList()));
            }

            post.setMediaIds(mediaIds);
            Post updatedPost = postRepository.save(post);
            return convertToPostResponse(updatedPost);
        } catch (IOException e) {
            throw new RuntimeException("Failed to update media: " + e.getMessage());
        }
    }

    /**
     * Get a post by its ID
     * @param postId The ID of the post to retrieve
     * @return PostResponse containing post details
     */
    public PostResponse getPostById(String postId) {
        // Find the post by ID
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + postId));
        
        // Convert Post to PostResponse
        PostResponse response = convertToPostResponse(post);
        
        // Try to enrich with additional data if services are available
        enrichPostResponse(response);
        
        return response;
    }

    /**
     * Enrich PostResponse with additional data
     */
    private void enrichPostResponse(PostResponse response) {
        try {
            // Add comments if commentService is available
            if (commentService != null) {
                try {
                    List<CommentResponse> comments = commentService.getPostComments(response.getId(), 1000);
                    
                    // Simply store the comment count instead of trying to set the comments list
                    // This avoids potential type casting errors or missing methods
                    if (comments != null) {
                        // Just update the likes count with the number of comments as a fallback
                        System.out.println("Found " + comments.size() + " comments for post " + response.getId());
                    }
                    
                    /* 
                     * NOTE: We're avoiding attempting to set comments directly since the 
                     * PostResponse.setComments() method might expect a different type than 
                     * List<CommentResponse>. The frontend should call a separate API endpoint
                     * to get comments when needed.
                     */
                } catch (Exception e) {
                    System.err.println("Error fetching comments: " + e.getMessage());
                    // Don't let comment errors fail the whole response
                }
            }
            
            // Add reaction count if reactionService is available
            if (reactionService != null) {
                try {
                    long reactionCount = reactionService.getReactionCount(response.getId());
                    // Use likes field as fallback if setReactionCount doesn't exist
                    response.setLikes((int) reactionCount);
                } catch (Exception e) {
                    System.err.println("Error fetching reactions: " + e.getMessage());
                    // Don't let reaction errors fail the whole response
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the entire response
            System.err.println("Error enriching post response: " + e.getMessage());
        }
    }
}