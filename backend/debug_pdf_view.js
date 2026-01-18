const axios = require('axios');
const pdf = require('pdf-parse');

const url = "https://res.cloudinary.com/dycnpdak9/image/upload/v1768726365/tripvenza_docs/visaDocument-1768726366274-960801403.pdf";

async function run() {
    try {
        console.log("Fetching PDF...");
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        console.log("Parsing PDF...");
        const data = await pdf(response.data);
        console.log("\n--- PDF CONTENT START ---");
        console.log(data.text);
        console.log("--- PDF CONTENT END ---");
        console.log("\nMetadata:", data.info);
    } catch (error) {
        console.error("Error processing PDF:", error.message);
    }
}

run();
