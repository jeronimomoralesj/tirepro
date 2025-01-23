import React, { useState } from "react";

const ImageAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setAnalysisResult("");
    setError("");
  };

  const handleAnalyzeImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare the form data for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Make the prediction request to Hugging Face Inference API
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mouaff25/tyre_quality_classifier", 
        {
          method: "POST",
          headers: {
            // Replace 'YOUR_HUGGING_FACE_API_TOKEN' with an actual token
            "Authorization": `Bearer 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`,
            // Don't set Content-Type, let the browser set it with the FormData
          },
          body: formData
        }
      );

      if (!response.ok) {
        // Handle API errors
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
      }

      // Parse the response
      const results = await response.json();

      // Process the classification results
      if (results && results.length > 0) {
        // Find the label with the highest score
        const topPrediction = results[0];
        const confidence = (topPrediction.score * 100).toFixed(2);
        
        setAnalysisResult(`
          Prediction: ${topPrediction.label} 
          (Confidence: ${confidence}%)
        `);
      } else {
        throw new Error("No results received from the analysis");
      }

    } catch (error) {
      console.error("Error analyzing the image:", error);
      setError(error.message || "Failed to analyze the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "24px"
    }}>
      <h2 style={{ 
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "16px"
      }}>Tire Quality Analysis</h2>
      
      <p style={{ marginBottom: "16px" }}>
        Upload a tire image to assess its quality.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ 
          display: "block",
          width: "100%",
          marginBottom: "16px",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px"
        }}
      />

      <button
        onClick={handleAnalyzeImage}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: loading ? "#ccc" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>

      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: "4px",
          color: "#b91c1c"
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {analysisResult && (
        <div style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          borderRadius: "4px"
        }}>
          <h3 style={{ 
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px"
          }}>Analysis Result:</h3>
          <p style={{ margin: 0 }}>{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;