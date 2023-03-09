// import {
// 	isNonEmptyString
// } from '../helper/validation';

import {
	errorMessage,
	status
} from '../helper/status';

import { LANGUAGE } from '../constant/resource';

import { equalsComparator, listMerge } from '../util/data';
import { isFolderOrCSharpResource } from '../util/file';
import { byName, getName } from '../util/resource';

import {
	closeTagRegex,
	commentRegex,
	englishRegex,
	fileExtensionRegex,
	nameRegex,
	resHeaderCloseRegex,
	resHeaderStartRegex,
	startTagRegex,
	valueRegex
} from '../util/file';

import { getLog } from '../util/log';

const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const log = getLog('fileSystemController');

const root = path.parse(process.cwd()).root;

const entryListToString = (entryList, language) => entryList.map(entry => 
	`  <data name="${entry.name}" xml:space="preserve">\n    <value>${entry[language].value || ''}</value>\n${entry[language].comment ? `    <comment>${entry[language].comment}</comment>\n` : ''}  </data>`
).join('\n') + '\n';

const getEntryListFromFile = fileContent => {
	const lineList = fileContent.split('\n');
	return lineList.reduce((previousObject, line) => {
		let isEnabled = previousObject.isEnabled;
		let isResHeader = previousObject.isResHeader;
		let prefixList = previousObject.prefixList;
		let entryList = previousObject.entryList;
		let name = previousObject.name;
		let value = previousObject.value;
		let comment = previousObject.comment;
		if (isEnabled) {
			if (isResHeader) {
				prefixList = prefixList.concat(line);
			}
			if (resHeaderStartRegex.test(line)) {
				isResHeader = true;
				prefixList = prefixList.concat(line);
			} else if (resHeaderCloseRegex.test(line)) {
				isResHeader = false;
				name = null;
				value = null;
				comment = null;
			}
			const nameMatch = nameRegex.exec(line);
			const valueMatch = valueRegex.exec(line);
			const commentMatch = commentRegex.exec(line);
			const isTagClosed = closeTagRegex.test(line);
			if (isTagClosed) {
				entryList = entryList.concat({ name, value, comment });
				name = null;
				value = null;
				comment = null;
			} else {
				name = nameMatch ? nameMatch[1] : name;
				value = valueMatch ? valueMatch[1] : value;
				comment = commentMatch ? commentMatch[1] : comment;
			}
		} else {
			isEnabled = startTagRegex.test(line);
			prefixList = prefixList.concat(line);
		}
		return { isEnabled, isResHeader, prefixList, entryList, name, value, comment };
	}, {
		isEnabled: false,
		prefixList: [],
		isResHeader: false,
		entryList: [],
		name: null,
		value: null,
		comment: null
	});
};

export const getList = async (req, res) => {
	let { pathList } = req.query;
	log('readFile', { pathList });
	try {
		pathList = JSON.parse(pathList);
		const path = pathList.join('/');
		const list = fs.readdirSync(path).map(file => {

			let isDirectory;

			try {
				isDirectory = fs.lstatSync(path + '/' + file).isDirectory();
			} catch (exception) {
				isDirectory = null
			}

			return {
				name: file,
				isDirectory
			};
		}).filter(isFolderOrCSharpResource).sort((fileA, fileB) => {
			if ((fileA.isDirectory) && (!fileB.isDirectory)) {
				return -1;
			} else if ((!fileA.isDirectory) && (fileB.isDirectory)) {
				return 1;
			} else {
				return fileA.name.localeCompare(fileB.name);
			}
		});
		return res.status(status.success).send(list);
	} catch (error) {
		log('getList', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
};

export const getRoot = async (req, res) => {
	try {
		return res.status(status.success).send(root);
	} catch (error) {
		log('getRoot', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
};

const mergeEntryList = (nameList, mergedEntryList, specificEntryList, specificName) => nameList.map(name => {
	let entry = mergedEntryList.find(byName(name));
	if (!entry) {
		entry = { name };
	}
	entry[specificName] = {};
	const specificEntry = specificEntryList.find(byName(name));
	if (specificEntry) {
		if (specificEntry.value) {
			entry[specificName].value = specificEntry.value;
		}
		if (specificEntry.comment) {
			entry[specificName].comment = specificEntry.comment;
		}
	}
	return entry;
});

const normalizeLineBreak = string => string.replaceAll('\r\n', '\n').replaceAll('\r', '\n');

export const readFile = async (req, res) => {
	let { pathList, fileName } = req.query;
	log('readFile', { pathList, fileName });
	try {
		fileName = JSON.parse(fileName);
		const neutralFileName = englishRegex.test(fileName) ? `${englishRegex.exec(fileName)[1]}.resx` : fileName;
		const englishFileName = englishRegex.test(fileName) ? fileName : `${fileExtensionRegex.exec(fileName)[1]}.${LANGUAGE.ENGLISH}.resx`;
		pathList = JSON.parse(pathList);
		const neutralPath = pathList.concat(neutralFileName).join('/');
		const englishPath = pathList.concat(englishFileName).join('/');
		log('readFile', { neutralPath, englishPath });
		const neutralFile = normalizeLineBreak(fs.readFileSync(neutralPath, 'utf8'));
		const englishFile = normalizeLineBreak(fs.readFileSync(englishPath, 'utf8'));
		const { entryList: neutralEntryList, prefixList } = getEntryListFromFile(neutralFile);
		const { entryList: englishEntryList } = getEntryListFromFile(englishFile);
		const neutralNameList = neutralEntryList.map(getName);
		const englishNameList = englishEntryList.map(getName);
		const mergedNameList = listMerge(neutralNameList, englishNameList, equalsComparator);
		let mergedEntryList = mergeEntryList(mergedNameList, [], neutralEntryList, LANGUAGE.NEUTRAL);
		mergedEntryList = mergeEntryList(mergedNameList, mergedEntryList, englishEntryList, LANGUAGE.ENGLISH);
		// log('readFile', { mergedEntryList });
		return res.status(status.success).send({ prefixList, mergedEntryList });
	} catch (error) {
		log('readFile', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
};

export const saveFile = async (req, res) => {
	let { fileName } = req.query;
	const { pathList, entryList, prefixList } = req.body;
	log('saveFile', { pathList, fileName, entryList: (entryList || []).length, prefixList: (prefixList || []).length });
	try {
		let neutralFile = prefixList.join('\n') + '\n';
		let englishFile = prefixList.join('\n') + '\n';
		neutralFile += entryListToString(entryList, LANGUAGE.NEUTRAL);
		englishFile += entryListToString(entryList, LANGUAGE.ENGLISH);
		neutralFile += '</root>';
		englishFile += '</root>';
		fileName = JSON.parse(fileName);
		const neutralFileName = englishRegex.test(fileName) ? `${englishRegex.exec(fileName)[1]}.resx` : fileName;
		const englishFileName = englishRegex.test(fileName) ? fileName : `${fileExtensionRegex.exec(fileName)[1]}.${LANGUAGE.ENGLISH}.resx`;
		const neutralPath = pathList.concat(neutralFileName).join('/');
		const englishPath = pathList.concat(englishFileName).join('/');
		log('saveFile', { neutralPath, englishPath });
		fs.writeFileSync(neutralPath, neutralFile);
		fs.writeFileSync(englishPath, englishFile);
		return res.status(status.success).send();
	} catch (error) {
		log('saveFile', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
};
