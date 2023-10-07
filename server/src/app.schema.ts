import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ timestamps: true })
export class Document {
  @Prop() name: string;
  @Prop() status: number;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
