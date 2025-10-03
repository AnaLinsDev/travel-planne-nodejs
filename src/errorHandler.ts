import type { FastifyInstance } from "fastify/types/instance";
import { ClientError } from "./errors/client-error";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  console.log(error);

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Invalid input",
      errors: error.flatten().fieldErrors,
    });
  }

  if ((error as any).validation) {
    return reply.status(400).send({
      message: "Invalid input",
      errors: (error as any).validation, 
    });
  }


  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
