import express from 'express';
import MessageResponse from '../interfaces/MessageResponse';
import { createRoadmap, getRoadmap } from '../controllers/roadmap.controller';


const router = express.Router();

router.get<{}, MessageResponse>('/get', getRoadmap);
router.post<{}, MessageResponse>('/create', createRoadmap);

export default router;