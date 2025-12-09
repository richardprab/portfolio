import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  description: string[];
  dates: string;
  image?: string;
  technologies?: string[];
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    dates: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    technologies: {
      type: [String],
      required: false,
    },
  }
);

const Experience =
  mongoose.models.Experience ||
  mongoose.model<IExperience>('Experience', ExperienceSchema);

export default Experience;

