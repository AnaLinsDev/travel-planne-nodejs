import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

import nodemailer from "nodemailer";
import { getMailClient } from "../lib/mail";

import { dayjs } from "../lib/dayjs";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            where: { is_owner: false },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found.");
      }

      if (trip.is_confirmed) {
        return reply.redirect(`https://localhosto:8000/trips/${tripId}`);
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true },
      });

      const formattedStartAt = dayjs(trip.starts_at).format("L LT");
      const formattedEndAt = dayjs(trip.ends_at).format("L LT");

      const mail = await getMailClient();

      await Promise.all(
        trip.participants.map(async (participant) => {
          const confirmationLink = `http://localhost:3000/participants/${participant.id}/confirm`;

          const message = await mail.sendMail({
            from: {
              name: "Equipe Planner",
              address: "oi@planner.com",
            },
            to: participant.email,

            subject: `Confirme sua presença na viagem para ${trip.destination}`,
            html: ` <body style="font-family: Arial, sans-serif; background-color: #f9fafb; color: #111827; padding: 20px;">
                <h2 style="color:#0ea5a4;">Confirmação de Viagem</h2>

                <p>Olá <strong>{{nome}}</strong>,</p>

                <p>Você foi convidado para uma viagem marcada para <strong>${formattedStartAt} até ${formattedEndAt}</strong> com destino a <strong>${trip.destination}</strong>.</p>

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
        })
      );

      return reply.redirect(`https://localhosto:8000/trips/${tripId}`);
    }
  );
}
