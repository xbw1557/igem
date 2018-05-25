CREATE TABLE `user` (
 `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'open id',
 `name` varchar(100) COLLATE utf8mb4_unicode_ci COMMENT '用户名',
 `avatar` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '头像地址',
  `intro` varchar(512) COLLATE utf8mb4_unicode_ci  COMMENT '自我介绍',
   `status` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '身份',
    `radio` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '电台',
    `school` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '学校',
    `project` varchar(512) COLLATE utf8mb4_unicode_ci COMMENT '项目',
 PRIMARY KEY (`open_id`),
 KEY `openid` (`open_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户'