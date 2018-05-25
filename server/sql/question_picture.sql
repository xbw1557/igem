CREATE TABLE `question_picture` (
   `unique_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '主键',
 `question_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '问题ID', 
    `img` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '图片URL',
     PRIMARY KEY (`unique_id`),
 KEY `question_picture` (`unique_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题描述图片'
   