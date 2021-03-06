export const originalSql = `# SAMPLE ERD FILE
# To create a comment start a line with #.

# To create a table copy and paste the SQL
create table AUTHOR (
AUTHOR_ID INT NOT NULL,
NAME VARCHAR(50) NOT NULL,
POSTCODE VARCHAR(50)
)

# Or put the table name in square brackets and the fields like so:

[BOOK]
BOOK_ID INT NOT NULL,
AUTHOR_ID INT NOT NULL,
NAME VARCHAR(50) NOT NULL,

[OWNER]
OWNER_ID INT NOT NULL,
NAME VARCHAR(ABC50) NOT NULL,

[INVENTORY]
INVENTORY_ID INT NOT NULL,
OWNER_ID INT NOT NULL,
BOOK_ID INT NOT NULL
CREATED_DATE_UTC
CREATED_BY