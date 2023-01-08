import bcrypt from "bcryptjs";

const clients = [
  {
    fullName: "john doe",
    email: "john@gmail.com",
    phone: "+93700235689",
    password: bcrypt.hashSync("1234567", 10),
    isVerified: new Date("12/12/2"),
    image: "no-image.png",
    gender: "male",
  },
  {
    fullName: "alex bori",
    email: "alex@gmail.com",
    phone: "+93700235689",
    password: bcrypt.hashSync("1234567", 10),
    isVerified: new Date("12/12/2"),
    image: "no-image.png",
    gender: "female",
  },
  {
    fullName: "cristina bali",
    email: "bali@gmail.com",
    phone: "+93700235689",
    password: bcrypt.hashSync("1234567", 10),
    image: "no-image.png",
    isVerified: false,
    gender: "female",
  },
  {
    fullName: "Bob Roui",
    email: "bob@gmail.com",
    phone: "+93700235689",
    password: bcrypt.hashSync("1234567", 10),
    image: "no-image.png",
    isVerified: false,
    gender: "male",
  },
];

export default clients;
