const fs = require("fs");
const path = require("path");
const ort = require("onnxruntime-node");

const MODEL_DIR = path.join(__dirname, "../../modals");
const MODEL_PATH = path.join(MODEL_DIR, "trained_model.onnx");
const FEATURES_PATH = path.join(MODEL_DIR, "features_data.json");

const CROP_INFO = {
  apple: { displayName: "Apple", season: "Winter" },
  banana: { displayName: "Banana", season: "Year-round" },
  blackgram: { displayName: "Black Gram", season: "Kharif" },
  chickpea: { displayName: "Chickpea", season: "Rabi" },
  coconut: { displayName: "Coconut", season: "Year-round" },
  coffee: { displayName: "Coffee", season: "Year-round" },
  cotton: { displayName: "Cotton", season: "Kharif" },
  grapes: { displayName: "Grapes", season: "Winter" },
  jute: { displayName: "Jute", season: "Kharif" },
  kidneybeans: { displayName: "Kidney Beans", season: "Rabi" },
  lentil: { displayName: "Lentil", season: "Rabi" },
  maize: { displayName: "Maize", season: "Kharif" },
  mango: { displayName: "Mango", season: "Summer" },
  mothbeans: { displayName: "Moth Beans", season: "Kharif" },
  mungbean: { displayName: "Mung Bean", season: "Kharif" },
  muskmelon: { displayName: "Muskmelon", season: "Summer" },
  orange: { displayName: "Orange", season: "Winter" },
  papaya: { displayName: "Papaya", season: "Year-round" },
  pigeonpeas: { displayName: "Pigeon Peas", season: "Kharif" },
  pomegranate: { displayName: "Pomegranate", season: "Winter" },
  rice: { displayName: "Rice", season: "Kharif" },
  watermelon: { displayName: "Watermelon", season: "Summer" }
};

let session = null;
let featuresData = null;
let inputName = "float_input";
let outputName = null;

const loadFeatures = () => {
  if (featuresData) return featuresData;

  featuresData = JSON.parse(fs.readFileSync(FEATURES_PATH, "utf8"));
  return featuresData;
};

const loadSession = async () => {
  if (session) return session;

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error("Crop model not found at modals/trained_model.onnx");
  }

  session = await ort.InferenceSession.create(MODEL_PATH);
  inputName = session.inputNames[0] || "float_input";
  outputName = session.outputNames[0];

  return session;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return NaN;
  }

  return Number(value);
};

const validateInputs = (payload) => {
  const features = loadFeatures().columns;
  const values = {};

  for (const key of features) {
    const number = toNumber(payload[key]);

    if (Number.isNaN(number)) {
      return {
        ok: false,
        message: `${key} is required and must be a number`
      };
    }

    values[key] = number;
  }

  return { ok: true, values };
};

const extractLabelIndex = (prediction) => {
  if (prediction === undefined || prediction === null) {
    throw new Error("Model returned an empty prediction");
  }

  if (typeof prediction === "bigint" || typeof prediction === "number") {
    return Number(prediction);
  }

  if (ArrayBuffer.isView(prediction) || Array.isArray(prediction)) {
    return extractLabelIndex(prediction[0]);
  }

  if (typeof prediction === "object" && "data" in prediction) {
    return extractLabelIndex(prediction.data[0]);
  }

  return Number(prediction);
};

const predictCrop = async (payload) => {
  const checked = validateInputs(payload);

  if (!checked.ok) {
    return checked;
  }

  const { columns, class_labels: classLabels } = loadFeatures();
  await loadSession();

  const input = new ort.Tensor(
    "float32",
    Float32Array.from(columns.map((key) => checked.values[key])),
    [1, columns.length]
  );

  const outputs = await session.run(
    {
      [inputName]: input
    },
    [outputName]
  );

  const rawPrediction = outputs[outputName];
  const labelIndex = extractLabelIndex(rawPrediction);

  if (!Number.isInteger(labelIndex) || !classLabels[labelIndex]) {
    return {
      ok: false,
      message: "Model returned an unknown crop class"
    };
  }

  const crop = classLabels[labelIndex];
  const info = CROP_INFO[crop] || {
    displayName: crop,
    season: "Unknown"
  };

  return {
    ok: true,
    data: {
      crop,
      displayName: info.displayName,
      season: info.season,
      inputs: checked.values
    }
  };
};

module.exports = {
  predictCrop,
  loadSession,
  loadFeatures
};
