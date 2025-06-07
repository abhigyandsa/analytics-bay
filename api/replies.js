const { google } = require("googleapis");

module.exports = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Replies!A2:B`, // Skip header row
    });

    const rows = result.data.values || [];
    const replies = [];

    for (const row of rows) {
      const [profile, date] = row;

      if (!profile) continue;

      replies.push({
        profile_link: profile,
        date: date || "",
      });
    }

    res.status(200).json(replies);
  } catch (err) {
    console.error("Replies API Error:", err);
    res.status(500).json({ error: "Failed to load replies data" });
  }
};

