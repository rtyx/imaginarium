-- DROP TABLE pictures CASCADE;
DROP TABLE comments;

-- CREATE TABLE pictures (
-- id SERIAL primary key,
-- uploader VARCHAR(255),
-- filename VARCHAR(255),
-- title VARCHAR(255),
-- description VARCHAR(255),
-- timecreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


CREATE TABLE comments (
id SERIAL primary key,
picture_id INTEGER REFERENCES pictures(id),
comment TEXT not null,
commenter VARCHAR(255),
timecreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
