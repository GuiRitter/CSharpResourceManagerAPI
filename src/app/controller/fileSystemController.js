import dbQuery from '../db/dev/dbQuery';

import {
	isNonEmptyString
} from '../helper/validation';

import {
	errorMessage,
	status
} from '../helper/status';

import { getLog } from '../util/log';

const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const log = getLog('fileSystemController');

const root = path.parse(process.cwd()).root;

export const getList = async (req, res) => {
	const { pathList: pathOrPathList } = req.query;
	try {
		const path = [].concat(pathOrPathList).join('/');
		let list = fs.readdirSync(path).map(file => {

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
		}).sort((fileA, fileB) => {
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
		log('root', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
};

export const getRoot = async (req, res) => {
	try {
		return res.status(status.success).send(root);
	} catch (error) {
		log('root', { error });
		errorMessage.error = 'Unknown error.';
		return res.status(status.error).send(errorMessage);
	}
};

// export const close = async (req, res) => {
// 	const { projectId, actualResult } = req.body;
// 	log('close', { projectId, actualResult });
// 	if (!isNonEmptyString(actualResult)) {
// 		errorMessage.error = 'Invalid action result.';
// 		return res.status(status.bad).send(errorMessage);
// 	}
// 	const query = `UPDATE bet${'\n'
// 		}SET actual_result = $2::text,${'\n'
// 		}bet_sum = bet_sum - (CASE WHEN SUBSTRING($2::text, 2, 1) = 'R' THEN bet ELSE 0 END),${'\n'
// 		}bet_total = bet_total - (CASE WHEN SUBSTRING($2::text, 2, 1) = 'R' THEN bet ELSE 0 END),${'\n'
// 		}prize_total = prize_total + (CASE WHEN expected_result = SUBSTRING($2::text, 1, 1) THEN prize ELSE 0 END)${'\n'
// 		}WHERE project = $1${'\n'
// 		}AND actual_result IS NULL${'\n'
// 		}RETURNING *;`;
// 	try {
// 		const result = await dbQuery.query(query, [projectId, actualResult]);
// 		const rows = result.rows;
// 		log('close', { result });
// 		return res.status(status.success).send(rows);
// 	} catch (error) {
// 		log('close', { error });
// 		if (error) {
// 			if (error.message) {
// 				errorMessage.error = error.message;
// 			} else if (error.where) {
// 				errorMessage.error = error.where;
// 			} else {
// 				errorMessage.error = error;
// 			}
// 		} else {
// 			errorMessage.error = 'Unknown error.';
// 		}
// 		return res.status(status.error).send(errorMessage);
// 	}
// };

// export const getList = async (req, res) => {
// 	const { projectId } = req.query;
// 	const query = 'SELECT project, date_time, home, away, odd, bet, prize, expected_result, actual_result, bet_sum, bet_total, prize_total FROM bet WHERE project = $1 ORDER BY date_time DESC';
// 	try {
// 		const { rows } = await dbQuery.query(query, [projectId]);
// 		return res.status(status.success).send(rows);
// 	} catch (error) {
// 		log('getList', { error });
// 		errorMessage.error = 'Unknown error.';
// 		return res.status(status.error).send(errorMessage);
// 	}
// };

// export const place = async (req, res) => {
// 	const { projectId, dateTime, home, away, expectedResult, odd, bet, prize } = req.body;
// 	log('place', { projectId, dateTime, home, away, expectedResult, odd, bet, prize });
// 	const query = `INSERT INTO bet (project, date_time, home, away, expected_result, odd, bet, prize, actual_result, bet_sum, bet_total, prize_total)${'\n'
// 		}SELECT $1${'\n' // project
// 		}, $2${'\n' // date_time
// 		}, $3${'\n' // home
// 		}, $4${'\n' // away
// 		}, $5${'\n' // expected_result
// 		}, $6${'\n' // odd
// 		}, $7${'\n' // bet
// 		}, $8${'\n' // prize
// 		}, NULL${'\n' // actual_result
// 		}, $7 + (CASE WHEN expected_result = SUBSTRING(actual_result, 1, 1) THEN 0 ELSE bet_sum END)${'\n' // bet_sum
// 		}, bet_total + $7${'\n' // bet_total
// 		}, prize_total${'\n' // prize_total
// 		}FROM (${'\n'
// 		}	(${'\n'
// 		}		SELECT project, date_time, home, away, expected_result, odd, bet, actual_result, bet_sum, bet_total, prize_total${'\n'
// 		}		FROM bet${'\n'
// 		}		WHERE project = $1${'\n'
// 		}		ORDER BY date_time DESC${'\n'
// 		}		LIMIT 1${'\n'
// 		}	) ${'\n'
// 		}	UNION (SELECT $1, '0001-01-01T00:00:00Z', NULL, NULL, $5, NULL, NULL, $5, 0, 0, 0)${'\n' // for when the table is empty
// 		}) default_row${'\n'
// 		}ORDER BY date_time DESC${'\n'
// 		}LIMIT 1${'\n'
// 		}RETURNING *;`;
// 	try {
// 		const result = await dbQuery.query(query, [projectId, dateTime, home, away, expectedResult, odd, bet, prize]);
// 		const rows = result.rows;
// 		log('place', { result });
// 		return res.status(status.success).send(rows);
// 	} catch (error) {
// 		log('place', { error });
// 		if (error) {
// 			if (error.message) {
// 				errorMessage.error = error.message;
// 			} else if (error.where) {
// 				errorMessage.error = error.where;
// 			} else {
// 				errorMessage.error = error;
// 			}
// 		} else {
// 			errorMessage.error = 'Unknown error.';
// 		}
// 		return res.status(status.error).send(errorMessage);
// 	}
// };
