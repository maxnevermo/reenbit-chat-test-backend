import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;

  if (!text)
    return res.status(400).json({ message: "Текст повідомлення обов’язковий" });

  try {
    const newMessage = await Message.create({
      chatId,
      sender: req.user._id,
      text,
      status: "sent",
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        sender: req.user._id,
        text: newMessage.text,
        createdAt: newMessage.createdAt,
        status: newMessage.status,
      },
    });

    const populatedMessage = await newMessage.populate(
      "sender",
      "firstName lastName avatar"
    );

    res.status(201).json({
      message: "Повідомлення надіслано",
      messageData: populatedMessage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка надсилання повідомлення" });
  }
};

export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  if (!text)
    return res.status(400).json({ message: "Текст не може бути порожнім" });

  try {
    const message = await Message.findById(messageId);
    if (!message)
      return res.status(404).json({ message: "Повідомлення не знайдено" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Недостатньо прав" });
    }

    message.text = text;
    await message.save();

    const updatedMessage = await message.populate(
      "sender",
      "firstName lastName avatar"
    );

    res.status(200).json({ message: "Оновлено", messageData: updatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при оновленні повідомлення" });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName avatar");

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка отримання повідомлень" });
  }
};
