import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({
          participantId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params;

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      });

      if (!participant) {
        throw new ClientError("Participant not found.");
      }

      const tripId = participant.trip_id;
      const front_url = env.FRONT_BASE_URL

      if (participant.is_confirmed) {
        reply.redirect(`${front_url}/trips/${tripId}`);
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { is_confirmed: true },
      });

      return reply.redirect(`${front_url}/trips/${tripId}`);
    }
  );
}
