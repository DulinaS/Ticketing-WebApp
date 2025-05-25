//Define mongoose user model
import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string; //This is a string that represents the email of the user
  password: string; //This is a string that represents the password of the user
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

//This is a mongoose model, which is a class that represents a collection in the database
const User = mongoose.model('User', userSchema);
//We are creating a User model using the userSchema we defined above

//This is a function that will create a new User instance with the attributes we passed in
//It takes an object of type UserAttrs as an argument
//This function is used to create a new User instance
const buildUser = (attrs: UserAttrs) => {
  return new User(attrs); //This will create a new User instance with the attributes we passed in
};

export { User, buildUser };
//We are exporting the User model so we can use it in other files
