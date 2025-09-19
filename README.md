# WhatsApp Expense Bot

A WhatsApp bot that automatically tracks expenses in a group chat and logs them to Google Sheets. Perfect for roommates, couples, or groups who want to track shared expenses automatically.

## ✨ Features

- **Automatic Detection**: Monitors WhatsApp group messages for expense entries
- **Smart Parsing**: Accepts multiple message formats (`Description Amount` or `Amount Description`)
- **Auto-Categorization**: Automatically categorizes expenses into 9 predefined categories
- **Google Sheets Integration**: Logs all expenses with timestamps, running totals, and monthly organization
- **Multi-user Support**: Maps phone numbers to friendly names
- **Real-time Feedback**: Sends reactions and error messages for immediate feedback

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **Google Account** with Google Sheets access
- **WhatsApp** account (for the bot to connect to)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd whatsapp-expense-bot

# Install dependencies
npm install
```

### Step 2: Google Sheets Setup

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

2. **Create a Google Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable the Google Sheets API
   - Create credentials → Service Account
   - Download the JSON key file
   - Share your Google Sheet with the service account email (found in the JSON file)

### Step 3: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Google Sheets Configuration
SHEET_ID=your_google_sheet_id_here
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# WhatsApp Configuration  
GROUP_NAME=your_whatsapp_group_name_here

# Sender Name Mapping (optional)
SENDER_MAPPING={"972526773723":"Sagie","972544806500":"Tany"}
```

**How to get these values:**
- **SHEET_ID**: From your Google Sheet URL
- **GOOGLE_APPLICATION_CREDENTIALS_JSON**: Copy the entire contents of your downloaded service account JSON file
- **GROUP_NAME**: The exact name of your WhatsApp group
- **SENDER_MAPPING**: JSON object mapping phone numbers to friendly names (optional)

### Step 4: Run the Bot

```bash
# Start the bot
node index.js
```

The bot will:
1. Display a QR code in the terminal
2. Visit `http://localhost:3001/qr` to scan the QR code with WhatsApp
3. Connect to WhatsApp Web
4. Start monitoring your group chat

### Step 5: Test the Bot

Send a message in your WhatsApp group in one of these formats:
- `Groceries 50`
- `50 Groceries`

The bot should respond with a thumbs up reaction if successful!

## 📱 How to Use

### Message Formats

Send expense messages in your WhatsApp group using either format:

**Format 1: Description Amount**
```
Groceries 50
Dinner at restaurant 75.50
Taxi ride 15
```

**Format 2: Amount Description**
```
50 Groceries
75.50 Dinner at restaurant
15 Taxi ride
```

### Multi-line Messages

You can send multiple expenses in one message:
```
Groceries 50
Dinner 25
Taxi 10
```

### Bot Responses

- ✅ **Success**: Thumbs up reaction (👍)
- ❌ **Error**: Reply with error message for invalid format

## 🏷️ Auto-Categorization

The bot automatically categorizes expenses based on keywords:

| Category | Keywords |
|----------|----------|
| **Groceries** | groceries, food, supermarket, market, store, shop, household, cleaning |
| **Dining** | dinner, lunch, breakfast, restaurant, cafe, food, eat, meal, fast food, delivery |
| **Attractions** | attraction, museum, theme park, tourist, entertainment, park, waterfall, boat, tour, sightseeing, ticket, entrance |
| **Transportation** | taxi, uber, bolt, grab, bus, train, transport, gas, fuel, car rental, scooter rental, rental, metro, subway |
| **Education** | course, book, learning, education, study, class, school, university, college, training |
| **Fitness** | gym, fitness, sport, exercise, workout, training, yoga, pilates, swimming, running |
| **Massage** | massage, spa, wellness, therapy, relaxation |
| **Shakes** | shake, smoothie, juice, fruit, drink, beverage, fresh, blend |
| **Orders** | order, lazada, decathlon, amazon, online, shopping, delivery, purchase, buy |

If no keywords match, expenses are categorized as **"Other"**.

## 🚀 Deployment Options

> **⚠️ Important**: This bot requires a browser (Chromium) to run WhatsApp Web, which can be challenging on some platforms. Below are tested deployment options.

### Option 1: Railway (Recommended ✅)

**Railway** works reliably with Puppeteer and Chromium, though it's more expensive than other options.

#### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure your `.env` file is **NOT** committed (it's in `.gitignore`)

#### Step 2: Deploy on Railway
1. Go to [Railway.app](https://railway.app) and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will automatically detect it's a Node.js app

#### Step 3: Add Environment Variables
In Railway dashboard, go to **Variables** tab and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `SHEET_ID` | `your_sheet_id` | Your Google Sheet ID |
| `GROUP_NAME` | `your_group_name` | Your WhatsApp group name |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | `{...}` | Your Google service account JSON |
| `SENDER_MAPPING` | `{...}` | Phone number mapping (optional) |

#### Step 4: Deploy and Connect
1. Railway will automatically deploy
2. Wait for deployment to complete
3. Visit your app URL + `/qr` (e.g., `https://your-app.railway.app/qr`)
4. Scan the QR code with WhatsApp
5. Your bot is now running! 🎉

**Cost**: ~$5-10/month (Railway is more expensive but reliable)

---

### Option 2: AWS EC2 (Budget-Friendly 💰)

For a more cost-effective solution, deploy on AWS EC2.

#### Step 1: Launch EC2 Instance
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Launch EC2 instance:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: t3.micro (free tier eligible)
   - **Storage**: 8GB minimum

#### Step 2: Connect and Setup
```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Chromium
sudo apt-get install -y chromium-browser

# Clone your repository
git clone <your-repo-url>
cd whatsapp-expense-bot

# Install dependencies
npm install
```

#### Step 3: Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit with your values
nano .env
```

#### Step 4: Run with PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the bot
pm2 start index.js --name whatsapp-bot

# Save PM2 configuration
pm2 save
pm2 startup
```

**Cost**: ~$0-5/month (free tier or small instance)

---

### Option 3: Render.com (May Have Issues ⚠️)

Render.com sometimes has issues with Puppeteer/browserless setups.

#### If you want to try Render:
1. Go to [Render.com](https://render.com)
2. Create **Web Service**
3. Connect GitHub repository
4. Add environment variables (same as Railway)
5. **Important**: Add these build settings:
   ```
   Build Command: apt-get update && apt-get install -y chromium && npm install
   Start Command: node index.js
   ```

**Note**: Render may not work reliably with Puppeteer. Railway or AWS are more reliable options.

---

### Deployment Comparison

| Platform | Reliability | Cost | Setup Difficulty | Notes |
|----------|-------------|------|------------------|-------|
| **Railway** | ✅ High | 💰💰💰 Expensive | 🟢 Easy | Works perfectly with Puppeteer |
| **AWS EC2** | ✅ High | 💰💰 Budget | 🟡 Medium | Full control, more setup required |
| **Render** | ⚠️ Unreliable | 💰💰 Moderate | 🟢 Easy | May have Puppeteer issues |
| **Heroku** | ❌ Not supported | 💰💰 Moderate | 🟢 Easy | No longer free, Puppeteer issues |

### Troubleshooting Deployment Issues

**Common Puppeteer/Browser Issues:**
- **Error**: `Could not find browser`
- **Solution**: Ensure Chromium is installed and `PUPPETEER_EXECUTABLE_PATH` is set correctly

**Platform-specific fixes:**
- **Railway**: Usually works out of the box
- **AWS**: Install Chromium manually
- **Render**: May need custom build commands
- **Heroku**: Not recommended due to Puppeteer limitations

## 🔧 Troubleshooting

### Common Issues

**Bot not responding:**
- Check if the group name in `.env` matches exactly
- Verify the bot is connected (no QR code showing)
- Check console logs for errors

**Google Sheets not updating:**
- Verify `SHEET_ID` is correct
- Check if service account has access to the sheet
- Ensure `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid

**QR code not working:**
- Try refreshing the `/qr` endpoint
- Clear browser cache
- Restart the bot

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test with a simple message format first

## 📊 Google Sheets Output

The bot creates monthly sheets with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Timestamp** | When the expense was logged | `25/12/2024, 14:30:15` |
| **Sender** | Who sent the message | `Sagie` |
| **Description** | Expense description | `Groceries At Store` |
| **Amount** | Expense amount | `50` |
| **Category** | Auto-categorized | `Groceries` |
| **Running Sum** | Monthly total so far | `150` |

## 🛡️ Security Notes

- Never commit your `.env` file to version control
- Keep your Google service account credentials secure
- The bot only responds in the specified WhatsApp group
- Phone numbers are mapped to friendly names for privacy 