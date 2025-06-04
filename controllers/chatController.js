import Chat from "../models/Chat.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Чат не знайдено" });

    const botId = chat.members.find(
      (m) => m.toString() !== req.user._id.toString()
    );

    await Chat.findByIdAndDelete(id);
    await User.findByIdAndDelete(botId);

    res.status(200).json({ message: "Чат і бот-співрозмовник видалені" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Помилка видалення чату", error: err.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Чат не знайдено" });

    const botId = chat.members.find(
      (m) => m.toString() !== req.user._id.toString()
    );
    const updatedBot = await User.findByIdAndUpdate(
      botId,
      {
        firstName,
        lastName,
      },
      { new: true }
    );

    const updatedChat = await Chat.findById(id).populate(
      "members",
      "-password"
    );

    res.status(200).json({ message: "Чат оновлено", chat: updatedChat });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Помилка оновлення чату", error: err.message });
  }
};

const getRandomInt = (max) => Math.floor(Math.random() * (max + 1));

export const createChat = async (req, res) => {
  const { firstName, lastName } = req.body;
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({ message: "Не авторизований" });
  }

  try {
    const randNum = getRandomInt(1000);
    const randSuffix = getRandomInt(100);

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randNum}@virtual.com`;
    const password = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randSuffix}`;
    const avatar = `https://i.pravatar.cc/150?u=${randNum}`;

    let botUser = await User.findOne({ email });

    if (!botUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      botUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
        provider: "standard",
      });
    }

    const chat = await Chat.create({
      members: [currentUser._id, botUser._id],
      lastMessage: {},
    });

    const populatedChat = await Chat.findById(chat._id).populate(
      "members",
      "-password"
    );

    res
      .status(201)
      .json({ message: "Чат з ботом створено", chat: populatedChat });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Помилка при створенні чату", error: err.message });
  }
};

export const getUserChats = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Не авторизований" });

  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate("members", "firstName lastName avatar")
      .populate("lastMessage.sender", "firstName lastName avatar");

    res.status(200).json(chats);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Помилка при завантаженні чатів", error: err.message });
  }
};
