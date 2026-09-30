const fs = require("fs");
const path = require("path");
const ort = require("onnxruntime-node");
const sharp = require("sharp");

const EXPORT_DIR = path.join(__dirname, "../../modals/export");
const MODEL_PATH = path.join(EXPORT_DIR, "potato_disease.onnx");
const METADATA_PATH = path.join(EXPORT_DIR, "metadata.json");
const CLASSES_PATH = path.join(EXPORT_DIR, "classes.json");

const DISEASE_INFO = {
  Early_Blight: {
    displayName: "Early Blight",
    severity: "medium",
    advice:
      "Remove infected leaves, improve airflow, and apply recommended fungicide."
  },
  Healthy: {
    displayName: "Healthy",
    severity: "low",
    advice: "Leaf looks healthy. Continue regular monitoring and balanced irrigation."
  },
  Late_Blight: {
    displayName: "Late Blight",
    severity: "high",
    advice:
      "Isolate affected plants quickly and consult an agronomist for fungicide treatment."
  }
};

let session = null;
let metadata = null;
let classes = null;

const loadMetadata = () => {
  if (metadata && classes) {
    return { metadata, classes };
  }

  metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf8"));
  classes = JSON.parse(fs.readFileSync(CLASSES_PATH, "utf8"));

  return { metadata, classes };
};

const loadSession = async () => {
  if (session) return session;

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(
      "Potato disease model not found at modals/export/potato_disease.onnx"
    );
  }

  session = await ort.InferenceSession.create(MODEL_PATH);
  return session;
};

const preprocessImage = async (buffer) => {
  const { metadata: meta } = loadMetadata();
  const size = meta.image_size;

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
};

const formatPrediction = (probabilities) => {
  const { classes: labels } = loadMetadata();
  const index = probabilities.indexOf(Math.max(...probabilities));
  const scores = {};

  labels.forEach((label, i) => {
    scores[label] = Number(probabilities[i].toFixed(4));
  });

  const predictedClass = labels[index];
  const info = DISEASE_INFO[predictedClass] || {
    displayName: predictedClass,
    severity: "unknown",
    advice: "Consult a local agronomist for next steps."
  };

  return {
    class: predictedClass,
    displayName: info.displayName,
    confidence: Number(probabilities[index].toFixed(4)),
    severity: info.severity,
    advice: info.advice,
    probabilities: scores
  };
};

const getModelStatus = () => {
  try {
    loadMetadata();

    return {
      modelLoaded: Boolean(session),
      modelAvailable: fs.existsSync(MODEL_PATH),
      modelPath: "modals/export/potato_disease.onnx",
      classes: classes || [],
      imageSize: metadata?.image_size || 256
    };
  } catch (error) {
    return {
      modelLoaded: false,
      modelAvailable: fs.existsSync(MODEL_PATH),
      error: error.message
    };
  }
};

const predictDisease = async (buffer) => {
  if (!buffer || !buffer.length) {
    return {
      ok: false,
      message: "Image file is required"
    };
  }

  await loadSession();

  const inputTensor = await preprocessImage(buffer);
  const { metadata: meta } = loadMetadata();

  const result = await session.run({
    [meta.input_name]: inputTensor
  });

  const probabilities = Array.from(result[meta.output_name].data);

  return {
    ok: true,
    data: formatPrediction(probabilities)
  };
};

module.exports = {
  predictDisease,
  getModelStatus,
  loadSession
};
