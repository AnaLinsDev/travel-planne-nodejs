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
import { createActivity } from "./routes/create-activity";
import { getActivity } from "./routes/get-activity";
import { createLink } from "./routes/create-link";
import { getLink } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { createInvites } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";
import { getParticipant } from "./routes/get-participant";

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
app.register(updateTrip);
app.register(getTripDetails);

//Participants
app.register(confirmParticipant);
app.register(getParticipants);
app.register(getParticipant);
app.register(createInvites);

//Activity
app.register(createActivity);
app.register(getActivity);

//Links
app.register(createLink);
app.register(getLink);

app.listen({ port: 3000 }).then(() => {
  console.log("SERVER RUNNING");
});
