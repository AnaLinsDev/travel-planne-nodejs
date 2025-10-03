import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

import { dayjs } from "../lib/dayjs";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          is_confirmed: z.boolean().default(false),
          owner_name: z.string(),
          owner_email: z.email(),

          emails_to_invite: z.array(z.email()),
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
        emails_to_invite,
      } = request.body;

      if (
        dayjs(starts_at).isBefore(new Date()) ||
        dayjs(ends_at).isBefore(starts_at)
      ) {
        throw new Error("Invalid start trip date");
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          is_confirmed,
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email) => {
                  return { email };
                }),
              ],
            },
          },
        },
      });

      const formattedStartAt = dayjs(starts_at).format("L LT");
      const formattedEndAt = dayjs(ends_at).format("L LT");

      const confirmationLink = `http://localhost:3000/trips/${trip.id}/confirm`;

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

        subject: `Confirme sua viagem para ${destination}`,
        html: ` <body style="font-family: Arial, sans-serif; background-color: #f9fafb; color: #111827; padding: 20px;">
                <h2 style="color:#0ea5a4;">Confirmação de Viagem</h2>

                <p>Olá <strong>{{nome}}</strong>,</p>

                <p>Você tem uma viagem marcada para <strong>${formattedStartAt} até ${formattedEndAt}</strong> com destino a <strong>${destination}</strong>.</p>

                <p>Por favor, confirme sua presença clicando no link abaixo:</p>

                <p>
                  <a href="${confirmationLink}" style="display:inline-block; padding:10px 16px; background:#0ea5a4; color:#fff; text-decoration:none; border-radius:4px;">
                    Confirmar presença
                  </a>
                </p>

                <p style="font-size:13px; color:#6b7280;">Qualquer dúvida, entre em contato com nossa equipe: suporte@exemplo.com</p>
              </body>
              `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { tripId: trip.id };
    }
  );
}
