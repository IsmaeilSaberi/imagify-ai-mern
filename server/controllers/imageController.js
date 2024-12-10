import userModel from "../models/userModel.js";
import FormData from "formdata";
import { Buffer } from "buffer";

/// new api from replicate
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    const user = await userModel.findById(userId);

    if (!user || !prompt) {
      return res.json({ success: false, message: "Missing details!" });
    }
    if (user.creditBalance === 0 || userModel.creditBalance < 0) {
      return res.json({
        success: false,
        message: "No credit balance",
        creditBalance: user.creditBalance,
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    // const output = await replicate.run(
    //   "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
    //   {
    //     input: {
    //       width: 1024,
    //       height: 1024,
    //       prompt: "self-portrait of a woman, lightning in the background",
    //       scheduler: "K_EULER",
    //       num_outputs: 1,
    //       guidance_scale: 0,
    //       negative_prompt: "worst quality, low quality",
    //       num_inference_steps: 4,
    //     },
    //   }
    // );
    // console.log(output);

    fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLIPDROP_API,
      },
      body: formData,
    })
      .then((response) => {
        // console.log(response);
        response.arrayBuffer();
      })
      .then((buffer) => {
        // const base64Image = Buffer.from(buffer, "binary").toString("base64");
        const base64Image = btoa(
          String.fromCharCode(...new Uint8Array(buffer))
        ); // Convert buffer to base64
        // console.log("base64: ", base64Image);

        // const resultImage = `data:image/png;base64,${base64Image}`;
        const resultImage = `data:image/png;base64,${base64Image}`;

        // console.log("result: ", resultImage);
        res.json({
          success: true,
          message: "Image generated",
          creditBalance: user.creditBalance - 1,
          resultImage,
        });
      })
      .then(async (data) => {
        await userModel.findByIdAndUpdate(user._id, {
          creditBalance: user.creditBalance - 1,
        });
      })
      .catch((error) => console.error("Error:", error));
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { generateImage };
