// import { $Enums, Roadmap } from "@prisma/client";
// import { Request, Response } from "express";
// import { User } from "./User";

// export interface CreateRoadmapRequest extends Request {
//     user: User;
//     body: {
//         prompt: string;
//     };
// }

// export interface CreateRoadmapResponse extends Response {
//     message: string;
// }

// // Interface for getting a roadmap
// export interface GetRoadmapRequest extends Request {
//     user: User;
// }

// // Interface for getting user's roadmaps
// export interface GetMyRoadmapsResponse extends Response {
//     message: string;
//     roadmaps: Roadmap[];
// }

// // Interface for getting a roadmap by ID
// export interface GetRoadmapByIdRequest extends Request {
//     user: User;
//     params: {
//         id: string;
//     }
// }

// export interface GetRoadmapByIdResponse extends Response {
//     message: string;
//     data: {
//         roadmap: Roadmap;
//         topicCount: number;
//         subtopicCount: number;
//         approximateTime: number;
//         initialSubtopic: string | null;
//     };
// }

// // Interface for getting roadmap title
// // export interface GetRoadmapTitleRequest {
// //     title: string;
// // }

// // export interface GetRoadmapTitleResponse {
// //     success: boolean;
// //     title: string;
// // }

// // Interface for getting topics by ID
// export interface GetTopicsByIdRequest extends Request {
//     user: User;
//     params: {
//         id: string;
//     }
// }

// export interface GetTopicsByIdResponse extends Response {
//     message: string;
//     data: {
//         topics: {
//             name: string;
//             id: number;
//             subtopics: {
//                 name: string;
//                 id: number;
//             }[];
//         }[];
//         roadmap: {
//             name: string;
//         } | null;
//     };
// }

// // Interface for getting subtopics by ID
// export interface GetSubTopicByIdRequest extends Request {
//     user: User;
//     params: {
//         id: string;
//     }
// }

// export interface GetSubTopicByIdResponse extends Response {
//     message: string;
//     data: {
//         subtopic: {
//             textContents: {
//                 id: number;
//                 content: string;
//             }[];
//         }
//         normalVideoContents: {
//             name: string;
//             id: number;
//             link: string;
//             thumbnail: string | null;
//             duration: number;
//             transcript: string | null;
//             videoType: $Enums.VideoType;
//         }[];
//         shortsVideoContents: {
//             name: string;
//             id: number;
//             link: string;
//             thumbnail: string | null;
//             duration: number;
//             videoType: $Enums.VideoType;
//         }[];
//     }[];
// }