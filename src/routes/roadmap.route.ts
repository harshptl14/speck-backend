import express, { Router, Request, Response, NextFunction } from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import { createRoadmap, getMyRoadmaps, getRoadmapTitle } from '../controllers/roadmap.controller';


const router = express.Router();

router.get<{}, MessageResponse>('/myroadmaps', getMyRoadmaps);
router.post<{}, MessageResponse>('/create', createRoadmap);
router.post('/sendCoursetitle', getRoadmapTitle);
router.post('/sendRoadmapOutline', getRoadmapTitle);

export default router;