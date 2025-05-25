//Define mongoose user model
import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string; //This is a string that represents the email of the user
  password: string; //This is a string that represents the password of the user
}

// An interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): any; //This is a method that will create a new User instance with the attributes we passed in
}

//schema is a blueprint for the data
const userSchema = new mongoose.Schema({
  email: {
    type: String, //In mongoose, String is a type that represents a string value
    required: true,
    unique: true, //This will ensure that the email is unique in the database
  },
  password: {
    type: String, //In mongoose, String is a type that represents a string value
    required: true,
  },
});

//userSchema.statics is a way to define static methods on the schema
//Static methods are methods that can be called on the model itself, rather than on an instance of the model
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs); //This will create a new User instance with the attributes we passed in
};

//This is a mongoose model, which is a class that represents a collection in the database
const User = mongoose.model<any, UserModel>('User', userSchema);
//We are creating a User model using the userSchema we defined above

export { User };
//We are exporting the User model and the buildUser function so that we can use them in other files
