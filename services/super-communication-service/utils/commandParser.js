export const parseMessage = (content) => {
  const commands = [];
  const mentions = [];
  const hashtags = [];

  // 1. Detect Slash Commands: /command <args>
  if (content.startsWith('/')) {
    const parts = content.split(' ');
    const cmd = parts[0].substring(1);
    const args = parts.slice(1);
    commands.push({ cmd, args });
  }

  // 2. Detect Mentions: @username
  const mentionRegex = /@(\w+)/g;
  let mentionMatch;
  while ((mentionMatch = mentionRegex.exec(content)) !== null) {
    mentions.push(mentionMatch[1]);
  }

  // 3. Detect Hashtags: #topic
  const hashtagRegex = /#(\w+)/g;
  let hashtagMatch;
  while ((hashtagMatch = hashtagRegex.exec(content)) !== null) {
    hashtags.push(hashtagMatch[1]);
  }

  return { commands, mentions, hashtags };
};
