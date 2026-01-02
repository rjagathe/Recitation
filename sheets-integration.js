class SheetsIntegration {
  async getQuestions(count, subject, chapter) {
    // Replace with YOUR actual Sheet ID
    const SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1&tq=SELECT%20A,B,C`;
    
    const res = await fetch(url);
    const text = await res.text();
    const data = JSON.parse(text.slice(47, -2));
    
    // Returns formatted questions from your sheet
    return data.table.rows.slice(0, count).map(row => ({
      questionText: row.c[0]?.v || 'No question',
      answers: {
        basic: row.c[1]?.v || 'No answer',
        prodigy: row.c[2]?.v || 'Prodigy answer'
      }
    }));
  }
}
