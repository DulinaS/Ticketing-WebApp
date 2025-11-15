import mongoose from 'mongoose';

//Attributes needed to create a ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

//Attributes that a created ticket has in a ticket document in db
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
}

//Methods in a model
//What in here does is we are adding a build method to the Ticket model that will create a new Ticket instance
interface TicketModel extends mongoose.Model<TicketDoc> {
  //build method take TickerAttrs as attributes and returns a ticket Documnet
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      //ret is the object that is going to be turned into a json format,, we only moidfy ret
      transform(doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

//Adding a static method to the ticketSchema
//This returns a new Ticket instance with the attributes we passed in
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

//mongoose.model takes two generics, the first is the type of the document, and the second is the type of the model
//After that we pass in the name of the model and the schema
//This will create a new collection in the database called tickets
/*
This line creates a Mongoose model named "Ticket" from the schema ticketSchema and assigns it to the constant Ticket.
 At runtime Ticket is the constructor you use to create, query, and manipulate ticket documents in database
 */
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
