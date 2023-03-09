import {
	errorMessage, status,
} from '../helper/status';

import { fileExtensionRegex } from '../util/file';

import { getLog } from '../util/log';

const log = getLog('verifyFileExtension');

/**
  * Verify Token
  * @param {object} req 
  * @param {object} res 
  * @param {object} next
  * @returns {object|void} response object 
  */
const verifyFileExtension = async (req, res, next) => {
	let { fileName } = req.query;
	try {
		fileName = JSON.parse(fileName);
		if (!fileExtensionRegex.test(fileName)) {
			return res.status(status.bad).send('Selected file is not a C♯ resource file.');
		}
	} catch (error) {
		log('verifyFileExtension', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
	next();
};

export default verifyFileExtension;
