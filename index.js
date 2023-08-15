const express = require("express");
const line = require("@line/bot-sdk");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const env = dotenv.config().parsed;
const app = express();

const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
};

const image = {
    consult_howToUseApplyRubber: "https://vantpharuay.com/wp-content/uploads/2023/08/5-scaled.jpg"
}

const flexMessageJson = {
    consult_flex: path.join(__dirname, "flexMessage/consult/consult-flex.json"),
    product_flex: path.join(__dirname, "flexMessage/product/product-flex.json"),
    spacial_flex: path.join(__dirname, "flexMessage/spacial/spacial-flex.json"),
    consult_howToUseApplyRubber_flex: path.join(__dirname, "flexMessage/consult/consult-howToUseApplyRubber-flex.json")
}

const client = new line.Client(lineConfig);

app.post("/webhook", line.middleware(lineConfig), async(req, res) => {

    try {
        const events = req.body.events;
        console.log("even=>>>>", events);
        return events.length > 0 ?
            await events.map(item => handleEvent(item)) : res.status(200).send("OK");
    } catch (error) {
        res.status(500).end();
    }

})

const handleEvent = async function(events) {

    switch (events.type) {
        case "postback":
            postBackCase(events);
    }


}

function postBackCase(event) {
    const postBackData = event.postback.data;
    if (postBackData.includes("consult")) {
        consultCase(event)
    } else if (postBackData.includes("product")) {
        return client.replyMessage(event.replyToken, flexMessage("สินค้า", flexMessageJson.product_flex))
    } else if (postBackData.includes("spacial")) {
        return client.replyMessage(event.replyToken, flexMessage("สิทธิพิเศษ", flexMessageJson.spacial_flex))
    }
}

function consultCase(event) {
    switch (event.postback.data) {
        case "consultButton":
            return client.replyMessage(event.replyToken, flexMessage("ปรึกษา", flexMessageJson.consult_flex));
        case "consult-howToUseApplyRubber":
            return client.replyMessage(event.replyToken, [
                flexMessage("flexMessage", flexMessageJson.consult_howToUseApplyRubber_flex),
                imageMessage(image.consult_howToUseApplyRubber)
            ])
    }
}

const flexMessage = function(altText, path) {
    return {
        type: "flex",
        altText: altText,
        contents: JSON.parse(fs.readFileSync(path))
    }
}

function imageMessage(img) {
    return {
        type: "image",
        originalContentUrl: img,
        previewImageUrl: img
    }
}


app.listen("3000", () => {
    console.log("start server on port 3000");
})