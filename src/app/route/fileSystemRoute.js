import express from 'express';

import verifyFileExtension from '../middleware/verifyFileExtension';

import { getList, getRoot, readFile, saveFile } from '../controller/fileSystemController';

const router = express.Router();

router.get('/list', getList);
router.get('/root', getRoot);
router.get('/read', verifyFileExtension, readFile);
router.post('/save', verifyFileExtension, saveFile);

export default router;
