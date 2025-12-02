import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
//This ticket model is different from the ticket model in the tickets service
//This ticket model only contains the properties that are required for the orders service

//Attributes that are required to create a new Ticket
interface TicketAttrs {
  id: string; //We will set the id property manually because the ticket already exists in the tickets service
  title: string;
  price: number;
}

//Attributes that a created Ticket has in a ticket document in db
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>; //Check whether the ticket is reserved or not
}

//Methods in a model
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;

  //Find a ticket by event data (id and version)
  //This is used to ensure that we are processing events in the correct order
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

//Use the updateIfCurrentPlugin to handle optimistic concurrency control
schema.plugin(updateIfCurrentPlugin);
//Set the version key to 'version' instead of default '__v'
schema.set('versionKey', 'version');

//Add a static method to the schema to build a ticket
schema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id, //Manually set the _id property to the id from attrs
    title: attrs.title,
    price: attrs.price,
  });
};

//Add a static method to find a ticket by event data
schema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

//If ticket is reserved, it is associated with an order that is not cancelled
//Find whether the ticket is already reserved
//Run query to look at all orders. Find an order where the ticket
//is the ticket we just found *and* the orders status is *not* cancelled
//If we find an order from that means the ticket is reserved
//This finds an existing order for the ticket that is not cancelled
schema.methods.isReserved = async function () {
  //this === the ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder; //If existingOrder is null, return false. If it is not null, return true
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', schema);

export { Ticket, TicketDoc };
