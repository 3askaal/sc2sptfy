import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GenerationDocument = HydratedDocument<Generation>;

@Schema()
export class Generation {
  @Prop() scUser: number;
  @Prop() sptfyUser: string;
  @Prop() jobId: string;
  @Prop() status: 'active' | 'completed' | 'canceled';
}

export const GenerationSchema = SchemaFactory.createForClass(Generation);
