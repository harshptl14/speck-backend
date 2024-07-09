import openai from "../configs/openai.config";

// function that calls OpenAI API to get the response
export const getResponse = async (prompt: string) => {
	try {
		const response = await openai.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "gpt-3.5-turbo",
		});
		console.log("Output:", response.choices[0].message.content);
		return response.choices[0].message.content;
	} catch (error) {
		// Handle error here
		console.error("Error occurred while calling OpenAI API:", error);
		throw error;
	}
};
