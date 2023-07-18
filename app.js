const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "library2",
  multipleStatements: "true", //this is required for querying multiple statements in mysql
  port:8111,
});


//Home Page
app.get("/", async(req,res) => {
      pool.getConnection(function (err, connection) {
        connection.query(
          `SELECT * FROM announcements;`,
          async (err, data) => {
            connection.release();
            if (err) console.log(err);
            else res.json({ data });
          }
        );
      });
})

//All Ebook Publisher Show Page
app.get("/ebooks", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM ebooks_publisher where link=""; SELECT * FROM ebooks_publisher where link <> ""`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data:data[0], links:data[1] });
      }
    );
  });
});

//All Ebooks Of One particular Publisher
app.get('/ebooks/:id' , async(req,res)=> {
  const { id } = req.params;
    pool.getConnection(function(err , connection) {
        connection.query(
            `SELECT * FROM ebooks where publisher_id=${id};`, 
            async (err, data) => {
            connection.release();
            if (err) console.log(err);
            else
                res.json({ data });
            }
        )
    })
})


//Edit Individual Ebook Form Page
app.get('/ebooks/:publisher_id/:ebook_id',async(req,res)=>{
  const {publisher_id,ebook_id}=req.params;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM ebooks where book_id='${ebook_id}';`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data:data[0], links:data[1] });
      }
    );
  });
})

//Edit Individual Ebook Request
app.put('/ebooks/:publisher_id/:ebook_id',async(req,res)=>{
  const {title,link,publisherData,author}=req.body;
  const {ebook_id}=req.params
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT publisher_id FROM ebooks_publisher WHERE name='${publisherData}' `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          console.log(data);
          pool.getConnection(function (err2, connection2) {
            connection2.query(
              `UPDATE ebooks
              SET publisher = '${publisherData}',
                  author = '${author}',
                  title = '${title}',
                  link = '${link}',
                  year = 2023,
                  publisher_id = ${data[0].publisher_id}
              WHERE book_id = ${ebook_id};`,
              async (err2, data2) => {
                connection2.release();
                if (err2) console.log(err2);
              }
            );
          })
        }
      }
    );
  })
})

//Delete Individual Ebook
app.delete('/ebooks/:publisher_id/:ebook_id',async(req,res)=>{
  const {publisher_id,ebook_id}=req.params;
  pool.getConnection(function (err, connection) {
    connection.query(
      `DELETE FROM ebooks where book_id='${ebook_id}';`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data:data[0], links:data[1] });
      }
    );
  });
})


//Get All Pjournals
app.get("/pjournals", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM p_journals;`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data });
      }
    );
  });
});


//Get All Dailies
app.get("/dailies", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM dailies_and_mags;`, async (err, data) => {
      connection.release();
      if (err) console.log(err);
      else res.json({ data });
    });
  });
});


//Get All Ojournals Publishers
app.get("/ojournals", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM online_journals_publisher where type = "eshodh" and link=""; SELECT * FROM online_journals_publisher where type = "subscribed" and link=""; SELECT * FROM online_journals_publisher where type = "eshodh" and link <> ""; SELECT * FROM online_journals_publisher where type = "subscribed" and link <> ""; `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else
          res.json({
            eshodh: data[0],
            sub: data[1],
            elinks: data[2],
            slinks: data[3],
          });
      }
    );
  });
});

//Get All Ojounal Publisher
app.get("/online-publishers",async (req,res)=>{
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT name FROM online_journals_publisher `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          res.json({ data });
        }
      }
    );
  });
})

//POST NEW Ojournal
app.post("/new-ojournal",async(req,res)=>{
  console.log(req.body);
  const {title,link,publisherData}=req.body;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM online_journals_publisher WHERE online_journals_publisher.name='${publisherData}'`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          console.log(data);
          pool.getConnection(function (err2, connection2) {
            connection2.query(
              `INSERT INTO online_journals(publisher,title,link,year,publisher_id) VALUES('${publisherData}','${title}','${link}','OTHER',${data[0].publisher_id}) `,
              async (err2, data2) => {
                connection2.release();
                if (err2) console.log(err2);
              }
            );
          })
        }
      }
    );
  })
})

//Edit Individual Ojournal Form Page
app.get('/ojournals/:publisher_id/:ebook_id', async(req,res)=>{
  const {publisher_id,ebook_id}=req.params;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM ebooks where book_id='${ebook_id}';`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data:data[0], links:data[1] });
      }
    );
  });
})

//Edit Individual Online Journal Request
app.put('/ojournals/:publisher_id/:journal_id',async(req,res)=>{
  const {title,link,publisherData}=req.body;
  const {journal_id}=req.params
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT publisher_id FROM online_journals_publisher WHERE online_journals_publisher.name='${publisherData}' `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          console.log(data);
          pool.getConnection(function (err2, connection2) {
            connection2.query(
              `UPDATE online_journals
              SET publisher = '${publisherData}',
                  title = '${title}',
                  link = '${link}',
                  year = 'OTHER',
                  publisher_id = ${data[0].publisher_id}
              WHERE journal_id = ${journal_id};`,
              async (err2, data2) => {
                connection2.release();
                if (err2) console.log(err2);
              }
            );
          })
        }
      }
    );
  })
})

//Delete Individual Online Ojournal
app.delete('/ojournals/:publisher_id/:journal_id',async(req,res)=>{
  const {publisher_id,journal_id}=req.params;
  pool.getConnection(function (err, connection) {
    connection.query(
      `DELETE FROM ebooks where journal_id='${journal_id}';`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data:data[0], links:data[1] });
      }
    );
  });
})


//Get All Ojournals for one particular publisher
app.get("/ojournals/:id", async (req, res) => {
  const { id } = req.params;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM online_journals where publisher_id=${id};`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data });
      }
    );
  });
});


//Get All Ebook Publishers
app.get("/publishers",async (req,res)=>{
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT name FROM ebooks_publisher `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          res.json({ data });
        }
      }
    );
  });
})

//New Ebook Post Request
app.post("/new-ebook",async(req,res)=>{
  console.log(req.body);
  const {title,link,publisher,author}=req.body;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT publisher_id FROM ebooks_publisher WHERE name='${publisher}' `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          console.log(data);
          pool.getConnection(function (err2, connection2) {
            connection2.query(
              `INSERT INTO ebooks(publisher,author,title,link,year,publisher_id) VALUES('${publisher}','${author}','${title}','${link}',2023,${data[0].publisher_id}) `,
              async (err2, data2) => {
                connection2.release();
                if (err2) console.log(err2);
              }
            );
          })
        }
      }
    );
  })
})


//Excel Upload for New Ebook Post Request
app.post("/multiple-new-ebook",async(req,res)=>{
  console.log(req.body);
  const {ebooks,publishers}=req.body;
  const allPublishersPresent =await ebooks.every(({Publisher}) => publishers.some(({name}) => name === Publisher));
  if(allPublishersPresent===true){
    ebooks.forEach((ebook)=>{
      const {Title,Link,Publisher,Author}=ebook;
      pool.getConnection(function (err, connection) {
        connection.query(
          `SELECT publisher_id FROM ebooks_publisher WHERE name='${Publisher}' `,
          async (err, data) => {
            connection.release();
            if (err) console.log(err);
            else {
              console.log(data);
              pool.getConnection(function (err2, connection2) {
                connection2.query(
                  `INSERT INTO ebooks(publisher,author,title,link,year,publisher_id) VALUES('${Publisher}','${Author}','${Title}','${Link}',2023,${data[0].publisher_id}) `,
                  async (err2, data2) => {
                    connection2.release();
                    if (err2) console.log(err2);
                  }
                );
              })
            }
          }
        );
      })
    })
    const responseData = { message: 'The request was successful.',color:'success' };
  
    // Send the response data back to the client
    res.send(responseData);
  }
  else{
    const responseData = { message: 'Some of the publishers where not present in the database',color:'danger' };
  
  // Send the response data back to the client
    res.send(responseData);
  }

})

app.listen(7000, () => {
  console.log("LISTENING ON PORT 7000!");
});