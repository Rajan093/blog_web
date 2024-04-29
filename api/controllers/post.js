import { db } from "../db.js";
import jwt from "jsonwebtoken";

// export const getPosts = (req, res) => {
//   const q = req.query.cat
//     ? "SELECT * FROM posts WHERE cat=?"
//     : "SELECT * FROM posts";

//   db.query(q, [req.query.cat], (err, data) => {
//     if (err) return res.status(500).send(err);

//     return res.status(200).json(data);
//   });
// };

export const getPosts = (req, res) => {
  // Determine the SQL query based on the presence of the 'cat' query parameter
  const q = req.query.cat
    ? "SELECT * FROM posts WHERE cat = ?"
    : "SELECT * FROM posts";

  // Extract the category from the request query parameters
  const category = req.query.cat;

  // Execute the database query with the constructed SQL query and category parameter
  db.query(q, [category], (err, data) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).json({ error: "Failed to fetch posts." });
    }

    // Return the fetched posts as JSON response with a success status
    return res.status(200).json(data);
  });
};


// export const getPost = (req, res) => {
//   const q =
//     "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`,`date` FROM users u JOIN posts p ON u.id = p.uid WHERE p.id = ? ";

//   db.query(q, [req.params.id], (err, data) => {
//     if (err) return res.status(500).json(err);

//     return res.status(200).json(data[0]);
//   });
// };

export const getPost = (req, res) => {
  const q = `
    SELECT p.id, u.username, p.title, p.desc, p.img, u.img AS userImg, p.cat, p.date
    FROM users u
    JOIN posts p ON u.id = p.uid
    WHERE p.id = ?
  `;

  // Execute the database query with the constructed SQL query and post ID parameter
  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).json({ error: "Failed to fetch post." });
    }

    // Check if data contains at least one row (post)
    if (data && data.length > 0) {
      // Return the first post in the array as JSON response with a success status
      return res.status(200).json(data[0]);
    } else {
      // No post found with the specified ID
      return res.status(404).json({ message: "Post not found." });
    }
  });
};


// export const addPost = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   console.log(token);

//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const q =
//       "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`,`uid`) VALUES (?,?,?,?,?,?)";

//     const values = [
//       req.body.title,
//       req.body.desc,
//       req.body.img,
//       req.body.cat,
//       req.body.date,
//       userInfo.id,
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.json("Post has been created.");
//     });
//   });
// };
export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { title, desc, img, cat, date } = req.body;
    const uid = userInfo.id;

    const q = "INSERT INTO posts (`title`, `desc`, `img`, `cat`, `date`, `uid`) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [title, desc, img, cat, date, uid];

    db.query(q, values, (err, result) => {
      if (err) {
        console.error("Error inserting post:", err);
        return res.status(500).json("Error inserting post.");
      }
      
      console.log("Post has been created:", result);
      return res.status(201).json("Post has been created.");
    });
  });
};

// export const addPost = (req, res) => {
//   const { title, desc, img, cat,uid, date } = req.body; 
//   console.log("error2");

//   const q =
//     "INSERT INTO posts(`title`, `desc`, `img`, `cat`,`uid` ,`date`) VALUES (?, ?, ?, ?, ?, ?)";

//   const values = [title, desc, img, cat,uid, date];

//   db.query(q, values, (err, data) => {
//     if (err) {
//       console.error("Error inserting post:", err);
//       return res.status(500).json({ error: "Failed to create post." });
//     }
    
//     return res.json("Post has been created.");
//   });
// };


// export const deletePost = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const postId = req.params.id;
//     const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

//     db.query(q, [postId, userInfo.id], (err, data) => {
//       if (err) return res.status(403).json("You can delete only your post!");

//       return res.json("Post has been deleted!");
//     });
//   });
// };

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).json("Not authenticated!");
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }

    const postId = req.params.id
    //const postId = parseInt(req.params.id, 10);
    const userId = userInfo.id;
    console.log(postId) ;

    const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";
    const values = [postId, userId];

    db.query(q, values, (err, result) => {
      if (err) {
        console.error("Error deleting post:", err);
        return res.status(500).json("Failed to delete post.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json("Post not found or you are not authorized to delete.");
      }

      return res.json("Post has been deleted!");
    });
  });
};


export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q =
      "UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id` = ? AND `uid` = ?";

    const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated.");
    });
  });
};
