# Potato Disease API — Node.js Setup Guide

Use the files in this folder to run a REST API that classifies potato leaf images.

## Files in this folder

| File | Purpose |
|------|---------|
| `potato_disease.onnx` | Trained model for inference |
| `classes.json` | Label for each output index |
| `metadata.json` | Input/output names, image size, preprocessing |

## Model contract

| Field | Value |
|-------|-------|
| Input name | `input_layer` |
| Input shape | `[1, 256, 256, 3]` |
| Pixel range | `0–255` (float32). Rescaling to `0–1` is done inside the model. |
| Output name | `output_0` |
| Output shape | `[1, 3]` softmax probabilities |
| Classes | `Early_Blight`, `Healthy`, `Late_Blight` |

## 1. Create the API project

From your project root (outside or alongside this `export` folder):

```bash
mkdir potato-api
cd potato-api
npm init -y
npm install express multer onnxruntime-node sharp
```

Copy this `export` folder into the API project, or point the code at its path.

Suggested layout:

```text
potato-api/
  export/
    potato_disease.onnx
    classes.json
    metadata.json
  server.js
  package.json
```

## 2. Add `server.js`

```javascript
const express = require("express");
const multer = require("multer");
const ort = require("onnxruntime-node");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const EXPORT_DIR = path.join(__dirname, "export");
const metadata = JSON.parse(
  fs.readFileSync(path.join(EXPORT_DIR, "metadata.json"), "utf8")
);
const classes = JSON.parse(
  fs.readFileSync(path.join(EXPORT_DIR, "classes.json"), "utf8")
);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

let session;

async function loadModel() {
  const modelPath = path.join(EXPORT_DIR, "potato_disease.onnx");
  session = await ort.InferenceSession.create(modelPath);
  console.log("ONNX model loaded:", modelPath);
}

async function preprocessImage(buffer) {
  const size = metadata.image_size;
  const { data, info } = await sharp(buffer)
    .resize(size, size)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    pixels[i] = data[i];
  }

  return new ort.Tensor("float32", pixels, [1, info.height, info.width, 3]);
}

function formatPrediction(probabilities) {
  const index = probabilities.indexOf(Math.max(...probabilities));
  const scores = {};

  classes.forEach((label, i) => {
    scores[label] = probabilities[i];
  });

  return {
    class: classes[index],
    confidence: probabilities[index],
    probabilities: scores,
  };
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", modelLoaded: Boolean(session) });
});

app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Upload an image as form field 'image'" });
    }

    const inputTensor = await preprocessImage(req.file.buffer);
    const result = await session.run({
      [metadata.input_name]: inputTensor,
    });

    const probabilities = Array.from(result[metadata.output_name].data);
    res.json(formatPrediction(probabilities));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Prediction failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;

loadModel()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to load ONNX model:", error);
    process.exit(1);
  });
```

## 3. Run the API

```bash
node server.js
```

Test with curl:

```bash
curl -X POST http://localhost:3000/predict \
  -F "image=@/path/to/leaf.jpg"
```

Example response:

```json
{
  "class": "Early_Blight",
  "confidence": 0.91,
  "probabilities": {
    "Early_Blight": 0.91,
    "Healthy": 0.05,
    "Late_Blight": 0.04
  }
}
```

## 4. Endpoints

### `GET /health`

Returns API and model status.

### `POST /predict`

Upload one image and get the predicted disease class.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `image` | file | yes | JPG, PNG, or other image format supported by `sharp` |

## 5. Notes for production

- Keep `export/potato_disease.onnx`, `classes.json`, and `metadata.json` together.
- Use `metadata.json` instead of hardcoding tensor names if you re-export the model.
- Add file size limits in `multer` if the API is public.
- For deployment, set `PORT` via environment variable.
- On Linux servers, install system packages required by `sharp` if image processing fails.

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module 'onnxruntime-node'` | Run `npm install onnxruntime-node` |
| Wrong class labels | Confirm `classes.json` matches the trained model |
| Shape mismatch error | Resize input to `256x256` and send RGB (`3` channels) |
| Low confidence | Use clear leaf images similar to the training dataset |

## 7. Re-export the model

From the project root:

```bash
py -3.12 export_onnx.py
```

After re-exporting, restart the Node.js server so it loads the updated ONNX file.
