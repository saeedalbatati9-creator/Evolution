const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ----------------------------------------------------
// 1. سيرفر Express لإبقاء البوت متصلاً 24/7 على Render
// ----------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Ovia Profile Bot is Online 24/7!'));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// ----------------------------------------------------
// 2. معرّفات (IDs) الرومات والإيموجيات
// ----------------------------------------------------

// إعدادات رومات الأولاد
const BOYS_SOURCE_ID = '1563004979000639523';
const BOYS_TARGET_ID = '1563007615212986398';

// إعدادات رومات البنات
const GIRLS_SOURCE_ID = '1563004979000639523';
const GIRLS_TARGET_ID = '1563007665930506250';

// إعدادات رومات الأنمي
const ANIME_SOURCE_ID = '1563004979000639523';
const ANIME_TARGET_ID = '1563007685476094203';

// IDs الإيموجيات الخاصة بك للأزرار
const DOWNLOAD_EMOJI_ID = '<:ovia:1563005960535146636>'; 
const DELETE_EMOJI_ID   = '<:emoji_1792345299337:1563012182629818408>'; 

// ----------------------------------------------------
// 3. دالة بناء وتنسيق رسالة الصورة بالأزرار والإيموجيات
// ----------------------------------------------------
function buildAvatarMessage(imageUrl, titleText) {
  const embed = new EmbedBuilder()
    .setTitle(`✨ ${titleText}`)
    .setImage(imageUrl)
    .setColor('#2b2d31')
    .setFooter({ text: 'Ovia Profile • Avatars' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(imageUrl)
      .setEmoji(DOWNLOAD_EMOJI_ID), // إيموجي التحميل
    new ButtonBuilder()
      .setCustomId('delete_avatar_msg')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(DELETE_EMOJI_ID) // إيموجي الحذف
  );

  return { embeds: [embed], components: [row] };
}

// ----------------------------------------------------
// 4. حدث الجاهزية والتشغيل
// ----------------------------------------------------
client.once('ready', async () => {
  console.log(`🟢 تم تشغيل Ovia Profile بنجاح: ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'Ovia Profile | Avatars', type: ActivityType.Playing }],
    status: 'online'
  });
});

// ----------------------------------------------------
// 5. الاستماع للصور في رومات المصدر ونقلها فوراً
// ----------------------------------------------------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let targetChannelId = null;
  let categoryTitle = '';

  // تحديد نوع الصور والمستهدف بناءً على الروم الذي أرسلت فيه
  if (message.channel.id === BOYS_SOURCE_ID) {
    targetChannelId = BOYS_TARGET_ID;
    categoryTitle = 'أفتار اولاد جديد';
  } else if (message.channel.id === GIRLS_SOURCE_ID) {
    targetChannelId = GIRLS_TARGET_ID;
    categoryTitle = 'أفتار بنات جديد';
  } else if (message.channel.id === ANIME_SOURCE_ID) {
    targetChannelId = ANIME_TARGET_ID;
    categoryTitle = 'أفتار أنمي جديد';
  }

  // إذا لم تكن الرسالة في أحد رومات المصدر المحددة، يتجاهلها البوت
  if (!targetChannelId) return;
