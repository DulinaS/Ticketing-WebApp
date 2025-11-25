import mongoose from 'mongoose';
import { OrderStatus } from '@dulinatickets/common';

//Attributes needed to create an order
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

//These are different because after we create an order, the order document in the database will have some additional properties like id, createdAt, updatedAt etc
//Attributes that a created order has in a order document in db
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

//Methods in a model
//What in here does is we are adding a build method to the Order model that will create a new Order instance
interface OrderModel extends mongoose.Model<OrderDoc> {
  //build method take OrderAttrs as attributes and returns a Order Documnet
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String, //
      required: true,
      enum: Object.values(OrderStatus), //This makes sure that the status can only be one of the values in the OrderStatus enum
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    toJSON: {
      transform(doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
