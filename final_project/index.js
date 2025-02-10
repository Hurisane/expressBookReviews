const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticated } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authenticated) {
        let token = req.session.authenticated['accessToken']; 

        if (!token) {
            return res.status(403).json({ message: "Token is missing!" });
        }

        jwt.verify(token, "access", (err, user) => {
            if (err) {
                return res.status(403).json({ message: "User not authenticated!" });
            }

            req.session.user = user;
            next(); 
        });

    } else {
        return res.status(403).json({ message: "User not authenticated!" });
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
