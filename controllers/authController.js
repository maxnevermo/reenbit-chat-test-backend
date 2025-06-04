import bcrypt from "bcryptjs";
import User from "../models/User.js";

const getRandomInt = (max) => Math.floor(Math.random() * (max + 1));

export const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Користувач уже існує" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const randNum = getRandomInt(1000);

    const avatar = `https://i.pravatar.cc/150?u=${randNum}`;

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      avatar,
      password: hashedPassword,
      provider: "standard",
    });

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: "Помилка авторизації" });
      return res
        .status(201)
        .json({ message: "Успішна реєстрація", user: newUser });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Щось пішло не так", error: err.message });
  }
};

export const loginSuccess = (req, res) => {
  res.status(200).json({ message: "Успішний логін", user: req.user });
};

export const getCurrentUser = (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Не авторизований" });
  res.status(200).json({ user: req.user });
};
