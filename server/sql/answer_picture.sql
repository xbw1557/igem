CREATE TABLE `answer_picture` (
  `unique_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '主键',
 `answer_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '回答ID', 
    `img` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '图片URL',
     PRIMARY KEY (`unique_id`),
 KEY `answer_picture` (`unique_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回答描述图片'
   