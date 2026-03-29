import Chat from '../models/Chat.js';

const accessChat = async (req, res) => {
  const { userId, targetUserId, isAnonymous } = req.body;
  if (!targetUserId) return res.sendStatus(400);

  let isChat = await Chat.find({
    isGroupChat: false,
    isAnonymous: isAnonymous || false,
    $and: [
      { users: { $elemMatch: { userId: userId } } },
      { users: { $elemMatch: { userId: targetUserId } } },
    ],
  }).populate('latestMessage');

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      isAnonymous: isAnonymous || false,
      users: [
        { userId: userId, role: 'member' },
        { userId: targetUserId, role: 'member' }
      ],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id });
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

const fetchChats = async (req, res) => {
  try {
    const { userId } = req.query;
    Chat.find({ users: { $elemMatch: { userId: userId } } })
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then((results) => {
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createGroupChat = async (req, res) => {
  const { users, name, adminId } = req.body;
  if (!users || !name) return res.status(400).send({ message: 'Please fill all fields' });
  const parsedUsers = JSON.parse(users);
  if (parsedUsers.length < 2) return res.status(400).send('More than 2 users are required for a group chat');
  parsedUsers.push(adminId);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers.map(id => ({ userId: id, role: 'member' })),
      isGroupChat: true,
      groupAdmin: adminId,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id });
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const revealIdentityInChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    if (!chat.revealedUsers.includes(userId)) {
      chat.revealedUsers.push(userId);
    }

    // If both users revealed, we could turn off isAnonymous or handle it in UI
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { accessChat, fetchChats, createGroupChat, revealIdentityInChat };
