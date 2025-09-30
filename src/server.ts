import fastify from "fastify";
import { prisma } from "./lib/prisma";
import { createTrip } from "./routes/create";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";
import cors from "@fastify/cors";

const app = fastify();

//Apenas em DEV coloque o *
app.register(cors, {
  origin: "*"
})

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);

app.listen({ port: 3000 }).then(() => {
  console.log("SERVER RUNNING");
});
