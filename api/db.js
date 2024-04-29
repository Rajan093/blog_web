import mysql from "mysql"
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createConnection({ host: process.env.HOST, user: process.env.USERNAME, password: process.env.PASSWORD, database: process.env.DATABASE, port: process.env.PORT, ssl: { ca: fs.readFileSync(process.env.SSL) } });


// export const db=mysql.createConnection({host:"dbmsblog.mysql.database.azure.com", user:"Rajan093", password:"dbms@202251093", database:""dbms@202251093"", port:3306, ssl:{ca:fs.readFileSync("/Users/apple/Downloads/DigiCertGlobalRootCA.crt.pem")}});

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Connected to the database");
    }
});