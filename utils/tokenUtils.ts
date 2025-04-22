export const estimateTokenCount = (text: string) => {
    // Rough average: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
};