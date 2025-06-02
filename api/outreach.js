const { google } = require("googleapis");

module.exports = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = meta.data.sheets
      .map(s => s.properties.title)
      .filter(name => name.startsWith("Reachouts"));

    let allRows = [];

    for (const title of sheetTitles) {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${title}!A2:D`,
      });

      const values = res.data.values || [];
      for (const row of values) {
        const [profile, slot, date, id] = row;
        if (!profile) continue;

        allRows.push({
          profile_link: profile,
          slot: slot || "",
          date: date || "",
          employee: title.replace("Reachouts - ", ""),
          id: id || "",
        });
      }
    }

    res.status(200).json(allRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load outreach data" });
  }
};

