import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolioItem extends Document {
  title: string;
  image: string;
  description?: string;
  link?: string;
  technologies?: string[];
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
      default: '',
    },
    description: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    technologies: {
      type: [String],
      required: false,
    },
  }
);

const PortfolioItem =
  mongoose.models.PortfolioItem ||
  mongoose.model<IPortfolioItem>('PortfolioItem', PortfolioItemSchema);

export default PortfolioItem;

