import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const isAvailableForMarkingAsRefunded = (status: SignUpStatuses) => {
    if (status === SignUpStatuses.Paid) return true
    return false
}
