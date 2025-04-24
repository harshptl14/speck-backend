// import { Router } from 'express';
// import {
//     createMindmapController,
//     updateMindmapController,
//     getMindmapController,
//     listMindmapsController, // Add the new controller
// } from '../controllers/mindmap.controller';
// import { jwtAuth } from '../middlewares/auth.middlewares';

// const router = Router();

// router.post('/', jwtAuth, createMindmapController);
// router.put('/:id', jwtAuth, updateMindmapController);
// router.get('/:id', jwtAuth, getMindmapController);
// router.get('/', jwtAuth, listMindmapsController); // New route to list mindmaps

// export default router;

// mindmap.route.ts
import { Router } from 'express';
import {
    createMindmapController,
    directUpdateMarkdownController,
    generateAISuggestionController,
    acceptAISuggestionController,
    getMindmapController,
    listMindmapsController,
    saveAIChatMessageController,
    getAIChatMessagesController,
    getRoadmapsInfoByUserIdController
} from '../controllers/mindmap.controller';
import { jwtAuth } from '../middlewares/auth.middlewares';

const router = Router();

// Create new mindmap
router.post('/', jwtAuth, createMindmapController);

// Direct update of markdown (no AI processing)
router.put('/:id/markdown', jwtAuth, directUpdateMarkdownController);

// Generate AI suggestion for markdown
router.post('/:id/ai-suggestion', jwtAuth, generateAISuggestionController);

// Accept AI suggestion and save to database
router.post('/:id/accept-suggestion', jwtAuth, acceptAISuggestionController);

// Save AI chat message
router.post('/:id/ai-chat', jwtAuth, saveAIChatMessageController);

// Get AI chat messages
router.get('/:id/ai-chat', jwtAuth, getAIChatMessagesController);

// Get mindmap details
router.get('/:id', jwtAuth, getMindmapController);

// List all user's mindmaps
router.get('/', jwtAuth, listMindmapsController);

// Get mindmap infos by userId (dummy response for testing)
router.get('/:id/gethomemindmapdata', jwtAuth, getRoadmapsInfoByUserIdController);

export default router;