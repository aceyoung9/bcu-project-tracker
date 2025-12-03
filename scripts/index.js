import { loadSpreadsheet } from './loader.js';
import { parseProjects } from './parser.js';
import { renderProjects } from './dom_generator.js';


window.addEventListener('DOMContentLoaded', async function () {
	try {
		const spreadsheetData = await loadSpreadsheet(),
			projects = parseProjects(spreadsheetData);
		renderProjects(projects);
	} catch (err) {
		console.error(err);
		document.getElementById('error-message').textContent = err;
	}
});
