const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();

const CHANNEL_SECRET = process.env.CHANNEL_SECRET || '9a598307363004be5162b7afe5dc8f6d';
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN || '';
const LIFF_URL = 'https://liff.line.me/2009365473-b3H1gkuk';
const BOOKING_URL = 'https://bbglow-pos.github.io/9566/index.html';

app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

// Verify LINE signature
function verifySignature(req) {
  const signature = req.headers['x-line-signature'];
  const hash = crypto.createHmac('sha256', CHANNEL_SECRET)
    .update(req.rawBody).digest('base64');
  return hash === signature;
}

// ส่งข้อความหาลูกค้า
async function replyMessage(replyToken, messages) {
  await axios.post('https://api.line.me/v2/bot/message/reply', {
    replyToken,
    messages
  }, {
    headers: { 'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}` }
  });
}

// Push message หาลูกค้า (ใช้ตอนบันทึกบิล)
async function pushMessage(userId, messages) {
  await axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages
  }, {
    headers: { 'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}` }
  });
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send('Unauthorized');
  }
  res.sendStatus(200);

  const events = req.body.events || [];
  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;
    const text = event.message.text.trim().toLowerCase();
    const replyToken = event.replyToken;

    // สวัสดี / ทักทาย
    if (text.includes('สวัสดี') || text.includes('hello') || text.includes('หวัดดี')) {
      await replyMessage(replyToken, [{
        type: 'flex',
        altText: 'สวัสดีจาก BB GLOW หัวหิน',
        contents: {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: '✦ BB GLOW ✦',
              size: 'xl',
              weight: 'bold',
              color: '#6A1A30',
              align: 'center'
            }, {
              type: 'text',
              text: 'ครบวงจร หัวหิน',
              size: 'sm',
              color: '#C9A96E',
              align: 'center'
            }],
            paddingAll: '20px',
            backgroundColor: '#FFF8F0'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: 'สวัสดีค่ะ 😊 มีอะไรให้ช่วยได้บ้างคะ?',
              wrap: true,
              color: '#333333'
            }]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [{
              type: 'button',
              action: { type: 'uri', label: '💜 เช็คเครดิต', uri: LIFF_URL },
              style: 'primary',
              color: '#6A1A30'
            }, {
              type: 'button',
              action: { type: 'uri', label: '📅 จองคิว', uri: BOOKING_URL },
              style: 'secondary'
            }]
          }
        }
      }]);
    }

    // เครดิต
    else if (text.includes('เครดิต') || text.includes('credit') || text.includes('แต้ม')) {
      await replyMessage(replyToken, [{
        type: 'flex',
        altText: 'เช็คเครดิต BB GLOW',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: '💜 เช็คเครดิตสมาชิก',
              weight: 'bold',
              size: 'lg',
              color: '#6A1A30'
            }, {
              type: 'text',
              text: 'กดปุ่มด้านล่างเพื่อดูเครดิตคงเหลือได้เลยค่ะ 😊',
              wrap: true,
              margin: 'md',
              color: '#555555'
            }]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'button',
              action: { type: 'uri', label: '💜 ดูเครดิตของฉัน', uri: LIFF_URL },
              style: 'primary',
              color: '#6A1A30'
            }]
          }
        }
      }]);
    }

    // จองคิว
    else if (text.includes('จอง') || text.includes('นัด') || text.includes('คิว')) {
      await replyMessage(replyToken, [{
        type: 'flex',
        altText: 'จองคิว BB GLOW',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: '📅 จองคิว BB GLOW',
              weight: 'bold',
              size: 'lg',
              color: '#6A1A30'
            }, {
              type: 'text',
              text: 'ติดต่อจองคิวได้เลยค่ะ หรือโทร/LINE มาหาเราได้เลยนะคะ 😊',
              wrap: true,
              margin: 'md',
              color: '#555555'
            }]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'button',
              action: { type: 'uri', label: '📅 จองคิวออนไลน์', uri: BOOKING_URL },
              style: 'primary',
              color: '#6A1A30'
            }]
          }
        }
      }]);
    }

    // ขอบคุณ
    else if (text.includes('ขอบคุณ') || text.includes('thanks') || text.includes('ขอบใจ')) {
      await replyMessage(replyToken, [{
        type: 'text',
        text: 'ขอบคุณที่ใช้บริการ BB GLOW หัวหินนะคะ 😊✨ แวะมาใหม่ได้เลยค่ะ!'
      }]);
    }
  }
});

// Endpoint สำหรับ POS แจ้งเตือนเมื่อบันทึกบิล
app.post('/notify', async (req, res) => {
  const { userId, name, service, total, credit } = req.body;
  if (!userId || !CHANNEL_ACCESS_TOKEN) return res.sendStatus(400);
  try {
    await pushMessage(userId, [{
      type: 'flex',
      altText: `BB GLOW — บันทึกบิลเรียบร้อยค่ะ`,
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [{
            type: 'text',
            text: '✦ BB GLOW หัวหิน ✦',
            weight: 'bold',
            color: '#6A1A30',
            align: 'center'
          }, {
            type: 'text',
            text: `ขอบคุณ ${name} นะคะ 😊`,
            margin: 'md',
            wrap: true
          }, {
            type: 'separator',
            margin: 'md'
          }, {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
              { type: 'text', text: `💆 ${service}`, wrap: true, color: '#555555' },
              { type: 'text', text: `💰 ยอดชำระ: ${total.toLocaleString()} ฿`, margin: 'sm', color: '#333333', weight: 'bold' },
              { type: 'text', text: `💜 เครดิตคงเหลือ: ${credit.toLocaleString()} ฿`, margin: 'sm', color: '#6A1A30' }
            ]
          }]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [{
            type: 'button',
            action: { type: 'uri', label: '💜 ดูเครดิตของฉัน', uri: LIFF_URL },
            style: 'primary',
            color: '#6A1A30'
          }]
        }
      }
    }]);
    res.sendStatus(200);
  } catch(e) {
    console.error(e.message);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => res.send('BB GLOW Webhook Server 🌸'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
