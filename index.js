const express = require("express");
var app = express();
var session = require("express-session");

app.use(
    session({ resave: true, saveUninitialized: true, secret: "XCR3rsasa%RDHHH" })
);
const cors = require("cors");
const db = require("./app/models");
const cookieParser = require("cookie-parser");
require("dotenv").config("./.env");
const PORT = process.env.PORT;
const bearerToken = require("express-bearer-token");
const http = require('http'); // Import http to create a server
const { Server } = require("socket.io"); // Import socket.io
const commonUtil = require("./app/util/common");

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

// CDN CSS
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.6.2/swagger-ui.min.css";

const swaggerUiOptions = {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
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

app.use(express.static("public"));

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


// Serve the app and create an HTTP server
const server = http.createServer(app);

// Initialize socket.io with the server instance
const io = new Server(server, {
    cors: {
        origin: "*",  // Configure CORS for Socket.IO
        methods: ["GET", "POST"],
    },
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A user connected');
    // Join the user to a specific room based on their user_id or astro_id
    socket.on('joinRoom', async (reciever_id) => {
        const accessToken = socket.handshake.query.token;
        const tokens = await commonUtil.getUserIdFromLoginToken(accessToken);
        const sender_id = tokens[0]?.user_id;

        const finalRoomId = `chat_${sender_id}_${reciever_id}`;

        socket.join(finalRoomId);  // Join the user to their specific room
        console.log(`User joined room: ${finalRoomId}`);
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

});

global.io = io;

// Start listening for HTTP and WebSocket connections
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
