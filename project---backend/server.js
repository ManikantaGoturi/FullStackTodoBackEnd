const express = require('express');
const sqlite3 = require('sqlite3');
const {open} = require("sqlite");
const path = require('path');
const cors = require('cors'); 



const app = express();
app.use(express.json());
app.use(cors());

let db;

const initializeDBandServer = async() =>{
    try{
        db = await open({
            filename: path.join(__dirname,"todo.db"),
            driver: sqlite3.Database,
        });
        app.listen(3000, ()=>{
            console.log("Server is running on http://localhost:3000/");
        });
    } catch(error){
        console.log(`Database error is ${error.message}`);
        process.exit(1);
    }
};

initializeDBandServer();

app.post("/api/todos", async (req,res)=>{
    /*const todoDetails = req.body;
    const {
        todoName,
        isDone,
        createdAt,
        updatedAt,
    } = todoDetails;
    const addTodoQuery = `
    INSERT INTO todos(todo_name,is_done,created_at,updated_at) VALUES ('${todoName}',${isDone},'${createdAt}','${updatedAt}');
    `;

    const dbResponse = await db.run(addTodoQuery);
    const todoId = dbResponse.lastID;
    res.send({todoId:todoId});*/

    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    try {
        const result = await db.run("INSERT INTO todos (name) VALUES (?)", [
            name,
        ]);
        res.json({
            id: result.lastID,
            name,
            isDone: false,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error creating todo:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/todos', async (req,res) => {
    /*const getTodoQuery = `SELECT * FROM todos;`;
    const todos = await db.get(getTodoQuery);
    res.send(todos)*/

    try {
        const todos = await db.all("SELECT * FROM todos");
        res.json(todos);
    } catch (error) {
        console.error("Error retrieving todos:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }

});

// To get particular todoItem //

/*app.get('/api/todos/:todoId/', async(req,res)=>{
    const {todoId} = req.params;
    const getTodoQuery = `SELECT * FROM todos WHERE todo_id = ${todoId};`;
    const todo = await db.get(getTodoQuery);
    res.send(todo)
});*/


app.delete('/api/todos/:todoId/', async(req,res)=>{
    /*const {todoId} = req.params;
    const deleteTodoId = `DELETE FROM todos WHERE todo_id = ${todoId};`;
    await db.run(deleteTodoId);
    res.send("Book Deleted Successfully");*/

    const { id } = req.params;

    try {
        const result = await db.run("DELETE FROM todos WHERE id = ?", [id]);
        if (result.changes === 0) {
            res.status(404).json({ error: "Todo not found" });
        } else {
            res.json({ message: "Todo deleted successfully" });
        }
    } catch (error) {
        console.error("Error deleting todo:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//module.exports = app; //