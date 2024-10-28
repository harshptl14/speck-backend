import express, { Router, Request, Response, NextFunction } from 'express';
import MessageResponse from '../interfaces/MessageResponse';
import { createRoadmap, getMyRoadmaps, getRoadmapTitle, getRoadmapById, getTopicsById, getSubTopicById, createSubtopicContent, getSubtopicGenerationProgress, updateSubtopicCompletion, getRoadmapsInfoByUserId, resetRoadmapProgress } from '../controllers/roadmap.controller';
import { createFavorite, removeFavorite, getUserFavorites } from '../controllers/favourite.controller';
const router = express.Router();

router.get<{}, MessageResponse>('/myroadmaps', getMyRoadmaps);
router.post<{}, MessageResponse>('/create', createRoadmap);
router.get('/getById/:id', getRoadmapById);
router.post('/sendCoursetitle', getRoadmapTitle);
router.post('/sendRoadmapOutline', getRoadmapTitle);
router.get('/getTopicsById/:id', getTopicsById);
router.get('/getSubTopicById/:id', getSubTopicById);
router.get('/getRoadmapsInfoByUserId/:id', getRoadmapsInfoByUserId)
router.post('/generateSubtopicContent', createSubtopicContent);
router.get('/subtopicGenerationProgress/:jobId', getSubtopicGenerationProgress);
router.post('/updateSubtopicCompletion', updateSubtopicCompletion);


router.post('/createFavorite/:roadmapId', createFavorite);
router.delete('/removeFavorite/:roadmapId', removeFavorite);
router.get('/userFavorites', getUserFavorites);

router.post('/resetRoadmapProgress', resetRoadmapProgress);


export default router;