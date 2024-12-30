import express, { json } from 'express';
import cors from 'cors';
const app = express();
import dotenv from "dotenv";
import { sequelize } from './config/database.js';
import helmet from 'helmet';
import compression from 'compression';
// import fs from "fs";
// import { fileURLToPath } from 'url';

//Routes
import loginRouter from './routes/userLogin.js';
import sendChatRouter from './routes/chats.js';
import grpChatRouter from './routes/groupchat.js';
//Models
import { Users } from './models/User.js';
import { forgotPasswordRequests } from './models/forgotPasswordRequests.js';
import { Chat } from './models/ChatModel.js';
import { Groups } from './models/GroupChatModel.js';
import { GroupMembers } from './models/GroupMembersModel.js';
import { Messages } from './models/MessageModel.js';

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
dotenv.config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const logsData = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: 'a' });

app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(json());

//Routes
app.use('/api',grpChatRouter);
app.use('/api', sendChatRouter);
app.use("/api", loginRouter);
app.get("/", (req, res) => {
  res.json("Welcome to Expense Tracker!!!!");
});



//server
const start = async () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(process.env.PORT + " : connected");
    });
  } catch (error) {
    console.log(error);
  }
};


//Associations
Users.hasMany(Chat, { foreignKey: "UserId" });
Chat.belongsTo(Users, { foreignKey: "UserId" });

Users.hasMany(forgotPasswordRequests, { foreignKey: "UserId" });
forgotPasswordRequests.belongsTo(Users, { foreignKey: "UserId" });
// Users and Groups
Users.hasMany(Groups, { foreignKey: "adminId" });
Groups.belongsTo(Users, { foreignKey: "adminId" });

// Groups and GroupMembers
Groups.hasMany(GroupMembers, { foreignKey: "groupId" });
GroupMembers.belongsTo(Groups, { foreignKey: "groupId" });

// Users and GroupMembers
Users.hasMany(GroupMembers, { foreignKey: "userId" });
GroupMembers.belongsTo(Users, { foreignKey: "userId" });

// Groups and Messages
Groups.hasMany(Messages, { foreignKey: "groupId" });
Messages.belongsTo(Groups, { foreignKey: "groupId" });

// Users and Messages
Users.hasMany(Messages, { foreignKey: "senderId" });
Messages.belongsTo(Users, { foreignKey: "senderId" });


sequelize
  .sync({ alter: true }) // use { force: true } only in development; it drops and recreates tables
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.error("Error creating database:", error);
  });

start();