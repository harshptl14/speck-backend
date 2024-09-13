import express, { Router, Request, Response, NextFunction } from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import { createRoadmap, getMyRoadmaps, getRoadmapTitle, getRoadmapById, getTopicsById, getSubTopicById } from '../controllers/roadmap.controller';


const router = express.Router();

router.get<{}, MessageResponse>('/myroadmaps', getMyRoadmaps);
router.post<{}, MessageResponse>('/create', createRoadmap);
router.get('/getById/:id', getRoadmapById);
router.post('/sendCoursetitle', getRoadmapTitle);
router.post('/sendRoadmapOutline', getRoadmapTitle);
router.get('/getTopicsById/:id', getTopicsById);
router.get('/getSubTopicById/:id', getSubTopicById);

export default router;