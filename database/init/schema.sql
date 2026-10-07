CREATE TABLE IF NOT EXISTS healthcheck (
  id INT PRIMARY KEY AUTO_INCREMENT,
  note VARCHAR(50)
);

INSERT INTO healthcheck (note) VALUES ('hello from mysql');