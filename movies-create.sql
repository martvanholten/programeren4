DROP DATABASE IF EXISTS `movies`;
CREATE DATABASE `movies`;
-- DROP DATABASE IF EXISTS `movies_testdb`;
-- CREATE DATABASE `movies_testdb`;
-- movies_user aanmaken
CREATE USER 'movies_user'@'localhost' IDENTIFIED BY 'secret';
CREATE USER 'movies_user'@'%' IDENTIFIED BY 'secret';
-- geef rechten aan deze user
GRANT SELECT, INSERT, DELETE, UPDATE ON `movies`.* TO 'movies_user'@'%';

USE `movies`;
