import bcrypt from "bcryptjs";

const admins = [
  {
    fullName: "Sayeed Mahid",
    email: "mahdi@gmail.com",
    username: "Mahdi",
    password: bcrypt.hashSync("12345678", 10),
    image: "no-image.png",
    gender: "male",
  },
  {
    fullName: "jafar rajabzada",
    email: "jafar@gmail.com",
    username: "jafar",
    password: bcrypt.hashSync("1234567", 10),
    image: "no-image.png",
    gender: "female",
  },
  {
    fullName: "postman",
    email: "postman@gmail.com",
    username: "postman",
    password: bcrypt.hashSync("1234567", 10),
    image: "no-image.png",
    gender: "male",
    isSuperAdmin: true,
  },
  {
    fullName: "Mohsen Amani",
    email: "mohsen@gmail.com",
    username: "mohsen",
    password: bcrypt.hashSync("1234567", 10),
    image: "no-image.png",
    gender: "male",
    isSuperAdmin: true,

  },
  {
    fullName: "Manzoor Ahamd Wayar",
    email: "softwareengineerwayar@gmail.com",
    username: "manzoor_wayar",
    password: bcrypt.hashSync("1234567", 10),
    image: "no-image.png",
    gender: "male",
    isSuperAdmin: true,
  },
];

export default admins;
