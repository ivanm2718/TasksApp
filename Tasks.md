# Task List App with Vue.js

You have been provided an html and css skeleton for your todays task. Your task is to implement CRUD (Create, Read, Update, Delete) functionality for tasks using Vue.js. First we will do it storing tasks locally as an array, and later we are going to connect it to our pre-existing server. You are going to do the first version (with an array), with steps provided below. If stuck, refer to vue.js documentation (https://vuejs.org/guide/introduction.html) or feel free to call me to help you. 



---

## Things to do

Step 1: Add a New Task
---
In the addTask function, push the newTask object into the tasks array.
Reset the newTask object and hide the form after adding the task.

Step 2: Delete a Task
---
In the deleteTask function, remove the task at the specified index from the tasks array.

Step 3: Toggle Task Completion Status
---
In the toggleTaskStatus function, toggle the completed property of the task at the specified index.

Step 4: Update a Task
---
In the editTask function, populate the updatedTask object with the data of the task being edited.
In the saveUpdatedTask function, update the task in the tasks array with the data from updatedTask.



explanation:
How does Vue.js work here?

Two-way data binding (v-model)
v-model="newTask.name" ensures that input in the field automatically updates the value of the newTask.name variable.

Conditional rendering (v-if)
v-if="showTaskForm" displays the form only when showTaskForm is set to true.

Looping through the list (v-for)
v-for="(task, index) in tasks" dynamically generates the task list.

Reactivity (ref())
Vue automatically updates the displayed content when the value of a variable (e.g., tasks) changes.