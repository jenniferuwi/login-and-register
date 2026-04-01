const express=require('express');
const mysql=require('mysql2');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const app=express();
app.use(express.json());
const secret="secret123";
//db connection
const db=mysql.createConnection({
host:'localhost',
user:'root',
password:'',
database:'backend_app'
});
db.connect((err=>{
if(err){
console.log("connect to database fail",err);
}
else{
console.log("connect to databse succusefully");
}
}));
// sign up user
app.post('/register',async(req,res)=>{
const{name,email,password}=req.body;
db.query('SELECT * FROM users WHERE email=?',[email],async(err,results)=>{
  if(results.length>0){
res.status(400).json({messsage:"already email is exist"});
  }
 const hashedpassword = await bcrypt.hash(password,12);
 db.query('INSERT INTO users(name,email,password) VALUES(?,?,?)',[name,email,hashedpassword],async(err,results)=>{
if(err){
 res.status(500).json({message:"Error to register user",error:err})
}
 });
});
});

// log in
app.post('/login',async (req, res)=>{
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create token using JWT
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "1d"
    });

    res.status(200).json({
      message: "Login successful",
      token: token
    });
  });
});

//students table

app.post('/insert', async (req, res) => {
  const { name, email, year } = req.body;

  db.query('SELECT * FROM students WHERE email=?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "already email is exist" });
    }

    db.query(
      "INSERT INTO students(name,email,year) VALUES(?,?,?)",
      [name, email, year],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: "failed to insert", error: err });
        }

        res.status(201).json({ message: "insert successfully" });
      }
    );
  });
});



app.get('/select', (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "error fetching data", error: err });
    }

    res.status(200).json(results);
  });
});


app.get('/select/:id', (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM students WHERE id=?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "student not found" });
    }

    res.status(200).json(results[0]);
  });
});



app.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { name, email, year } = req.body;

  db.query(
    "UPDATE students SET name=?, email=?, year=? WHERE id=?",
    [name, email, year, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "update failed", error: err });
      }

      res.status(200).json({ message: "update successfully" });
    }
  );
});


app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM students WHERE id=?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "delete failed", error: err });
    }

    res.status(200).json({ message: "delete successfully" });
  });
});


app.listen(8000,()=>{
console.log("server is running on port 8000");
});

