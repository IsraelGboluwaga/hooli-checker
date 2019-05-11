const fs = require('fs'); // useful for navigating the file system
const parse = require('csv-parse/lib/sync'); // needed for parsing CSV file data

const existingAccountsFilePath = './existing-accounts.csv';
const samAccountsFilePath = './sam-accounts.csv';
const missingAccountsFileName = 'missing-accounts.csv';

async function linkBuyerToFacility() {
	const parseOptions = {
		column: true,
		skip_empty_lines: true,
		trim: true
	};

	try {
		const existingAccounts = await readFileAndParse(existingAccountsFilePath, 'existing records');
		const parsedExistingRecords = parse(existingAccounts, parseOptions);
		const existingIds = parsedExistingRecords.map((record) => record[1]);

		const samAccounts = await readFileAndParse(samAccountsFilePath, 'SAM records');
		const parsedSamRecords = parse(samAccounts, parseOptions);
		const allIds = parsedSamRecords.map((record) => record[0]);

		const nonExistentIds = [];

		let found;
		for (let id of allIds) {
			found = existingIds.find((record) => record.includes(id));
			if (!found) nonExistentIds.push(id);
		}

		const nonExistentIdsCSV = arrayToCSV(nonExistentIds);
		const newFile = await writeFile(missingAccountsFileName, nonExistentIdsCSV);
		if (newFile)
			console.log(newFile);
	}
	catch (error) {
		console.log('Error: ', error);
	}

}

function readFileAndParse(filePath, fileName) {
	if (!filePath)
		return Promise.reject('The file path is required');

	return new Promise((resolve, reject) => {
		return fs.readFile(filePath, (err, data) => {
			if (err) return reject(err);
			if (!data) {
				const errMessage = fileName ? `Input file ${fileName.toLowerCase()} is empty` : 'Input file is empty';
				return reject(errMessage);
			}

			return resolve(data);
		});
	})
}

function writeFile(fileName, data) {
	return new Promise((resolve, reject) => {
		return fs.writeFile(fileName, data, (err) => {
			if (err) return reject(err);
			return resolve('successful');
		})
	});
}

function arrayToCSV (arrayName) {
	return arrayName.map((prop) => `${prop},`).join('\n');
}

linkBuyerToFacility();
