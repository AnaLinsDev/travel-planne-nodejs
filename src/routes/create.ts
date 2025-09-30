import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/create",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          is_confirmed: z.boolean(),
          owner_name: z.string(),
          owner_email: z.email(),
        }),
      },
    },
    async (request) => {
      const {
        destination,
        starts_at,
        ends_at,
        is_confirmed,
        owner_name,
        owner_email,
      } = request.body;

      if (
        dayjs(starts_at).isBefore(new Date()) ||
        dayjs(ends_at).isBefore(starts_at)
      ) {
        throw new Error("Invalid start trip date");
      }

      const trip = await prisma.trip.create({
        data: { destination, starts_at, ends_at, is_confirmed },
      });

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: {
          name: "Equipe Planner",
          address: "oi@planner.com",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },

        subject: "Testando envio de email",
        html: "<h1>Teste envio de email</h1>",
      });

      console.log(nodemailer.getTestMessageUrl(message))

      return { tripId: trip.id };
    }
  );
}
