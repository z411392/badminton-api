import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const isAvailableForRegistering = (status: SignUpStatuses) => {
    if (status === SignUpStatuses.Pending) return false
    if (status === SignUpStatuses.Accepted) return false
    if (status === SignUpStatuses.Paid) return false
    return true
}
