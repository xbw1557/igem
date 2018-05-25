CREATE TABLE `answer` (
   `answer_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '回答ID',
 `question_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属问题ID',
 `feed_source_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发帖用户ID',
  `feed_source_name` varchar(100) COLLATE utf8mb4_unicode_ci  COMMENT '发帖用户名', 
    `feed_source_img` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '发帖用户头像',
    `answer_ctnt` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '回答内容',
    `good_num` int COLLATE utf8mb4_unicode_ci COMMENT '点赞数',
    `time` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '发帖时间',
     `picture_num` int COLLATE utf8mb4_unicode_ci COMMENT '附图数量',
 PRIMARY KEY (`answer_id`),
 KEY `answer` (`answer_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回帖'
   