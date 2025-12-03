/** @constant {String} The ID of the Boston area micromobility projects spreadsheet */
const PROJECT_TRACKER_SHEET_ID = '1zMV0RP0p6fp0vWyvE0HEnu0Ai2NfBQVaznDIod8RpUs',
/** @constant {String} The Google visualization query endpoint to fetch the sheet as JSON
 *  `gid=0` ⇒ retrieve the first tab */
	GVIZ_URL = `https://docs.google.com/spreadsheets/d/${PROJECT_TRACKER_SHEET_ID}/gviz/tq?tqx=out:json&gid=0`;

/**
 * Fetch the Boston area micromobility projects spreadsheet.
 * @returns {Promise<Object>} Resolves with the table data as an Object
 */
export async function loadSpreadsheet() {
	const response = await fetch(GVIZ_URL);
	
	if (!response.ok) { throw new Error(`Error fetching spreadsheet: ${response.status}`); }
	
	const responseText = await response.text(),
		gvizTable = parseGvizResponse(responseText),
		spreadsheetData = convertGvizData(gvizTable);
	
	return spreadsheetData;
}

/**
 * Parse the JSONP response from the Google Visualization Query endpoint.
 * @param {String} responseText - The raw text response.
 * @returns {Object} The parsed data object
 */
function parseGvizResponse(responseText) {
	// Remove the “google.visualization.Query.setResponse( ... );” JSONP wrapper.
	const jsonText = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1),
		data = JSON.parse(jsonText);

	if (data.status === 'error') {
		const errors = data.errors?.map(err => err.message).join('; ') || 'Unknown error.';
		throw new Error(`Error in spreadsheet response: ${errors}`);
	}

	if (!data.table) { throw new Error('No table in spreadsheet response.'); }
	
	return data.table;
}

/**
 * Converts the Gviz table object into a simple array of objects.
 * @param {object} gvizTable The parsed table object from the Gviz response.
 * @returns {Array<object>} An array of objects, one for each row.
 */
function convertGvizData(gvizTable) {
	const columns = gvizTable.cols.map(col => col.label || col.id),
		rows = gvizTable.rows;
	let output = [];

	for (const row of rows) {
		let rowData = {};
		for (let i = 0; i < columns.length; i++) {
			const cell = row.c[i],
				columnName = columns[i];
			
			// f = formatted value; v = value
			let value = cell?.f ?? cell?.v ?? '';
			rowData[columnName] = value;
		}
		output.push(rowData);
	}
	return output;
}
