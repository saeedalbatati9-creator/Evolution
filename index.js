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
// 2. معرّفات (IDs) الرومات
// ----------------------------------------------------

// إعدادات رومات الأولاد
const BOYS_SOURCE_ID = '1563276569173033022';
const BOYS_TARGET_ID = '1563007615212986398';

// إعدادات رومات البنات
const GIRLS_SOURCE_ID = '1563276569173033022';
const GIRLS_TARGET_ID = '1563007665930506250';

// إعدادات رومات الأنمي
const ANIME_SOURCE_ID = '1563276569173033022';
const ANIME_TARGET_ID = '1563007685476094203';

// ----------------------------------------------------
// 3. دالة بناء وتنسيق رسالة الصورة
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
      .setLabel('<:ovia:1563005960535146636>'),
    new ButtonBuilder()
      .setCustomId('delete_avatar_msg')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('<:emoji_1792345299337:1563012182629818408>')
  );

  return { embeds: [embed], components: [row] };
}

// ----------------------------------------------------
// 4. حدث الجاهزية والتشغيل
// ----------------------------------------------------
client.once('ready', async () => {
  console.log(`🟢 تم تشغيل Ovia Profile بنجاح: ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'Dev My | Never', type: ActivityType.Playing }],
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

  if (!targetChannelId) return;

  let imageUrl = null;

  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    if (attachment.contentType && attachment.contentType.startsWith('image/')) {
      imageUrl = attachment.url;
    }
  } else if (message.content.startsWith('http://') || message.content.startsWith('https://')) {
    imageUrl = message.content;
  }

  if (!imageUrl) return;

  try {
    // جلب الروم الهدف أولاً والتأكد من وجوده
    const targetChannel = await client.channels.fetch(targetChannelId).catch(() => null);

    if (targetChannel) {
      await targetChannel.send(buildAvatarMessage(imageUrl, categoryTitle));
      await message.delete().catch(() => {});
    } else {
      console.error(`❌ لم يتم العثور على الروم الهدف: ${targetChannelId}`);
    }
  } catch (error) {
    console.error('❌ حدث خطأ أثناء نقل الصورة:', error);
  }
});

// ----------------------------------------------------
// 6. التفاعل مع زر حذف الصورة (للإدارة)
// ----------------------------------------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'delete_avatar_msg') {
    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: '❌ ليس لديك صلاحية حذف الصورة.', ephemeral: true });
    }
    await interaction.message.delete().catch(() => {});
  }
});

client.login(process.env.TOKEN);
