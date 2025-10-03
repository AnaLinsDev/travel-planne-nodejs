import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function getActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { activities: {
            orderBy: {
                occurs_at: 'asc'
            }
        } },
      });

      if (!trip) {
        throw new ClientError("Trip not found.");
      }

      // Separando por dias

      const diffDaysBetwwenTripStartAndEnd = dayjs(trip.ends_at).diff(
        trip.starts_at,
        "days"
      );

      const activities = Array.from({
        length: diffDaysBetwwenTripStartAndEnd + 1,
      }).map((_, idx) => {
        const date = dayjs(trip.starts_at).add(idx, "days").toDate();

        return {
          date,
          activities: trip.activities.filter((activity) => {
            return dayjs(activity.occurs_at).isSame(date, "day");
          }),
        };
      });

      return { activities };
    }
  );
}
