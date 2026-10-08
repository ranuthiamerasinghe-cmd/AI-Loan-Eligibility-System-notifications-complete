const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ quiet: true });
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const connectDB = require("./config/db");
const { ensureAdminUser } = require("./controllers/userController");

const userRoutes = require("./routes/userRoutes");
const loanRoutes = require("./routes/loanRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/notifications", notificationRoutes);


const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await ensureAdminUser();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

startServer();