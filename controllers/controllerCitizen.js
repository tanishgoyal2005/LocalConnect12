const CitizenColRef = require("../models/ModelCitizen");
const { model } = require("../config/configAi");
const path = require("path");

// -------------------------------GEN AI EXTRACTION (OCR)----------------------
 
async function doExtractCitizenAdhar(req, resp) {     // ============Citizen Adhar Details Fetch-----------------
    try { 
        if (!req.files || (!req.files.frontpic && !req.files.backpic)) {
            return resp.json({
                status: false,
                msg: "Please upload at least one side (front or back) of the Aadhaar card.",
            });
        }

        const prompt = `
      You are an expert OCR AI specializing in Indian Aadhaar cards.
      Inspect the provided image(s) of the Aadhaar card (front and/or back).
      Extract the following fields and return STRICTLY as a JSON object:
      {
        "acardno": "12-digit Aadhaar number with or without spaces (e.g. 5421 9876 3412)",
        "name": "Full name of the person as written on card",
        "dob": "Date of birth in YYYY-MM-DD or DD/MM/YYYY format",
        "gender": "Male / Female / Other",
        "address": "Full residential address as written on back of card",
        "city": "City or District name"
      }
      If any field cannot be found, set its value to empty string "".
    `;

        const contents = [prompt];

        // Read Front Side directly from memory buffer (no disk/cloud save)
        if (req.files.frontpic) {
            contents.push({
                inlineData: {
                    data: req.files.frontpic.data.toString("base64"),
                    mimeType: req.files.frontpic.mimetype || "image/jpeg",
                },
            });
        }

        // Read Back Side directly from memory buffer (no disk/cloud save)
        if (req.files.backpic) {
            contents.push({
                inlineData: {
                    data: req.files.backpic.data.toString("base64"),
                    mimeType: req.files.backpic.mimetype || "image/jpeg",
                },
            });
        }

        // Generate extraction from Gemini Vision
        const result = await model.generateContent(contents);
        const rawText = result.response.text();
        console.log("Gemini OCR Output:", rawText);

        const jsonData = JSON.parse(rawText);

        return resp.json({
            status: true,
            extracted: jsonData,
            msg: "Aadhaar data extracted successfully by GenAI",
        });
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        return resp.json({
            status: false,
            msg: "Failed to extract Aadhaar data: " + error.message,
        });
    }
}

// ======== Save Citizen Details ========
async function doSaveCitizenDetails(req, resp) {
    try {
        console.log("Incoming Citizen req.body:", req.body);

        let doc = new CitizenColRef(req.body);
        await doc.save(); // <-- await use karein aur dot (.) nahi lagana hai

        return resp.json({
            status: true,
            msg: "Citizen Registered Successfully in Rasmo!"
        });
    } catch (err) {
        console.error(err);
        return resp.json({
            status: false,
            msg: err.message
        });
    }
}
function doFetchCitizen(req, resp) { // ============Citizen fetch-----------------
  let eid = req.body.emailid;

  CitizenColRef.findOne({ emailid: eid })
    .then((result) => {
      if (result != null) {
        // ⭐ YAHAN 'result' BHEJIYE (Taaki MongoDB ka data frontend ko mile):
        resp.json({ status: true, msg: result });
      } else {
        resp.json({ status: false, msg: "Invalid EmailId or Citizen not found" });
      }
    })
    .catch((err) => {
      resp.json({ status: false, msg: err.message });
    });
}


async function doUpdateCitizenDetails(req, resp) {              //========== Citizen Updatedion
    // Update Citizen Details

    CitizenColRef.updateOne({ emailid: req.body.emailid },{ $set: req.body })
    .then((res) => {
        resp.json({
            status: true,
            msg: "Citizen Updated Successfully in Rasmo!"
        });
    })
    .catch((err) => {
        resp.json({
            status: false,
            msg: err.message
        });
    });
}


module.exports={doExtractCitizenAdhar,doSaveCitizenDetails,doFetchCitizen,doUpdateCitizenDetails};