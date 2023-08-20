import { IRequest, StatusError } from 'itty-router'
import { json, error } from './helper'
import { AttendeeInfo } from '../usecase'

export type StatusRequest = {
	attendeeInfo: AttendeeInfo
} & IRequest

export type StatusResponse = {
	user_id: string
	first_use: number | null
	role: string
}

const datetimeToUnix = (datetime: Date | null): number | null => {
	if (!datetime) {
		return null
	}

	return datetime.getTime() / 1000
}

export const status = async ({ attendeeInfo, query }: StatusRequest) => {
	if (!query.token) {
		throw new StatusError(400, 'token required')
	}

	const isStaffQuery = query.StaffQuery === 'true'
	const info = await attendeeInfo.getAttendee(query.token as string, !isStaffQuery)
	if (!info) {
		throw new StatusError(400, 'invalid token')
	}

	return json<StatusResponse>({
		user_id: info.displayName,
		first_use: datetimeToUnix(info.firstUsedAt),
		role: info.role,
	})
}
