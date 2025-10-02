import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { prisma } from "./lib/prisma";
import { confirmParticipant } from "./routes/confirm-participant";
import { confirmTrip } from "./routes/confirm-trip";
import { createTrip } from "./routes/create-trip";
import { listParticipants } from "./routes/list-participants";
import { createActivity } from "./routes/create-activity";
import { getActivity } from "./routes/get-activity";
import { createLink } from "./routes/create-link";
import { getLink } from "./routes/get-links";


const app = fastify();

//Apenas em DEV coloque o *
app.register(cors, {
  origin: "*",
});

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

//Trip
app.register(createTrip);
app.register(confirmTrip);

//Participants
app.register(confirmParticipant);
app.register(listParticipants);

//Activity
app.register(createActivity);
app.register(getActivity)

//Links
app.register(createLink)
app.register(getLink)


app.listen({ port: 3000 }).then(() => {
  console.log("SERVER RUNNING");
});
