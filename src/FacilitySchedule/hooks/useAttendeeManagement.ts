/**
 * useAttendeeManagement - Attendee管理フック
 *
 * EventFormから抽出したattendee管理ロジック。
 * JSON形式のattendeeデータのパース、バリデーション、
 * および自動的なユーザー追加機能を提供します。
 */

import { useMemo } from "react";
import type { Personnel } from "../../PersonnelPanel/PersonnelPanel.schema";
import type { AttendeeInfo } from "../FacilitySchedule.schema";

/**
 * attendee文字列をAttendeeInfo配列にパース
 * JSON形式または従来のカンマ区切り形式をサポート
 */
export function parseAttendees(str: string): AttendeeInfo[] {
	if (!str) return [];
	try {
		const parsed = JSON.parse(str);
		if (Array.isArray(parsed)) return parsed as AttendeeInfo[];
	} catch (_e) {
		// ignore
	}
	// Fallback for legacy data
	return str
		.split(/,|、/)
		.map((s) => s.trim())
		.filter(Boolean)
		.map((name) => ({
			name,
			type: "external",
		}));
}

/**
 * AttendeeInfo配列をJSON文字列に変換
 */
export function stringifyAttendees(attendees: AttendeeInfo[]): string {
	return attendees.length > 0 ? JSON.stringify(attendees) : "[]";
}

export interface UseAttendeeManagementOptions {
	/** 人員リスト */
	personnel: Personnel[];
	/** 現在のユーザーID */
	currentUserId?: string;
	/** 編集モードかどうか */
	isEditMode: boolean;
}

export interface UseAttendeeManagementResult {
	/** attendee配列をパース */
	parseAttendees: (str: string) => AttendeeInfo[];
	/** attendee配列を文字列化 */
	stringifyAttendees: (attendees: AttendeeInfo[]) => string;
	/** 送信用にattendeeを処理（自動追加ロジック含む） */
	processAttendeesForSubmit: (attendeeStr: string) => {
		finalAttendees: string;
		shouldDelete: boolean;
	};
}

/**
 * Attendee管理フック
 *
 * @example
 * ```tsx
 * const { parseAttendees, processAttendeesForSubmit } = useAttendeeManagement({
 *   personnel,
 *   currentUserId,
 *   isEditMode: !!event,
 * });
 *
 * // フォーム送信時
 * const { finalAttendees, shouldDelete } = processAttendeesForSubmit(formData.attendee);
 * if (shouldDelete) {
 *   onDelete();
 * } else {
 *   onSubmit({ ...formData, attendee: finalAttendees });
 * }
 * ```
 */
export function useAttendeeManagement({
	personnel,
	currentUserId,
	isEditMode,
}: UseAttendeeManagementOptions): UseAttendeeManagementResult {
	/**
	 * 送信用にattendeeを処理
	 * - 編集モードでattendeeが空の場合は削除フラグを返す
	 * - 新規作成モードで現在のユーザーが含まれていない場合は自動追加
	 */
	const processAttendeesForSubmit = useMemo(() => {
		return (attendeeStr: string) => {
			let finalAttendeeList: AttendeeInfo[] = [];

			try {
				if (attendeeStr && attendeeStr !== "[]") {
					const parsed = JSON.parse(attendeeStr);
					if (Array.isArray(parsed)) {
						finalAttendeeList = parsed;
					}
				}
			} catch (_e) {
				// ignore
			}

			// Edit Mode: If no attendees, delete the event
			if (isEditMode && finalAttendeeList.length === 0) {
				return {
					finalAttendees: "[]",
					shouldDelete: true,
				};
			}

			// Create Mode: Ensure current user is included if creating
			if (!isEditMode && currentUserId && personnel) {
				const isMeIncluded = finalAttendeeList.some(
					(a: AttendeeInfo) => a.personnelId === currentUserId,
				);
				if (!isMeIncluded) {
					const me = personnel.find((p) => p.id === currentUserId);
					if (me) {
						finalAttendeeList.push({
							name: me.name,
							personnelId: me.id,
							type: "personnel",
						});
					}
				}
			}

			return {
				finalAttendees:
					finalAttendeeList.length > 0
						? JSON.stringify(finalAttendeeList)
						: "[]",
				shouldDelete: false,
			};
		};
	}, [isEditMode, currentUserId, personnel]);

	return {
		parseAttendees,
		stringifyAttendees,
		processAttendeesForSubmit,
	};
}
