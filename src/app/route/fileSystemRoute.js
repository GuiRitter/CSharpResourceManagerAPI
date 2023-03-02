import express from 'express';

import verifyAuth from '../middleware/verifyAuth';

import { getList, getRoot, readFile, save } from '../controller/fileSystemController';

const router = express.Router();

router.get('/list', getList);
router.get('/root', getRoot);
router.get('/read', readFile);
// router.post('/save', save);

export default router;
