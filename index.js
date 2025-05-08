const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { google } = require('googleapis');
const fs = require('fs');
const express = require('express');
const QRCode = require('qrcode');
require('dotenv').config();

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Health check endpoint
app.get('/', (req, res) => {
  res.send('WhatsApp bot is running!');
});

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Load env vars
const SHEET_ID = process.env.SHEET_ID;
const GROUP_NAME = process.env.GROUP_NAME;

// === Google Sheets Setup ===
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// === WhatsApp Setup ===
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    ignoreHTTPSErrors: true,
    timeout: 60000
  },
});

let latestQR = null; // Store the latest QR code string

// Add /qr endpoint to serve QR code as PNG
app.get('/qr', async (req, res) => {
  if (!latestQR) {
    return res.status(404).send('No QR code available.');
  }
  try {
    res.setHeader('Content-Type', 'image/png');
    await QRCode.toFileStream(res, latestQR, { type: 'png', width: 300 });
  } catch (err) {
    res.status(500).send('Failed to generate QR code image.');
  }
});

client.on('qr', (qr) => {
  latestQR = qr; // Store the latest QR string
  console.log('Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot is ready!');
});

// Function to infer category from description
function inferCategory(description) {
  const categories = {
    Groceries: ['groceries', 'food', 'supermarket', 'market', 'store', 'shop', 'household', 'cleaning'],
    Dining: ['dinner', 'lunch', 'breakfast', 'restaurant', 'cafe', 'food', 'eat', 'meal', 'fast food', 'delivery'],
    Attractions: ['attraction', 'museum', 'theme park', 'tourist', 'entertainment', 'park', 'waterfall', 'boat', 'tour', 'sightseeing', 'ticket', 'entrance'],
    Transportation: ['taxi', 'uber', 'bolt', 'grab', 'bus', 'train', 'transport', 'gas', 'fuel', 'car rental', 'scooter rental', 'rental', 'metro', 'subway'],
    Education: ['course', 'book', 'learning', 'education', 'study', 'class', 'school', 'university', 'college', 'training'],
    Fitness: ['gym', 'fitness', 'sport', 'exercise', 'workout', 'training', 'yoga', 'pilates', 'swimming', 'running'],
    Massage: ['massage', 'spa', 'wellness', 'therapy', 'relaxation'],
    Shakes: ['shake', 'smoothie', 'juice', 'fruit', 'drink', 'beverage', 'fresh', 'blend'],
    Orders: ['order', 'lazada', 'decathlon', 'amazon', 'online', 'shopping', 'delivery', 'purchase', 'buy']
  };

  const lowerDesc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  return 'Other'; // Default category
}

// Function to get friendly sender name
function getFriendlySenderName(number) {
  const senderMap = {
    '972526773723': 'Sagie',
    '972544806500': 'Tany'
  };
  return senderMap[number] || number;
}

client.on('message_create', async (msg) => {
  try {
    console.log('📨 Received message:', {
      from: msg.from,
      body: msg.body,
      isGroup: msg.isGroup,
      fromMe: msg.fromMe
    });

    const chat = await msg.getChat();
    console.log('💬 Chat details:', {
      name: chat.name,
      isGroup: chat.isGroup,
      expectedGroup: GROUP_NAME,
      matches: chat.name === GROUP_NAME
    });

    // Only respond in the specified group
    if (!chat.isGroup) {
      console.log('❌ Not a group chat, ignoring');
      return;
    }
    
    if (chat.name !== GROUP_NAME) {
      console.log('❌ Not the target group, ignoring');
      return;
    }

    const text = msg.body.trim();
    console.log('📝 Processing message:', text);

    // Match both formats with multi-word descriptions:
    // "900 hamburgers at restaurant" or "hamburgers at restaurant 900"
    const match = text.match(/^(?:(\d+(?:\.\d{1,2})?)\s+(.+)|(.+?)\s+(\d+(?:\.\d{1,2})?))$/);
    if (!match) {
      console.log('❌ Message format does not match expected pattern');
      msg.reply('Please use the format: Description Amount (e.g., Dinner 120)');
      return;
    }

    // Extract amount and item based on which pattern matched
    let amount, item;
    if (match[1]) { // Amount first format: "900 hamburgers at restaurant"
      amount = match[1];
      item = match[2].trim(); // Trim any extra spaces
    } else { // Amount last format: "hamburgers at restaurant 900"
      amount = match[4];
      item = match[3].trim(); // Trim any extra spaces
    }

    // Capitalize first letter of each word in description
    item = item.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Infer category
    const category = inferCategory(item);
    console.log('📊 Parsed message:', { amount, item, category });

    // Format timestamp to be more readable
    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Get current month in YYYY-MM format
    const month = now.toISOString().slice(0, 7); // e.g., "2024-05"
    const monthName = now.toLocaleString('default', { month: 'long' }); // e.g., "May"

    // Get sender's name
    const contact = await msg.getContact();
    const sender = getFriendlySenderName(contact.number);

    // Ensure month sheet exists
    await ensureMonthSheetExists(month, monthName);

    // Calculate running sum for the current month
    const runningSum = await calculateRunningSum(month);

    // Write to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${monthName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, sender, item, parseFloat(amount), category, runningSum + parseFloat(amount)]],
      },
    });

    console.log(`💾 Successfully saved to sheet: ${sender} - ${item} - $${amount} - ${category} - Running Sum: $${runningSum + parseFloat(amount)}`);
  } catch (err) {
    console.error('❌ Error processing message:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack
    });
  }
});

// Function to ensure month sheet exists
async function ensureMonthSheetExists(month, monthName) {
  try {
    // Try to get the sheet
    await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      ranges: [monthName],
    });
  } catch (err) {
    // If sheet doesn't exist, create it
    if (err.code === 400) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: monthName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 6
                }
              }
            }
          }]
        }
      });

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${monthName}!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Timestamp', 'Sender', 'Description', 'Amount', 'Category', 'Running Sum']]
        }
      });
    }
  }
}

// Function to calculate running sum for the current month
async function calculateRunningSum(month) {
  const monthName = new Date(month + '-01').toLocaleString('default', { month: 'long' });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${monthName}!A:F`,
    });

    const rows = response.data.values || [];
    let sum = 0;

    // Skip header row and sum all amounts
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[3]) { // Amount is in column D (index 3)
        sum += parseFloat(row[3]) || 0;
      }
    }

    return sum;
  } catch (err) {
    console.error('Error calculating running sum:', err);
    return 0;
  }
}

client.initialize();