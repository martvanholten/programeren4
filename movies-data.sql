-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
-- DROP TABLE IF EXISTS `studio` ;
-- DROP TABLE IF EXISTS `movies` ;
-- DROP TABLE IF EXISTS `user` ;
CREATE TABLE IF NOT EXISTS `user` (
	`ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`First_Name` VARCHAR(32) NOT NULL,
	`Last_Name` VARCHAR(32) NOT NULL,
	`Email` VARCHAR(32) NOT NULL UNIQUE,
	`Student_Number` VARCHAR(32) NOT NULL,
	`Password` CHAR(64) BINARY NOT NULL,
	PRIMARY KEY (`ID`)
)
ENGINE = InnoDB;

-- Voorbeeld insert query. Wanneer je in Nodejs de ? variant gebruikt hoeven de '' niet om de waarden.
-- Zet die dan wel in het array er na, in de goede volgorde.
-- In je Nodejs app zou het password wel encrypted moeten worden.
INSERT INTO `user` (`First_Name`, `Last_Name`, `Email`, `Student_Number`, `Password` ) VALUES
('Marieke', 'Jansen', 'm.jansen@mail.nl','222222', 'secret');

-- -----------------------------------------------------
-- Table `studio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `studio` ;
CREATE TABLE IF NOT EXISTS `studio` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(128) NOT NULL UNIQUE,
	`userid` INT UNSIGNED NOT NULL,
	PRIMARY KEY (`id`)
)
ENGINE = InnoDB;

ALTER TABLE `studio`
ADD CONSTRAINT `fk_studio_user`
FOREIGN KEY (`userid`) REFERENCES `user` (`id`)
ON DELETE NO ACTION
ON UPDATE CASCADE;

INSERT INTO `studio` (`id`, `name`, `userid`) VALUES
(1, 'Paramount', 1),
(2, 'Warner Brothers', 1),
(3, 'Disney', 1),
(4, 'Metro Goldwyn Mayer', 1),
(5, 'Pixar Studios', 1);

-- -----------------------------------------------------
-- Table `movies`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `movies` ;
CREATE TABLE IF NOT EXISTS `movies` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(128) NOT NULL UNIQUE,
	`releaseyear` INT UNSIGNED,
	`studioid` INT UNSIGNED NOT NULL,
	`ageCategory` ENUM('all', 'children', 'adults') DEFAULT 'all',
	`inTheatres` BOOL DEFAULT 0, -- 0 = false, 1 = true
	`userid` INT UNSIGNED NOT NULL,
	PRIMARY KEY (`id`)
)
ENGINE = InnoDB;

ALTER TABLE `movies`
ADD CONSTRAINT `fk_movies_user`
FOREIGN KEY (`userid`) REFERENCES `user` (`id`)
ON DELETE NO ACTION
ON UPDATE CASCADE,
ADD CONSTRAINT `fk_movies_studio`
FOREIGN KEY (`studioid`) REFERENCES `studio` (`id`)
ON DELETE NO ACTION
ON UPDATE CASCADE;



-- Voorbeeld insert query. Wanneer je in Nodejs de ? variant gebruikt hoeven de '' niet om de waarden.
INSERT INTO `movies` (`name`, `releaseyear`, `studioid`, `ageCategory`, `inTheatres`, `userid`) VALUES
('Finding Nemo', 2003, 5, 'all', 1, 1),
('The Shawshank Redemption', 1994, 4, 'all', 1, 1),
('The Godfather', 1972, 4, 'adults', 1, 1),
('The Dark Knight', 2008, 4, 'adults', 1, 1),
('The Godfather Part II', 1974, 4, 'adults', 0, 1),
('The Lord of the Rings, Return of the King', 2003, 4, 'children', 0, 1),
('Pulp Fiction', 1994, 4, 'adults', 0, 1),
("Schindler's List", 1993, 4, 'children', 1, 1),
('Inception', 2010, 2, 'children', 1, 1),
('Blade Runner', 1982, 1, 'children', 1, 1),
('Goodfellas', 1990, 1, 'adults', 1, 1);
