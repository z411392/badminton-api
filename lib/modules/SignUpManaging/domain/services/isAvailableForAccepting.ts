import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const isAvailableForAccepting = (status: SignUpStatuses) => {
    if (status === SignUpStatuses.Pending) return true
    return false
}
