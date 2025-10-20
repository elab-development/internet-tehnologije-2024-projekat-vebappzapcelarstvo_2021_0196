CREATE TABLE Users(
	id int IDENTITY(1,1) PRIMARY KEY,
	username varchar(255) NOT NULL,
	password varchar(255) NOT NULL,
	name varchar(255) NOT NULL,
	surname varchar(255) NOT NULL,
	role varchar(255) NOT NULL
)