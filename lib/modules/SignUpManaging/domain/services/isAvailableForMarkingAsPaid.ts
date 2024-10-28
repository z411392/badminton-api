import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const isAvailableForMarkingAsPaid = (status: SignUpStatuses) => {
    if (status === SignUpStatuses.Pending) return true
    if (status === SignUpStatuses.Accepted) return true
    return false
}
