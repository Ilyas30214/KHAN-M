const { cmd } = require('../command');

cmd({
  pattern: "hidetag",
  react: "🔊",
  desc: "To Tag all Members for Any Message/Media",
  category: "group",
  use: '.hidetag Hello',
  filename: __filename
},
async (conn, mek, m, {
  from, q, isGroup, isCreator, isAdmins,
  participants, reply
}) => {
  try {
    const isUrl = (url) => {
      return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
    };

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isCreator) return reply("❌ Only group admins can use this command.");

    const mentionAll = { mentions: participants.map(u => u.id) };
    let content;

    if (m.quoted) {
      const type = m.quoted.mtype || '';
      const buffer = await m.quoted.download?.();

      if (!buffer) return reply("❌ Failed to download the quoted media.");

      switch (type) {
        case "imageMessage":
          content = { image: buffer, caption: m.quoted.text || "📷 Image", ...mentionAll };
          break;
        case "videoMessage":
          content = { video: buffer, caption: m.quoted.text || "🎥 Video", gifPlayback: m.quoted.message.videoMessage.gifPlayback || false, ...mentionAll };
          break;
        case "audioMessage":
          content = { audio: buffer, mimetype: "audio/mp4", ptt: m.quoted.ptt || false, ...mentionAll };
          break;
        case "stickerMessage":
          content = { sticker: buffer, ...mentionAll };
          break;
        case "documentMessage":
          content = {
            document: buffer,
            mimetype: m.quoted.message.documentMessage.mimetype || "application/octet-stream",
            fileName: m.quoted.message.documentMessage.fileName || "file",
            caption: m.quoted.text || "",
            ...mentionAll
          };
          break;
        default:
          content = { text: m.quoted.text || "📨 Message", ...mentionAll };
      }

      return await conn.sendMessage(from, content, { quoted: mek });
    }

    if (!q) return reply("*Please provide a message or reply to one.*");

    if (isUrl(q)) {
      return await conn.sendMessage(from, {
        text: q,
        ...mentionAll
      }, { quoted: mek });
    }

    await conn.sendMessage(from, {
      text: q,
      ...mentionAll
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred !!*\n\n${e}`);
  }
});
