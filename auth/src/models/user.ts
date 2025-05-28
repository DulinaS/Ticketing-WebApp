//Define mongoose user model
import mongoose from 'mongoose';
import { Password } from '../services/password'; //Importing the Password service to hash the password

// An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string; //This is a string that represents the email of the user
  password: string; //This is a string that represents the password of the user
}

// An interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc; //This is a method that will create a new User instance with the attributes we passed in
}

// An interface that describes the properties that a User document has
interface UserDoc extends mongoose.Document {
  email: string; //This is a string that represents the email of the user
  password: string; //This is a string that represents the password of the user
}

//schema is a blueprint for the data
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, //In mongoose, String is a type that represents a string value
      required: true,
      unique: true, //This will ensure that the email is unique in the database
    },
    password: {
      type: String, //In mongoose, String is a type that represents a string value
      required: true,
    },
  },
  //This is the options object that we pass to the schema
  //It has a toJSON method that will transform the document before sending it as a response
  //This is used to remove the _id, password, and __v fields from the response
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id; //We are adding the id field to the response
        delete ret._id; //We are deleting the _id field from the response
        delete ret.password; //We are deleting the password field from the response
        delete ret.__v; //We are deleting the __v field from the response
      },
    },
  }
);

//This is a pre-save hook that will run before the user is saved to the database
//What we do is we hash the password before saving the user to the database
userSchema.pre('save', async function (done) {
  //Modified means we are checking if the password field has been modified
  //If the password field has not been modified, we will not hash it
  //Even if we are creating a new user, modified will be true
  if (this.isModified('password')) {
    //If the password is modified, we will hash it
    const hashed = await Password.toHash(this.get('password')); //We use the Password service to hash the password
    this.set('password', hashed); //We set the password to the hashed password
  }
  done(); //We call done to indicate that we are done with the pre-save hook
});

//userSchema.statics is a way to define static methods on the schema
//Static methods are methods that can be called on the model itself, rather than on an instance of the model
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs); //This will create a new User instance with the attributes we passed in
};

//This is a mongoose model, which is a class that represents a collection in the database
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
//We are creating a User model using the userSchema we defined above

export { User };
//We are exporting the User model and the buildUser function so that we can use them in other files
