import mongoose from 'mongoose';
import { OrderStatus } from '@dulinatickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//We export the OrderStatus enum so that we can use it in other files
export { OrderStatus };

//Attributes needed to create an order
interface OrderAttrs {
  id: string; //when creating an order, we need to specify the id because the id will be created by the orders service and we want to use the same id in the payments service
  userId: string; //id of the user who created the order
  status: OrderStatus;
  version: number;
  price: number;
}

//These are different because after we create an order, the order document in the database will have some additional properties like id, createdAt, updatedAt etc
//Attributes that a created order has in a order document in db
interface OrderDoc extends mongoose.Document {
  userId: string; //Doen't need id because mongoose.Document already has id
  status: OrderStatus;
  price: number;
  version: number;
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
    price: {
      type: Number,
      required: true,
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

//Use the updateIfCurrentPlugin to implement optimistic concurrency control
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price,
    version: attrs.version,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
