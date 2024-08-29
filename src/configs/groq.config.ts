import Groq from "groq-sdk";
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default groq;
