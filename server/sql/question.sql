CREATE TABLE `question` (
 `question_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '问题ID',
 `feed_source_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发帖用户ID',
  `feed_source_name` varchar(100) COLLATE utf8mb4_unicode_ci  COMMENT '发帖用户名', 
    `feed_source_img` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '发帖用户头像',
    `question` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '问题标题',
    `answer_ctnt` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '最新回答内容',
    `good_num` int COLLATE utf8mb4_unicode_ci COMMENT '浏览数',
    `comment_num` int COLLATE utf8mb4_unicode_ci COMMENT '评论数',
    `question_detail` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '问题详情',
 PRIMARY KEY (`question_id`),
 KEY `question_id` (`question_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题概述'
   