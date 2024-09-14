const express = require("express");
var app = express();
var session = require("express-session");

app.use(
    session({ resave: true, saveUninitialized: true, secret: "XCR3rsasa%RDHHH" })
);
const cors = require("cors");
const path = require("path");
const db = require("./app/models");
const cookieParser = require("cookie-parser");
require("dotenv").config("./.env");
const PORT = process.env.PORT;
const bearerToken = require("express-bearer-token");
app.use(cookieParser());

db.sequelize.sync({ force: false, alter: true }).then(() => {
    console.log("re-sync db.");
});

var corsOptions = {
    // origin: "http://localhost:8081",
};
app.use(cors(corsOptions));

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerOptions = require("./swagger/swaggerOptions.json");
const swaggerDocs = swaggerJsDoc(swaggerOptions);
const swaggerUiOptions = {
    swaggerOptions: {
        basicAuth: {
            name: "Authorization",
            schema: {
                type: "basic",
                in: "header",
            },
            value: "Basic <user:password>",
        },
    },
};
app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerDocs, swaggerUiOptions)
);

// parse requests of content-type - application/json
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

app.use(
    bearerToken({
        headerKey: "Basic",
    })
);

require("./app/routes/api.routes")(app);

app.get('/', function (req, res) {
    res.send('App Working Fine');
})

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
