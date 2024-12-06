import userModel from "../models/userModel.js";
import FormData from "formdata";
import { Buffer } from "buffer";

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

    await fetch("https://api.clipdrop.co/endpoint", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLIPDROP_API,
      },
      formData,
    })
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        // const base64Image = Buffer.from(buffer, "binary").toString("base64");
        const base64Image = btoa(
          String.fromCharCode(...new Uint8Array(buffer))
        ); // Convert buffer to base64
        console.log("base64: ", base64Image);

        // const resultImage = `data:image/png;base64,${base64Image}`;
        const resultImage = `data:image/png;base64,${base64Image}`;

        console.log("result: ", resultImage);
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
