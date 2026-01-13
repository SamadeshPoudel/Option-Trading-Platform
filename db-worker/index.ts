import { PrismaClient } from "./generated/prisma/client";
const prisma = new PrismaClient();

const user =  await prisma.user.create({
    data: {
        name: "samadesh",
        email:"poudelsam@gmail.com",
        password:"sdfasdfdfs"
    }
})
console.log("user", user)