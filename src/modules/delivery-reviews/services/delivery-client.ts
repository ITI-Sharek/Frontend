import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  DeliveryClient,
  DeliveryDetailDto,
  DeliveryDto,
  DeliveryLifecycleDto,
  OwnerDeliveryReviewQueueDto,
  SubmitDeliveryCommand,
} from "../types/delivery.types";

function commandBody(command: SubmitDeliveryCommand) {
  return {
    pullRequestUrl: command.pullRequestUrl,
    contributorNotes: command.contributorNotes,
  };
}

export const httpDeliveryClient: DeliveryClient = {
  async getContributorLifecycle() {
    const { data } =
      await axiosInstance.get<DeliveryLifecycleDto>("/me/deliveries");
    return data;
  },

  async getOwnerLifecycle() {
    const { data } = await axiosInstance.get<DeliveryLifecycleDto>(
      "/owner/delivery-lifecycle",
    );
    return data;
  },

  async getOwnerReviewQueue() {
    const { data } = await axiosInstance.get<OwnerDeliveryReviewQueueDto>(
      "/owner/deliveries",
    );
    return data;
  },

  async getDelivery(deliveryId: string) {
    const { data } = await axiosInstance.get<DeliveryDetailDto>(
      `/deliveries/${encodeURIComponent(deliveryId)}`,
    );
    return data;
  },

  async submitDelivery(applicationId, command) {
    const { data } = await axiosInstance.post<DeliveryDto>(
      `/applications/${encodeURIComponent(applicationId)}/deliveries`,
      commandBody(command),
      { headers: { "Idempotency-Key": command.idempotencyKey } },
    );
    return data;
  },

  async updateDelivery(deliveryId, command) {
    const { data } = await axiosInstance.patch<DeliveryDto>(
      `/deliveries/${encodeURIComponent(deliveryId)}`,
      commandBody(command),
      { headers: { "Idempotency-Key": command.idempotencyKey } },
    );
    return data;
  },

  async reviewDelivery(deliveryId, command) {
    const { idempotencyKey, ...body } = command;
    const { data } = await axiosInstance.post<DeliveryDto>(
      `/deliveries/${encodeURIComponent(deliveryId)}/reviews`,
      body,
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return data;
  },
};
