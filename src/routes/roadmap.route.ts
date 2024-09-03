import express, { Router, Request, Response, NextFunction } from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import { createRoadmap, getMyRoadmaps, getRoadmapTitle, getRoadmapById, getTopicById } from '../controllers/roadmap.controller';


const router = express.Router();

router.get<{}, MessageResponse>('/myroadmaps', getMyRoadmaps);
router.post<{}, MessageResponse>('/create', createRoadmap);
router.get('/getById/:id', getRoadmapById);
router.post('/sendCoursetitle', getRoadmapTitle);
router.post('/sendRoadmapOutline', getRoadmapTitle);
router.get('/getTopicById/:id', getTopicById);

export default router;