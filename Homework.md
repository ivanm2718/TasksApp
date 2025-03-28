1. On page load => register and login screen
2. LOGIN :
    a) if unsuccesful, show some small error message on page
    b) if sucessful:
        1. if admin:
        Screen should display admin panel, it should display add new task button
        (only admin can add new task, and on task creation there should be a dropdown that gets all users and you assign task to 
        a user that you choose), it should also display all users and make you be able delete them, and display all tasks for all users with the possibility of - change complete status, update task, delete. Each task should show task name and which user is it assigned to (and they change css to grey and strikethrough when completed)
        2. if user:
        Screen should display Hello user(include name). User should just see all of the tasks assigned to himself, and be able to change completion, update and delete them. (or if easier if you, you can just make user change completion status and not change anything else)
3. Make logout button display on both admin panel and logged in user page and implement logout on frontend