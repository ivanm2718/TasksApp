1. Added database connection data with password into .env file
    - make sure you: npm install dotenv
    - change data if neccessary for your own database

2. Update database specification:
    - get rid of excess columns in tasks table in DB, so the only remaining ones that we keep are (id, name, completed, user_id) -->first drop all existing tasks to avoid errors (DELETE FROM tasks), then (ALTER TABLE tasks DROP COLUMN ...)
    - add password column to user table --> first drop all existing users(DELETE FROM users), than add password column (ALTER TABLE users ADD password VARCHAR(255) NOT NULL)

3. Make sure you change routes to your own API routes into fetch calls inside TasksApplication.html file