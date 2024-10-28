import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const isAvailableForCancelling = (status: SignUpStatuses) => {
    if (status === SignUpStatuses.Pending) return true
    if (status === SignUpStatuses.Accepted) return true
    return false
}
