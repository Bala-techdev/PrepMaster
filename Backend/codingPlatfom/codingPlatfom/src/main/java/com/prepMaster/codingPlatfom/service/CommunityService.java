package com.prepMaster.codingPlatfom.service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateCommunityCommentRequest;
import com.prepMaster.codingPlatfom.dto.request.CreateCommunityPostRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateCommunityCommentRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateCommunityPostRequest;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Activity;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Author;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Comment;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.LikeState;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Paged;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.PostDetail;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.PostSummary;
import com.prepMaster.codingPlatfom.entity.CommunityComment;
import com.prepMaster.codingPlatfom.entity.CommunityLike;
import com.prepMaster.codingPlatfom.entity.CommunityPost;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.enums.NotificationType;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.CommunityCommentRepository;
import com.prepMaster.codingPlatfom.repository.CommunityLikeRepository;
import com.prepMaster.codingPlatfom.repository.CommunityPostRepository;
import com.prepMaster.codingPlatfom.util.CommunityText;

@Service
@Transactional
public class CommunityService {

	private static final Map<String, String> TOPICS = topicMap();

	private final CommunityPostRepository posts;
	private final CommunityCommentRepository comments;
	private final CommunityLikeRepository likes;
	private final CommunityRateLimiter rateLimiter;
	private final NotificationService notifications;
	private final UserService users;

	public CommunityService(CommunityPostRepository posts, CommunityCommentRepository comments,
			CommunityLikeRepository likes, CommunityRateLimiter rateLimiter, NotificationService notifications,
			UserService users) {
		this.posts = posts;
		this.comments = comments;
		this.likes = likes;
		this.rateLimiter = rateLimiter;
		this.notifications = notifications;
		this.users = users;
	}

	@Transactional(readOnly = true)
	public List<String> topics() {
		return List.copyOf(TOPICS.values());
	}

	public Paged<PostSummary> list(Long userId, int page, int size, String search, String topic, String sort) {
		int safePage = Math.max(0, page);
		int safeSize = Math.min(50, Math.max(1, size));
		String cleanSearch = normalizeSearch(search);
		String canonicalTopic = topic == null || topic.isBlank() || topic.equalsIgnoreCase("All")
				? null : canonicalTopic(topic);

		if ("popular".equalsIgnoreCase(sort)) {
			List<CommunityPost> matching = new ArrayList<>(posts.searchAll(canonicalTopic, cleanSearch));
			matching.sort(Comparator
					.comparingLong((CommunityPost post) -> likes.countForPost(post.getId())).reversed()
					.thenComparing(CommunityPost::getCreatedAt, Comparator.reverseOrder())
					.thenComparing(CommunityPost::getId, Comparator.reverseOrder()));
			int from = Math.min(matching.size(), safePage * safeSize);
			int to = Math.min(matching.size(), from + safeSize);
			List<PostSummary> content = matching.subList(from, to).stream()
					.map(post -> toSummary(post, userId)).toList();
			int totalPages = matching.isEmpty() ? 0 : (int) Math.ceil((double) matching.size() / safeSize);
			return new Paged<>(content, safePage, safeSize, matching.size(), totalPages);
		}

		Page<CommunityPost> rows = posts.search(canonicalTopic, cleanSearch,
				PageRequest.of(safePage, safeSize,
						Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
		return new Paged<>(rows.getContent().stream().map(post -> toSummary(post, userId)).toList(),
				rows.getNumber(), rows.getSize(), rows.getTotalElements(), rows.getTotalPages());
	}

	public PostDetail get(Long userId, Long postId) {
		CommunityPost post = requirePost(postId);
		return new PostDetail(post.getId(), post.getTitle(), post.getBody(), post.getTopic(),
				toAuthor(post.getUser()), likes.countForPost(postId),
				comments.countByPostId(postId), likes.existsByPostAndUser(postId, userId),
				post.getUser().getId().equals(userId), toInstant(post.getCreatedAt()),
				toInstant(post.getUpdatedAt()));
	}

	public PostDetail create(Long userId, CreateCommunityPostRequest request) {
		rateLimiter.checkPost(userId);
		User user = users.require(userId);
		String title = requireVisible(CommunityText.clean(request.title(), 160), "Post title");
		String body = requireVisible(CommunityText.clean(request.body(), 4000), "Post body");
		String topic = canonicalTopic(request.topic());
		CommunityPost saved = posts.save(new CommunityPost(user, title, body, topic));
		return get(userId, saved.getId());
	}

	public PostDetail update(Long userId, Long postId, UpdateCommunityPostRequest request) {
		CommunityPost post = requireOwnedPost(postId, userId);
		post.update(requireVisible(CommunityText.clean(request.title(), 160), "Post title"),
				requireVisible(CommunityText.clean(request.body(), 4000), "Post body"),
				canonicalTopic(request.topic()));
		return get(userId, postId);
	}

	public void delete(Long userId, Long postId) {
		CommunityPost post = requireOwnedPost(postId, userId);
		posts.delete(post);
	}

	public LikeState toggleLike(Long userId, Long postId) {
		CommunityPost post = requirePost(postId);
		User actor = users.require(userId);
		boolean liked = likes.existsByPostAndUser(postId, userId);
		if (liked) {
			likes.deleteByPostAndUser(postId, userId);
			notifications.deleteByDedupeKey(post.getUser().getId(), likeKey(postId, userId));
		} else {
			likes.save(new CommunityLike(post, actor));
			if (!post.getUser().getId().equals(userId)) {
				notifications.create(post.getUser().getId(), NotificationType.COMMUNITY_ACTIVITY,
						"New like on your post", displayName(actor) + " liked \"" + post.getTitle() + "\".",
						"/community/" + postId, likeKey(postId, userId));
			}
		}
		return new LikeState(likes.countForPost(postId), !liked);
	}

	@Transactional(readOnly = true)
	public Paged<Comment> comments(Long userId, Long postId, int page, int size) {
		requirePost(postId);
		int safePage = Math.max(0, page);
		int safeSize = Math.min(50, Math.max(1, size));
		Page<CommunityComment> rows = comments.findByPostIdOrderByCreatedAtAsc(postId,
				PageRequest.of(safePage, safeSize));
		return new Paged<>(rows.getContent().stream().map(comment -> toComment(comment, userId)).toList(),
				rows.getNumber(), rows.getSize(), rows.getTotalElements(), rows.getTotalPages());
	}

	public Comment addComment(Long userId, Long postId, CreateCommunityCommentRequest request) {
		rateLimiter.checkComment(userId);
		CommunityPost post = requirePost(postId);
		User actor = users.require(userId);
		String body = requireVisible(CommunityText.clean(request.body(), 2000), "Comment");
		CommunityComment saved = comments.save(new CommunityComment(post, actor, body));
		if (!post.getUser().getId().equals(userId)) {
			String snippet = body.length() > 120 ? body.substring(0, 120) + "..." : body;
			notifications.create(post.getUser().getId(), NotificationType.COMMUNITY_ACTIVITY,
					"New comment on your post", displayName(actor) + ": " + snippet,
					"/community/" + postId, null);
		}
		return toComment(saved, userId);
	}

	public Comment updateComment(Long userId, Long commentId, UpdateCommunityCommentRequest request) {
		CommunityComment comment = requireOwnedComment(commentId, userId);
		comment.update(requireVisible(CommunityText.clean(request.body(), 2000), "Comment"));
		return toComment(comment, userId);
	}

	public void deleteComment(Long userId, Long commentId) {
		CommunityComment comment = requireOwnedComment(commentId, userId);
		comments.delete(comment);
	}

	@Transactional(readOnly = true)
	public List<Activity> activity(Long userId, int limit) {
		int safeLimit = Math.min(20, Math.max(1, limit));
		List<Activity> items = new ArrayList<>();
		for (CommunityPost post : posts.findTop10ByOrderByCreatedAtDesc()) {
			items.add(new Activity("POST", post.getId(), post.getTitle(), displayName(post.getUser()),
					"shared " + excerpt(post.getBody(), 100), toInstant(post.getCreatedAt())));
		}
		for (CommunityComment comment : comments.findTop10ByOrderByCreatedAtDesc()) {
			items.add(new Activity("COMMENT", comment.getPost().getId(), comment.getPost().getTitle(),
					displayName(comment.getUser()), excerpt(comment.getBody(), 100),
					toInstant(comment.getCreatedAt())));
		}
		items.sort(Comparator.comparing(Activity::at, Comparator.nullsLast(Comparator.reverseOrder())));
		return items.size() <= safeLimit ? items : items.subList(0, safeLimit);
	}

	private PostSummary toSummary(CommunityPost post, Long userId) {
		return new PostSummary(post.getId(), post.getTitle(), excerpt(post.getBody(), 180), post.getTopic(),
				toAuthor(post.getUser()), likes.countForPost(post.getId()),
				comments.countByPostId(post.getId()), likes.existsByPostAndUser(post.getId(), userId),
				post.getUser().getId().equals(userId), toInstant(post.getCreatedAt()),
				toInstant(post.getUpdatedAt()));
	}

	private Comment toComment(CommunityComment comment, Long userId) {
		return new Comment(comment.getId(), comment.getPost().getId(), comment.getBody(),
				toAuthor(comment.getUser()), comment.getUser().getId().equals(userId),
				toInstant(comment.getCreatedAt()), toInstant(comment.getUpdatedAt()));
	}

	private Author toAuthor(User user) {
		String displayName = displayName(user);
		String avatar = user.getProfile() == null ? null : user.getProfile().getAvatarUrl();
		return new Author(user.getId(), user.getUsername(), displayName, avatar);
	}

	private CommunityPost requirePost(Long postId) {
		return posts.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Community post not found: " + postId));
	}

	private CommunityPost requireOwnedPost(Long postId, Long userId) {
		CommunityPost post = requirePost(postId);
		if (!post.getUser().getId().equals(userId)) {
			throw new ResourceNotFoundException("Community post not found: " + postId);
		}
		return post;
	}

	private CommunityComment requireOwnedComment(Long commentId, Long userId) {
		CommunityComment comment = comments.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
		if (!comment.getUser().getId().equals(userId)) {
			throw new ResourceNotFoundException("Comment not found: " + commentId);
		}
		return comment;
	}

	private static String canonicalTopic(String topic) {
		String key = topic == null ? "" : topic.trim().toLowerCase(Locale.ROOT);
		String canonical = TOPICS.get(key);
		if (canonical == null) {
			throw new BusinessRuleException("Choose one of the available community topics.");
		}
		return canonical;
	}

	private static String requireVisible(String value, String label) {
		if (value == null || value.isBlank()) {
			throw new BusinessRuleException(label + " must contain visible text.");
		}
		return value;
	}

	private static String normalizeSearch(String search) {
		if (search == null) {
			return null;
		}
		String trimmed = search.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private static String displayName(User user) {
		return user.getProfile() == null || user.getProfile().getDisplayName() == null
				? user.getUsername() : user.getProfile().getDisplayName();
	}

	private static String excerpt(String value, int max) {
		String normalized = value.replace('\n', ' ').trim();
		return normalized.length() <= max ? normalized : normalized.substring(0, max) + "...";
	}

	private static Instant toInstant(java.time.LocalDateTime value) {
		return value == null ? null : value.toInstant(ZoneOffset.UTC);
	}

	private static String likeKey(Long postId, Long userId) {
		return "LIKE:" + postId + ":" + userId;
	}

	private static Map<String, String> topicMap() {
		Map<String, String> values = new LinkedHashMap<>();
		List<String> canonical = List.of("DSA", "Java OOP", "System Design", "Interview Preparation", "General");
		for (String topic : canonical) {
			values.put(topic.toLowerCase(Locale.ROOT), topic);
		}
		return java.util.Collections.unmodifiableMap(values);
	}
}
