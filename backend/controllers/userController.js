
import { Users } from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function generateToken(id) {
  return jwt.sign({ UserId: id }, process.env.JWT)
}

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const emailExists = await Users.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const nameExists = await Users.findOne({ where: { name } });
    if (nameExists) {
      return res.status(400).json({ message: "Name already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isPremium: false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const id = user.id;

    const token = generateToken(id);
    res.status(200).json({
      message: "User login successful",
      UserId: id,
      token: token, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during login", error: error.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });
    if (user && user.isPremium) {
      const users = await Users.findAll();
      res.status(200).json(users);
    }else{
      res.status(200).json({});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

