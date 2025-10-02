import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import z from "zod";

export async function listParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/list/:tripId",
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const participants = prisma.participant.findMany({
        where: {
          trip_id: tripId,
        },
      });

      return participants;
      //return prisma.trip.findMany();
    }
  );
}
