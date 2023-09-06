import { Schema, model } from "mongoose";

const productSchema = new Schema({
  full_name: String,
  price_usd: String,
  percent_3m: String,
  percent_6m: String,
  percent_9m: String,
  quantity: String,
  company: String,
  percent_cash: String,
  diameter: String,
  size: String,
  width: String,
  image: String,
  full_model: String,
});

export default model("Product", productSchema);
