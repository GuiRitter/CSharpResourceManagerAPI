import express from 'express';

import verifyAuth from '../middleware/verifyAuth';

import { getList, getRoot, load, save } from '../controller/fileSystemController';

const router = express.Router();

router.get('/list', getList);
// router.get('/load', load);
router.get('/root', getRoot);
// router.post('/save', save);

export default router;
