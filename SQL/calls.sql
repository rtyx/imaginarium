DROP TABLE images CASCADE;
DROP TABLE comments CASCADE;

CREATE TABLE images (
    ID SERIAL primary key,
    Created TIMESTAMP DEFAULT now(),
    Username VARCHAR(225) not null,
    URL TEXT not null,
    Title VARCHAR(225) not null,
    Description TEXT,
    Tags TEXT[] not null,
    Likes INT
);
CREATE TABLE comments (
    ID SERIAL primary key,
    Created TIMESTAMP DEFAULT now(),
    ImageID INT references images(ID),
    Username VARCHAR(225) not null,
    Comment TEXT not null
);
