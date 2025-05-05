
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";

const featureSchema = [
  { name: "Gender", type: "categorical", options: ["Female", "Male"], tip: "Customer's gender." },
  { name: "Senior Citizen", type: "categorical", options: ["No", "Yes"], tip: "Is the customer a senior citizen?" },
  { name: "Partner", type: "categorical", options: ["No", "Yes"], tip: "Does the customer have a partner?" },
  { name: "Dependents", type: "categorical", options: ["No", "Yes"], tip: "Does the customer have dependents?" },
  { name: "Tenure (months)", type: "numeric", tip: "Number of months the customer has stayed." },
  { name: "Phone Service", type: "categorical", options: ["No", "Yes"], tip: "Is phone service active?" },
  { name: "Multiple Lines", type: "categorical", options: ["No", "Yes", "No phone service"], tip: "Does the customer have multiple lines?" },
  { name: "Internet Service", type: "categorical", options: ["DSL", "Fiber optic", "No"], tip: "Type of internet service." },
  { name: "Online Security", type: "categorical", options: ["No", "Yes", "No internet service"], tip: "Is online security enabled?" },
  { name: "Online Backup", type: "categorical", options: ["No", "Yes", "No internet service"], tip: "Is online backup enabled?" },
  { name: "Device Protection", type: "categorical", options: ["No", "Yes", "No internet service"], tip: "Does the customer have device protection?" },
  { name: "Tech Support", type: "categorical", options: ["No", "Yes", "No internet service"], tip: "Is tech support active?" },
  { name: "Streaming TV", type: "categorical", options: ["No", "Yes", "No internet service"], tip: "Is streaming TV subscribed?" },
  { name: "Streaming Movies", type: "categorical", options: ["No", "Yes", "No internet service"], tip: "Is streaming movies subscribed?" },
  { name: "Contract", type: "categorical", options: ["Month-to-month", "One year", "Two year"], tip: "Type of contract." },
  { name: "Paperless Billing", type: "categorical", options: ["No", "Yes"], tip: "Is paperless billing active?" },
  { name: "Payment Method", type: "categorical", options: ["Electronic check", "Mailed check", "Bank transfer", "Credit card"], tip: "Customer's payment method." },
  { name: "Monthly Charges", type: "numeric", tip: "Current monthly bill amount." },
  { name: "Total Charges", type: "numeric", tip: "Total charges accumulated." }
];

const sampleInput = [
  "Female", "No", "Yes", "No", "5", "Yes", "No", "Fiber optic", "No", "Yes", "No", "No", "No", "Yes",
  "Month-to-month", "Yes", "Electronic check", "70.35", "350.5"
];

export default function ChurnPredictForm() {
  const [formData, setFormData] = useState(Array(featureSchema.length).fill(""));
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleChange = (index, value) => {
    const updated = [...formData];
    updated[index] = value;
    setFormData(updated);
  };

  const encodeFeature = (index, value) => {
    const feature = featureSchema[index];
    if (feature.type === "categorical") {
      return feature.options.indexOf(value);
    }
    return parseFloat(value);
  };

  const handleSubmit = async () => {
    const encoded = formData.map((val, i) => encodeFeature(i, val));
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: encoded })
      });
      const data = await response.json();
      setPrediction(data.prediction);
      setHistory([{ input: formData, output: data.prediction }, ...history]);
    } catch (error) {
      alert("Something went wrong. Check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const prefillExample = () => {
    setFormData(sampleInput);
    setPrediction(null);
  };

  const resetForm = () => {
    setFormData(Array(featureSchema.length).fill(""));
    setPrediction(null);
  };

  return (
    <motion.div className="max-w-4xl mx-auto p-4 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-center">Customer Churn Predictor</h1>
      <div className="text-center space-x-2">
        <Button variant="outline" onClick={prefillExample}>Use Example Customer</Button>
        <Button variant="ghost" onClick={resetForm}>Reset</Button>
      </div>
      <Card className="p-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureSchema.map((feature, index) => (
            <div key={index} className="space-y-1">
              <Label title={feature.tip}>{feature.name}</Label>
              {feature.type === "categorical" ? (
                <Select onValueChange={(val) => handleChange(index, val)} value={formData[index]}>
                  <SelectTrigger className="w-full">
                    {formData[index] || `Select ${feature.name}`}
                  </SelectTrigger>
                  <SelectContent>
                    {feature.options.map((opt, idx) => (
                      <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  placeholder={feature.name}
                  value={formData[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="md:col-span-2">
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Predicting..." : "Predict Churn"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {prediction !== null && (
        <motion.div
          className={`text-center text-2xl font-bold py-4 rounded-md shadow-md mt-4 ${
            prediction === 1 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {prediction === 1 ? "⚠️ This customer is likely to CHURN." : "✅ This customer is likely to STAY."}
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Prediction History</h2>
          <ul className="space-y-2 text-sm">
            {history.map((entry, idx) => (
              <li key={idx} className="bg-gray-50 p-2 rounded-md shadow">
                {entry.output === 1 ? "Churn" : "Stay"} — {entry.input.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
