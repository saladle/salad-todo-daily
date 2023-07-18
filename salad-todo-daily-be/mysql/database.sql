SET NAMES 'utf8';

USE salad_todo_daily;

DROP TABLE IF EXISTS user;

DROP TABLE IF EXISTS project;

CREATE TABLE IF NOT EXISTS user (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(256) NOT NULL,
    email VARCHAR(256) NOT NULL,
    password VARCHAR(256) NOT NULL,
    PRIMARY KEY (id)
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS project (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    startDate TIMESTAMP DEFAULT NULL,
    finishDate TIMESTAMP DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    PRIMARY KEY (id)
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS tag (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    color VARCHAR(20),
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS task (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    projectId INT,
    description TEXT,
    startDate TIMESTAMP DEFAULT NULL,
    finishDate TIMESTAMP DEFAULT NULL,
    priority TINYINT DEFAULT 1,
    -- 0: Chưa xác định, 1: Ưu tiên thấp, 2: Ưu tiêu trung bình, 3: Ưu tiên cao
    status TINYINT DEFAULT 0,
    -- 0: Chờ thực hiện, 1: Đang thực hiện, 2: Hoàn thành
    checkList JSON,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    FOREIGN KEY (projectId) REFERENCES project(id)
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS task_daily (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    tagId INT,
    startDate TIMESTAMP DEFAULT NULL,
    finishDate TIMESTAMP DEFAULT NULL,
    priority TINYINT DEFAULT 1,
    -- 0: Chưa xác định, 1: Ưu tiên thấp, 2: Ưu tiêu trung bình, 3: Ưu tiên cao   
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    FOREIGN KEY (tagId) REFERENCES tag(id)
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS note (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    content TEXT,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_0900_ai_ci;

INSERT INTO user (name, email, password)
VALUES ('Nguyen Van A', '3wqjX@example.com', '123456'),
       ('Salad Lê', 'leduchyu10@gmail.com', '123456');

INSERT INTO project (name, description, color, isDeleted, startDate, createdAt)
VALUES ('Project Đồ án 1', '', 'green', FALSE, NOW(), NOW());

INSERT INTO tag (name, color, createdBy)
VALUES ('Sức khỏe', 'green', 2),
       ('Trí não', 'blue', 2),
       ('Công việc', 'red', 2);

INSERT INTO task (name, projectId, description, startDate, finishDate, priority, status, checkList, createdBy)
VALUES ('Lập trình màn', 7, 'mô tả', '2023-07-16 14:52:20', NULL, 1, 0, '[]', 1);

INSERT INTO task_daily (name, description, tagId, startDate, finishDate, priority, createdBy)
VALUES ('Chống đẩy', '', 1, '2023-07-18 14:52:20', NULL, 1, 2),
        ('Check mail', '', 2, '2023-07-18 14:52:20', NULL, 1, 2);

INSERT INTO note(title, content, createdBy)
VALUES ('Làm bài JLPT', 'nhớ làm bài đừng quên', 2); 