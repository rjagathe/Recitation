class SheetsIntegration {
  async getQuestions(count, subject, chapter) {
    const SHEET_ID = '19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Master%20Answer%20sheet&tq=SELECT%20A,B,C,D,E,F`;
    
    const res = await fetch(url);
    const text = await res.text();
    const data = JSON.parse(text.slice(47, -2));
    
    return data.table.rows.slice(0, count).map(row => ({
      questionText: row.c[0]?.v || 'No question',
      answers: {
        basic: row.c[1]?.v || 'No basic answer',
        elementary: row.c[2]?.v || '',
        intermediate: row.c[3]?.v || '',
        advanced: row.c[4]?.v || '',
        prodigy: row.c[5]?.v || 'No prodigy answer'
      }
    }));
  }
}
