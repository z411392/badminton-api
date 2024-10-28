import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const isAvailableForRevoking = (status: SignUpStatuses) => {
    if (status === SignUpStatuses.Pending) return true
    if (status === SignUpStatuses.Accepted) return true
    return false
}
