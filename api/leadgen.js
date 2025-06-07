const { google } = require("googleapis");

module.exports = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Get metadata of the spreadsheet
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = meta.data.sheets
      .map(s => s.properties.title)
      .filter(name => name.startsWith("Leadgen"));

    let allLeads = [];

    for (const title of sheetTitles) {
      const empName = title.replace("Leadgen - ", "");
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${title}!D2:E`,
      });

      const rows = result.data.values || [];

      for (const row of rows) {
        const [profile, date] = row;

        if (!profile) continue;

        allLeads.push({
          profile_link: profile,
          date: date || "",
          employee: empName,
        });
      }
    }

    res.status(200).json(allLeads);
  } catch (err) {
    console.error("Leadgen API Error:", err);
    res.status(500).json({ error: "Failed to load leadgen data" });
  }
};

