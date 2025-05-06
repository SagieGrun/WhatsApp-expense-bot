# WhatsApp Expense Bot

A WhatsApp bot that automatically tracks expenses in a group chat and logs them to Google Sheets.

## Features

- Automatically detects and logs expenses from WhatsApp messages
- Categorizes expenses based on keywords
- Maintains running totals
- Organizes expenses by month
- Supports multiple users with friendly names
- Capitalizes descriptions and categories for better readability

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   SHEET_ID=your_google_sheet_id
   GROUP_NAME=your_whatsapp_group_name
   ```
4. Add your Google Sheets credentials as `credentials.json`
5. Run the bot:
   ```bash
   node index.js
   ```

## Deployment

This bot can be deployed on Render:

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Add environment variables:
   - `SHEET_ID`
   - `GROUP_NAME`
5. Deploy!

## Message Format

Send messages in the format:
```
Description Amount
```
or
```
Amount Description
```

Example:
```
Groceries 50
```
or
```
50 Groceries
```

## Categories

The bot automatically categorizes expenses based on keywords:

- Groceries
- Dining
- Attractions
- Transportation
- Education
- Fitness
- Massage
- Shakes
- Orders 