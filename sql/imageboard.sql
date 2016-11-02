DROP TABLE IF EXISTS images;

CREATE TABLE images(
    id SERIAL primary key,
    url Varchar(225) not null,
    title Varchar(225),
    description Varchar(255),
    user_name Varchar(255),
    createdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL primary key,
    img_id  INT,
    user_name Varchar(225)  not null,
    comment Varchar(255) not null,
    createdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
