// Remove the line that declares 'fetch'
require('dotenv').config();
import { parseStringPromise } from "xml2js";
import { groqModel } from "../../configs/longchain.config";
import { PromptTemplate } from "@langchain/core/prompts";
import { Topic, Prisma, Subtopic } from "@prisma/client";
import { prisma } from "../../../utils/client";
import axios from 'axios';
import { redisClient } from "../../../utils/client";


// Old way to gathering video and text data
export async function readGoogleResult(query: string) {
    const response = await fetch(`https://r.jina.ai/${query}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
            "X-With-Links-Summary": "true",
            "Accept": "application/json"

        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log('Response:', response);
    const data = await response.json();
    return data;
}

export function createGoogleSearchURL(query: string): string {
    // Base Google search URL
    const baseURL = "https://www.google.com/search?q=";

    // Encode the query string to handle special characters
    const encodedQuery = encodeURIComponent(query);

    // Construct the full URL
    const fullURL = `${baseURL}${encodedQuery}`;

    return fullURL;
}

export async function processGoogleResult(query: string) {
    try {

        const googleSearchURL = createGoogleSearchURL(query);
        // console.log('Google search URL:', googleSearchURL);

        // readGoogleResult(googleSearchURL)
        //     .then(data => console.log('Document content:', data))
        //     .catch(error => console.error('Error:', error));

        // Read the Google search result
        const googleResult = await readGoogleResult(googleSearchURL);

        // Extract the relevant details from the result
        // const details = extractDetails(googleResult);

        // Call the groq function with the details as a prompt

        // Return the answer
        // return answer;
    } catch (error) {
        console.error('Error processing Google result:', error);
        throw error;
    }
}

// write a function that will use the google result, call groq, put that detail as a prompt, and retrieve the answer
async function createVideoQuery(roadmapName: string | undefined, topicName: string | undefined, subtopicName: string | undefined): Promise<string> {
    // Implement the logic to call the groq function with the details as a prompt
    // ...
    // Return the answer

    const getVideoQuery = PromptTemplate.fromTemplate(`
    Please provide a YouTube video query for the following subtopic name:
        - Subtopic name: {subtopic}
    
    Output only the query string nothing else, JUST STRING WITH QUERY. Ensure the query is optimized to retrieve the most relevant video content.
        `);

    const chain = getVideoQuery.pipe(groqModel);

    const response = await chain.invoke({
        roadmap: roadmapName ?? "",
        topic: topicName ?? "",
        subtopic: subtopicName ?? ""
    });

    return response?.content as string;
}

// ----------------------------

export const getYoutubeTranscript = async (videoURL: string) => {
    try {
        // Fetch the HTML of the video page
        const response = await fetch(videoURL);
        // wait for 1 second to get the response
        await new Promise(resolve => setTimeout(resolve, 1000));
        const html = await response.text();

        // Extract the JSON data from the HTML using a regex
        const captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/);

        if (!captionTracksMatch) {
            console.error('No captionTracks found');
            return;
        }

        // Parse the JSON data
        const captionTracksArray = JSON.parse(captionTracksMatch[1]);
        const baseUrl = decodeURIComponent(captionTracksArray[0].baseUrl.replace(/\\u0026/g, '&'));

        // Fetch the captions using the base URL
        const captionsResponse = await fetch(baseUrl);
        const captionsData = await captionsResponse.text();
        // console.log('Captions data:', captionsData);

        if (!captionsData) {
            console.error('No captions data found');
            return "";
        }
        const captions = await processTranscript(captionsData);
        // console.log('Captions fetched:', captions);
        return captions;
    } catch (error) {
        console.error('Error fetching captions:', error);
    }
}

async function processTranscript(xmlString: string): Promise<string> {
    try {
        const result = await parseStringPromise(xmlString);
        const texts = result.transcript.text;

        let concatenatedText = '';
        let currentTime = 0;
        const interval = 30; // 30 seconds interval for timestamps

        texts.forEach((textElement: any) => {
            const text = textElement._.replace(/&amp;#39;/g, "'"); // Replace encoded apostrophe
            const startTime = parseFloat(textElement.$.start);
            const duration = parseFloat(textElement.$.dur);

            while (currentTime <= startTime) {
                concatenatedText += `[${formatTime(currentTime)}]`;
                currentTime += interval;
            }

            concatenatedText += `${text} `;
        });

        return concatenatedText;
    } catch (parseError) {
        console.error('Error parsing XML:', parseError);
        throw parseError;
    }
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

type RoadmapWithTopicsAndSubtopics = Prisma.RoadmapGetPayload<{
    include: {
        topics: {
            include: {
                subtopics: true;
            };
        };
    };
}>;


// STARTS FROM HERE
export const populateFirstRoadmapTopic = async (roadmapID: number) => {
    // Fetch the roadmap from the DB

    console.log('Getting roadmap details and creating content for the first topic...');
    const roadmap = await prisma.roadmap.findUnique({
        where: {
            id: roadmapID
        },
        include: {
            topics: {
                include: {
                    subtopics: true
                }
            }
        }
    });

    console.log(typeof roadmap)


    // Extract the first topic and subtopic using the roadmap data
    const firstTopic = roadmap?.topics[0];
    // const SubtopicsOfFirstTopic = firstTopic?.subtopics[0];

    // Create the text content for the first topic
    const firstTopicMarkdownContent = await createTextContent(roadmap, firstTopic, undefined);

    // return firstTopicMarkdownContent;
    // put this content into already created topic in the DB
    await prisma.topic.update({
        where: {
            id: firstTopic?.id
        },
        data: {
            markdown: firstTopicMarkdownContent as string
        }
    });

    console.log('Content created for the first topic:', firstTopic?.name);
    console.log('Creating content for subtopics of the first topic...', firstTopic?.name);

    // Create the text content for all the subtopics of the first topic
    for (const subtopic of firstTopic?.subtopics ?? []) {
        console.log('Creating content for subtopic:', subtopic.name);
        const subtopicMarkdownContent = await createTextContent(roadmap, undefined, subtopic);

        // get video links and transcripts for the subtopic
        // const videoQuery = `what is ${subtopic} in ${roadmap?.name}`;

        const videoQuery = await createVideoQuery(roadmap?.name, firstTopic?.name, subtopic?.name);
        const videoLinks = await getVideoLinks(videoQuery, "video");

        const transcriptPromisesForVideos = videoLinks.map(async (video) => {
            const link = `https://www.youtube.com/watch?v=${video.link}`;
            const transcript = await getYoutubeTranscript(link);
            return {
                videoId: video.link,
                transcript: transcript
            };
        });

        const videoTranscripts = await Promise.all(transcriptPromisesForVideos);

        // return transcripts;
        const shortsLinks = await getVideoLinks(videoQuery + "#shorts", "short");

        const transcriptPromisesForShorts = shortsLinks.map(async (video) => {
            const link = `https://www.youtube.com/shorts/${video.link}`;
            const transcript = await getYoutubeTranscript(link);
            return {
                videoId: video.link,
                transcript: transcript
            };
        });

        const shortTranscripts = await Promise.all(transcriptPromisesForShorts);

        // store these data in the DB
        try {
            const videoContentPromises = videoLinks.map(async (video, index) => {
                await prisma.videoContent.create({
                    data: {
                        topicId: firstTopic!.id, // Use the non-null assertion operator to ensure a number value
                        subtopicId: subtopic.id,
                        name: video.name,
                        duration: Number(video.duration),
                        link: video.link,
                        transcript: videoTranscripts[index].transcript,
                        summary: "",
                        videoType: 'VIDEO',
                        thumbnail: video.thumbnail,
                    },
                });
            });

            const shortsContentPromises = shortsLinks.map(async (video, index) => {
                await prisma.videoContent.create({
                    data: {
                        topicId: firstTopic!.id, // Use the non-null assertion operator to ensure a number value
                        subtopicId: subtopic.id,
                        name: video.name,
                        duration: Number(video.duration),
                        link: video.link,
                        transcript: shortTranscripts[index].transcript,
                        summary: "",
                        videoType: 'SHORTS',
                        thumbnail: video.thumbnail,
                    },
                });
            });

            const textContentPromise = prisma.textContent.create({
                data: {
                    topicId: firstTopic!.id,
                    subtopicId: subtopic.id,
                    title: "Title of the text content",
                    content: subtopicMarkdownContent as string,
                },
            });

            await Promise.all([...videoContentPromises, ...shortsContentPromises, textContentPromise]);
        } catch (error) {
            console.error('Error inserting data:', error);
        }
        finally {
            console.log('Content created for subtopic:', subtopic.name);
            await prisma.$disconnect();
        }
    }
}

const createTextContent = async (roadmap: RoadmapWithTopicsAndSubtopics | null, topic?: Topic | undefined, subtopic?: Subtopic | undefined) => {

    if (subtopic === undefined) {
        const textTopicPrompt = PromptTemplate.fromTemplate(`You are an expert course creator developing content for a comprehensive course on {roadmap}.

    Current topic: "${topic?.name}"
    Topic description: ${topic?.description}

    Context:
    1. Previously covered topics:
    ${roadmap?.topics
                ?.slice(0, (topic?.order ?? 1) - 1)
                .map(t => `   - ${t.name}: ${t.description}`).join('\n')}

    2. Current topic's subtopics:
    ${roadmap?.topics[topic?.order as number - 1]?.subtopics?.map(st => `   - ${st.name}: ${st.description}`).join('\n')}

    Task:
    Generate an overview of the current topic "${topic?.name}" suitable for a course chapter introduction. Your content should:

    1. Provide a high-level explanation of the topic
    2. Highlight its importance within the broader {roadmap}
    3. Briefly touch on how it relates to previously covered topics
    4. Introduce the subtopics that will be covered in more detail later

    Format:
    - Use Markdown formatting
    - Aim for about 300-500 words
    - Include a mix of paragraphs, bullet points, and optional diagrams or tables if relevant
    - Add 2-3 thought-provoking questions at the end to encourage further exploration

    Note: This overview should serve as an introduction to the topic. In-depth content for each subtopic will be created separately.

    Please provide only the Markdown content without any additional commentary.
    `);
        const chain = textTopicPrompt.pipe(groqModel);
        const response = await chain.invoke(
            {
                roadmap: roadmap?.name ?? "",
            }
        );

        return response?.content;
    }
    else {
        const textSubtopicPrompt = PromptTemplate.fromTemplate(`
        You are an expert educator crafting detailed content for a subtopic within the {roadmap} course.

        Main topic: "${topic?.name}"
        Current subtopic: "${subtopic?.name}"
        Subtopic description: ${subtopic?.description}

        Context:
        1. Previously covered topics:
        ${roadmap?.topics
                ?.slice(0, (topic?.order ?? 1) - 1)
                .map(t => `   - ${t.name}: ${t.description}`).join('\n')}

        2. Other subtopics within the current main topic:
        ${roadmap?.topics[topic?.order as number - 1]?.subtopics?.map(st => `   - ${st.name}: ${st.description}`).join('\n')}

        3. The whole course structure:
        ${roadmap?.topics
                ?.map(t => `   - ${t.name}: ${t.description}\n${t.subtopics?.map(st => `      - ${st.name}: ${st.description}`).join('\n')}`).join('\n')}

        Task:
        Create comprehensive educational content for the subtopic "${subtopic?.name}". Your content should:

        1. Begin with a brief introduction to the subtopic
        2. Explain core concepts, principles, and techniques in detail
        3. Provide real-world examples and applications
        4. Include code snippets or pseudocode where relevant
        5. Address common misconceptions or challenges
        6. Relate the subtopic to the main topic and other relevant topics in the course
        7. Conclude with a summary and its significance in the broader context of ${roadmap}
        8. Don't put subtopic title at top. Generate content directly without including the subtopic name as a heading.

        Format:
        - Use Markdown formatting
        - Aim for about 800-1200 words
        - Structure the content with clear headings and subheadings
        - Include a mix of explanatory text, bullet points, and code blocks

        Additional guidelines:
        - Assume the learner has foundational knowledge from previous topics
        - Use analogies or metaphors to explain complex concepts
        - Include any relevant diagrams, flowcharts, or tables (describe them in text, as they will be created separately)
        - Highlight any key terms or concepts that might be included in a glossary
        - Suggest further reading or resources for learners who want to dive deeper
        - If the subtopic is small or not complex, don't streach the content, keep it concise and to the point
        - Use the whole course structure, so that the content is in sync with the whole course, and also not repititive. If it's in upcoming topics, just mention it, don't explain it in detail, or if it's already explained, just refer to it.
        - Don't follow the structure every single time, Keep dynamic and adaptive sturcture, depeding upson the subtopic and course structure, and also the complexity of the subtopic.

        Please provide only the Markdown content without any additional commentary.
        `);

        const chain = textSubtopicPrompt.pipe(groqModel);
        const response = await chain.invoke(
            {
                roadmap: roadmap?.name ?? "",
            }
        );

        return response?.content;
    }
};

type videoDetails = {
    name: string;
    link: string;
    duration: string;
    thumbnail: string;
};

const getVideoLinks = async (query: string, type: string): Promise<videoDetails[]> => {
    const maxAttempts = 3;
    let attempts = 0;

    function convertDurationToSeconds(duration: any) {
        let totalSeconds = 0;

        // Regex to extract hours, minutes, and seconds from ISO 8601 duration format
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = duration.match(regex);

        const hours = parseInt(matches[1] || 0); // Extract hours (if present)
        const minutes = parseInt(matches[2] || 0); // Extract minutes (if present)
        const seconds = parseInt(matches[3] || 0); // Extract seconds (if present)

        // Convert to seconds and sum
        totalSeconds += hours * 3600; // 1 hour = 3600 seconds
        totalSeconds += minutes * 60; // 1 minute = 60 seconds
        totalSeconds += seconds; // Add seconds

        return totalSeconds;
    }

    while (attempts < maxAttempts) {
        try {

            console.log("------ scraping video links for query------:", query);

            const QUERY = encodeURIComponent(query);
            const videoType = type;
            const order = 'relevance';
            // const url = `https://yt.lemnoslife.com/search?part=id,snippet&q=${QUERY}&type=${videoType}&order=${order}`;
            const url = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${QUERY}&type=${videoType}&order=${order}&key=${process.env.YOUTUBE_API_KEY}`;
            // 

            // const response = await axios.get(url);

            // console.log('Response:', response.data);


            // // Process the response data
            // const videoLinks: videoDetails[] = response.data.items
            //     .slice(0, 5) // Only store the first 5 videos
            //     .map((item: any) => {
            //         return {
            //             name: item.snippet.title,
            //             link: item.id.videoId,
            //             duration: item.snippet.duration,
            //             thumbnail: item.snippet.thumbnails[0].url,
            //         };
            //     });

            const response = await axios.get(url);
            const videos = response.data.items;

            const videoDetails = await Promise.all(videos.map(async (video: any) => {
                const videoId = video.id.videoId;
                const title = video.snippet.title;
                const thumbnail = video.snippet.thumbnails.default.url;
                // const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                // Get video duration from 'videos' endpoint
                const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${process.env.YOUTUBE_API_KEY}`;
                const videoDetailsResponse = await axios.get(videoDetailsUrl);

                const length = videoDetailsResponse.data.items[0].contentDetails.duration || 0;
                const duration = convertDurationToSeconds(length);


                return {
                    name: title,
                    link: videoId,
                    duration: duration,
                    thumbnail: thumbnail
                };
            }));

            console.log("video details======>", videoDetails);


            return videoDetails;
        } catch (error) {
            console.error(`Error fetching video links (attempt ${attempts + 1}):`, error);
            attempts++;

            if (attempts === maxAttempts) {
                console.warn('Max attempts reached. Returning empty array.');
                return [];
            }

            // Optional: add a delay before the next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // This line should never be reached, but TypeScript might require it
    return [];
};


export const createSubtopicContentService = async (subtopicId: number, roadmapId: number, jobId: string) => {

    const updateProgress = async (percentage: number) => {
        await redisClient.set(`progress:${jobId}`, percentage.toString());  // Store progress in Redis
    };

    await updateProgress(10);  // 10%: Start of the process

    try {
        const subtopic = await prisma.subtopic.findUnique({
            where: {
                id: subtopicId
            }
        });

        // get topic using subtopic
        const topic = await prisma.topic.findUnique({
            where: {
                id: subtopic?.topicId
            }
        });

        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: roadmapId
            },
            include: {
                topics: {
                    include: {
                        subtopics: true
                    }
                }
            }
        });

        console.log('Creating content for subtopic:-------->', subtopic, subtopic?.name);
        console.log('Roadmap details:', roadmap);

        await updateProgress(25);  // 25%: Fetched subtopic and topic



        // const subtopicMarkdownContent = await createTextContent(roadmap, subtopic.topic, subtopic);
        const subtopicMarkdownContent = await createTextContent(roadmap, undefined, subtopic as Subtopic);

        await updateProgress(40);  // 40%: Fetched roadmap and details


        // get video links and transcripts for the subtopic
        const videoQuery = await createVideoQuery(roadmap?.name, topic?.name, subtopic?.name);

        await updateProgress(55);  // 55%: Generated markdown content

        const videoLinks = await getVideoLinks(videoQuery, "video");

        await updateProgress(70);  // 70%: Fetched video links


        const transcriptPromisesForVideos = videoLinks.map(async (video) => {
            const link = `https://www.youtube.com/watch?v=${video.link}`;
            const transcript = await getYoutubeTranscript(link);
            return {
                videoId: video.link,
                transcript: transcript
            };
        });

        const videoTranscripts = await Promise.all(transcriptPromisesForVideos);

        // return transcripts;
        const shortsLinks = await getVideoLinks(videoQuery + "#shorts", "short");

        const transcriptPromisesForShorts = shortsLinks.map(async (video) => {
            const link = `https://www.youtube.com/shorts/${video.link}`;
            const transcript = await getYoutubeTranscript(link);
            return {
                videoId: video.link,
                transcript: transcript
            };
        });

        const shortTranscripts = await Promise.all(transcriptPromisesForShorts);

        await updateProgress(90);  // 90%: Fetched short video transcripts


        // store these data in the DB
        try {
            const videoContentPromises = videoLinks.map(async (video, index) => {
                await prisma.videoContent.create({
                    data: {
                        topic: {
                            connect: { id: topic!.id } // Ensure topic is connected
                        },
                        subtopic: {
                            connect: { id: subtopicId } // Ensure subtopic is connected
                        },
                        name: video.name,
                        duration: Number(video.duration) || 0, // Ensure duration is a number
                        link: video.link,
                        transcript: videoTranscripts[index]?.transcript || "", // Ensure transcript is a string
                        summary: "",
                        videoType: 'VIDEO',
                        thumbnail: video.thumbnail,
                    },
                });
            });

            const shortsContentPromises = shortsLinks.map(async (video, index) => {
                await prisma.videoContent.create({
                    data: {
                        topic: {
                            connect: { id: topic!.id } // Ensure topic is connected
                        },
                        subtopic: {
                            connect: { id: subtopicId } // Ensure subtopic is connected
                        },
                        name: video.name,
                        duration: Number(video.duration) || 0, // Ensure duration is a number
                        link: video.link,
                        transcript: shortTranscripts[index]?.transcript || "", // Ensure transcript is a string
                        summary: "",
                        videoType: 'SHORTS',
                        thumbnail: video.thumbnail
                    },
                });
            }

            );

            const textContentPromise = prisma.textContent.create({
                data: {
                    topicId: subtopic!.topicId,
                    subtopicId: subtopic!.id,
                    title: "Title of the text content",
                    content: subtopicMarkdownContent as string,
                },
            });

            await Promise.all([...videoContentPromises, textContentPromise]);
        }
        catch (error) {
            console.error('Error inserting data:', error);
        }
        finally {
            console.log('Content created for subtopic:', subtopic?.name);
            // await prisma.$disconnect();
        }
        await updateProgress(100);  // 100%: Content generation complete

    } catch (error) {
        console.error('Error creating subtopic content:', error);
        throw error;
    }
};