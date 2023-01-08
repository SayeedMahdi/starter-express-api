import asyncHandler from "express-async-handler";
import { Configuration, OpenAIApi } from 'openai';

const imageGenerator = asyncHandler(async (req, res, next) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const { prompt, size } = req.body;

    const imageSize =
        size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024';

    const response = await openai.createImage({
        prompt,
        n: 1,
        size: imageSize,
    });

    const imageUrl = response.data.data[0].url;

    res.status(200).json({
        success: true,
        data: imageUrl,
    });

    if (!response) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        res.status(400).json({
            success: false,
            error: 'The image could not be generated',
        });
    }

})

const entertainment = {
    imageGenerator
}

export default entertainment