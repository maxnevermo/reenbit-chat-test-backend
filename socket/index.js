import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", async ({ chatId, text, sender }) => {
      if (!text?.trim()) return;

      try {
        const newMessage = await Message.create({
          chatId,
          sender,
          text,
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: {
            sender,
            text,
            createdAt: newMessage.createdAt,
            status: "sent",
          },
        });

        const populated = await newMessage.populate(
          "sender",
          "firstName lastName avatar"
        );

        io.to(chatId).emit("receiveMessage", populated);

        setTimeout(async () => {
          try {
            const quoteRes = await fetch("https://dummyjson.com/quotes/random");
            const quote = await quoteRes.json();

            const bot = await Chat.findById(chatId).then((c) =>
              c.members.find((m) => m.toString() !== sender)
            );

            const botMessage = await Message.create({
              chatId,
              sender: bot,
              text: quote.quote,
            });

            await Chat.findByIdAndUpdate(chatId, {
              lastMessage: {
                sender: bot,
                text: quote.quote,
                createdAt: botMessage.createdAt,
                status: "sent",
              },
            });

            const populatedBot = await botMessage.populate(
              "sender",
              "firstName lastName avatar"
            );

            io.to(chatId).emit("receiveMessage", populatedBot);
          } catch (err) {
            console.error("❌ Bot response error:", err.message);
          }
        }, 3000);
      } catch (err) {
        console.error("❌ Socket sendMessage error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🚪 Socket disconnected:", socket.id);
    });
  });
}
