// import openai from "../configs/openai.config";
import groq from "../../configs/groq.config";

// function that calls OpenAI API to get the response
export const getResponse = async (prompt: string) => {
	// Openai response

	// try {
	// 	const response = await openai.chat.completions.create({
	// 		messages: [{ role: "user", content: prompt }],
	// 		model: "gpt-3.5-turbo",
	// 	});
	// 	console.log("Output:", response.choices[0].message.content);
	// 	return response.choices[0].message.content;
	// } catch (error) {
	// 	// Handle error here
	// 	console.error("Error occurred while calling OpenAI API:", error);
	// 	throw error;
	// }

	try {
		const response = await groq.chat.completions.create({
			messages: [
				{
					role: "user",
					content: "Create a comprehensive learning roadmap for mastering a chess from scratch. The roadmap should be designed for a learner dedicating 30 minutes per day to the subject. Your task includes: 1. Outline the main topic and break it down into subtopics and key concepts. 2. Organize the content into a logical, progressive learning sequence. 3. Determine the appropriate duration for the roadmap based on the topic's complexity: * Aim for a maximum of 60 days for more extensive topics. * For smaller or less complex topics, create a shorter roadmap that adequately covers the material without unnecessary stretching. 4. Divide the material into manageable daily chunks, each taking about 30 minutes to complete. 5. Include a dynamic mix of learning activities, strategically placed based on the content and learning progression: * Core concept explanations * Practical exercises or applications * Quizzes for testing knowledge retention (if appropriate) * Flashcard practice sessions for key terms or ideas (if relevant) * Revision sessions to reinforce previously covered material * Hands-on projects or simulations (when applicable) * Any other activity types that suit the specific topic 6. Decide on the appropriate timing and frequency of each activity type based on the nature of the content and optimal learning strategies. For example: * Place quizzes after completing major subtopics or at regular intervals * Include flashcard practice sessions for terminology-heavy sections * Schedule revision sessions before advancing to more complex topics * Incorporate practical exercises when introducing applicable skills 7. Provide a high-level overview without diving into specific resources or materials. 8. Ensure the roadmap covers all essential areas without overwhelming the learner. 9. Design the roadmap to support self-directed learning. 10. Include milestones or checkpoints at regular intervals to help learners track their progress. Present the roadmap in a clear, structured format that's easy to follow. Use numbered days, bullet points, or a similar organization method to enhance readability. Each day's entry should clearly state the topic and type of activity planned. The goal is to create a guided learning experience that feels like a course, allowing learners to progress steadily through the topic while spending just 30 minutes a day on their studies. The dynamic inclusion of various learning activities should be tailored to maximize comprehension and retention based on the specific content being covered. The length of the roadmap should be appropriate to the topic's scope, whether that's the full 60 days or a shorter duration for more concise subjects. I want to make it in the json format. There should be one key like type, which distinguish if it's a days, info, week, quiz, revision, flashcard topic or any other info that I need to show.",
				},
			],
			model: "llama3-70b-8192",
		});
		console.log("Output:", response.choices[0]?.message?.content);
		return response.choices[0]?.message?.content;
	}
	catch (error) {
		// Handle error here
		console.error("Error occurred while calling Groq API:", error);
		throw error;
	}
};


