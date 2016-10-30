
DROP TABLE IF EXISTS images;
CREATE TABLE images (
    id SERIAL primary key,
    url VARCHAR(255) not null,
    title VARCHAR(255),
    description VARCHAR(255),
    user_name VARCHAR(255) not null,
    created_at TIMESTAMP default CURRENT_TIMESTAMP

);

DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    id SERIAL primary key,
    image_id INTEGER,
    username_comment VARCHAR(255) not null,
    comment TEXT,
    created_at TIMESTAMP default CURRENT_TIMESTAMP
);
