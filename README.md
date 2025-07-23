# iNoteBook-Server
Update: check out the live app [here](https://i-note-book-two.vercel.app) 🚀
---

### 🧰 Tech Stack
- [![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)](#)
- [![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](#)
- [![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?logo=mongodb&logoColor=white)](#)
- [![🛡️ JWT](https://img.shields.io/badge/🛡️-JWT-purple?style=flat&labelColor=purple)](#)
- [![🔐 Bcrypt.js](https://img.shields.io/badge/🔐-Bcrypt.js-yellow?style=flat&labelColor=yellow)](#)
---

### 🗺️ Backend architecture overview
 - This is a Express-based server for iNoteBook web application and handles API requests for authentication, authorization, and notes management.
 - The project follows modular file structure, with Mongoose Schemas and Route handlers spereated w.r.t their rolers for better maintainability and scalability.
 - Auth endpoint includes route handlers for Signup, Login, GetUser, Refreshing sessions, Logout and RememberMe. Notes module includes routes handlers for Create, Read, Update and Delete operations (CRUD).
 -  Many security practices have been incoorporated in order to sanitize user input, validate input while masking any extra info from brute-force attackers, provide necessaary alert and error messeges, and authorize user with robust JSON web token system coupled with http-only cookies.
 - The server communicates with database (MongoDB Atlas) using Mongoose, a powerful Object Data Modelling (ODM) library.
 - Other notable features include Cross origin resource sharing (CORS) management, data encapsulation and abstraction by environment variables using dotenv, use of custom middlewares, and adhearance to DRY (Don't Repeat Yourself) principles.
---

### 🔐 Authentication & Security
- __Authentication__: Users are required to Signup/Login into the applicaiton unless they opted for "Remember me" in previous session. Login/Signup credentials are saniitized and validated using Express validator chaining. For correct credentials, users are assigned authorization tokens, otherwise responses with appropriate error messeges are returned.
- __Authorization__: JSON web tokens(JWTs) have been used for authorizing user access. On successful Signup/Login, an access token is issued. It contains encoded user data and is cryptographically signed using a secret key. On routes that require authorization, the access token is sent with data request to server. On user verification and confirmation of no token tampering, corresponding user data is sent back to client.
- __Refresh token__: A stolen access token can be used by attacker to login or access data on behalf of the user. To tackle this, short life access tokens are used, hence reducing the damange window time. This demands renewal of access token automatically and seamlessly instead of asking the user to Login again. Here, refresh tokens come into play.<br>
  Structurally it is similiar to an access token, but have longer validity period and is stored securely in HTTP-only cookie(inaccessible to JavaScript). If server responds with "Expired access token", client makes a refresh request, which essentially is asking server to renew the access token after verifiying the refresh token.
- __Password Hashing and salting__: Passwords are secured using one-way hashing functions. To further strengthen this, each passowrd is salted using a random string unique per user. This coupled with 10 rounds of salting makes brute force attacks and Rainbow table attacks too expensive. Bcrypt.js provides slow hashing algorithm that increases time required for hash computation.
- __Timing attack protection__: Time intervel between sending a request to from client and receiving a response from server, especially during authenticatiion, is kept consistent irrespective of the length and correctness input string. This prevents attackers from guessing the correctness of current input character by response time variations.
---

### 🧪 API Design & Routing

---

### 📦 CRUD operations and Data Management
- For Create and Update Note operations, user input is sanitized and validated using Express-validator chaining. For Update and Delete operations, user data by access token is verified and matched with that of the owner of the Note to avoid unauthorized notes manipulation.
- As server wakes up, a connection is established with MongoDB database. In order to maintain data systematic and consistent, Object data modelling (ODM) technique is employed using Mongoose, which lets you define schemas - blue-prints for creating documents.
-  User info, Note content and authorization tokens are seggregated into different collections in database for easier maintainence. Notes are paired with their respective user using 'ref' property in Note Schema definition. This property provides referencing between documents like foreign keys in SQL, in a noSQL environment.
-  Each collection has indexing of _id fields, which enhances data retrieval speed.
-  Data to be inserted in database is pre-checked using Express validators and custom sanitizers.
---

### 🌍 Deployment
- Frontend: [Vercel](https://i-note-book-two.vercel.app)
- Backend: [Render](https://inotebook-server-8i8l.onrender.com)
---

### 📎 Related Repositories
- Frontend: [iNoteBook Frontend](https://github.com/Priyanshu1-62/iNoteBook.git)
---


