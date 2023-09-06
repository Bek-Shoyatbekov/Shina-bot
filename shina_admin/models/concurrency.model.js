import { Schema, model } from "mongoose";

const concurrencySchema = new Schema({
  id: {
    type: Number,
    default: 0,
  },
  val: {
    type: Number,
    default: 0,
  },
});

export default model("Con", concurrencySchema);
