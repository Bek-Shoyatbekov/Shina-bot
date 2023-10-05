import { Schema, model } from "mongoose";

const productSchema = new Schema({
  tuliq_nomi: String,
  narxi: Number,
  foiz_3oy: String,
  foiz_6oy: String,
  foiz_9oy: String,
  soni: String,
  kompaniyasi: String,
  naqtga: String,
  diameter: String,
  ulcham: String,
  eni: String,
  rasmi: String,
});

export default model("Product", productSchema);
