import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
	// detect user language
	// learn more: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		debug: true,
		fallbackLng: "ja",
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
		resources: {
			en: {
				translation: {
					calendar: "Calendar",
					views: {
						// Keeping views object for backward compatibility if needed, though replaced usages
						day: "Day",
						week: "Week",
						month: "Month",
					},
					view_day: "Day",
					view_week: "Week",
					view_month: "Month",
					today_button: "Today",

					settings_title: "Settings",
					settings_language: "Language",
					settings_theme: "Theme",
					settings_density: "UI Density",
					settings_radius: "Corner Radius",
					settings_font_size: "Font Size",
					settings_week_start: "Week Starts On",
					settings_business_hours: "Business Hours",
					settings_closed_days: "Closed Days",

					option_light: "Light",
					option_dark: "Dark",
					option_compact: "Compact",
					option_normal: "Normal",
					option_spacious: "Spacious",
					option_sunday: "Sunday",
					option_monday: "Monday",
					days_short_sun: "Sun",
					days_short_mon: "Mon",
					days_short_tue: "Tue",
					days_short_wed: "Wed",
					days_short_thu: "Thu",
					days_short_fri: "Fri",
					days_short_sat: "Sat",

					app_title: "Regular Calendar Demo",
					app_header_regular_calendar: "Regular Calendar",
					app_header_facility_schedule: "Facility Schedule",
					app_header_facility_structure: "Facility Struct",
					event_create_title: "New Event",
					event_edit_title: "Edit Event",
					event_custom_create_title: "New Custom Event",
					event_custom_edit_title: "Edit Custom Event",

					user_name_label: "User Name / Patient Name",
					resource_label: "Resource",
					date_label: "Date",
					start_time_label: "Start Time",
					duration_label: "Duration (Hours)",
					status_label: "Status",
					note_label: "Note",
					department_label: "Department (Custom Field)",
					attendee_label: "Attendee",
					usage_label: "Usage (Purpose)",

					save_button: "Save",
					cancel_button: "Cancel",
					delete_button: "Delete",
					confirm_delete_title: "Delete Event?",
					confirm_delete_message: "Are you sure you want to delete this event?",

					resource_placeholder: "Select Resource",
					name_placeholder: "Enter name",
					department_placeholder: "Select Department",
					attendee_placeholder: "Enter attendee name",
					usage_placeholder: "Select usage",
					facility_settings_title: "Facility Structure Settings",
					facility_action_add_group: "Add Group",
					facility_action_add_resource: "Add Resource",
					facility_action_done: "Done",
					facility_action_rename: "Rename",
					facility_action_delete: "Delete",
					facility_label_group_name: "Group Name",
					facility_label_resource_name: "Resource Name",
					facility_label_no_groups: "No groups defined.",
					facility_confirm_delete_group: "Delete Group?",
					facility_confirm_delete_group_message:
						"Are you sure? All resources in this group will be deleted.",
					facility_confirm_delete_resource: "Delete Resource?",
					facility_confirm_delete_resource_message:
						"Are you sure you want to delete this resource?",

					facility_prompt_group_name: "Enter Group Name",
					facility_prompt_resource_name: "Enter Resource Name",
				},
			},
			ja: {
				translation: {
					calendar: "カレンダー",

					view_day: "日",
					view_week: "週",
					view_month: "月",
					today_button: "本日",

					settings_title: "設定",
					settings_language: "言語",
					settings_theme: "テーマ",
					settings_density: "UI密度",
					settings_radius: "角丸",
					settings_font_size: "フォントサイズ",
					settings_week_start: "週の開始曜日",
					settings_business_hours: "営業時間",
					settings_closed_days: "定休日",

					option_light: "ライト",
					option_dark: "ダーク",
					option_compact: "コンパクト",
					option_normal: "標準",
					option_spacious: "ゆったり",
					option_sunday: "日曜日",
					option_monday: "月曜日",
					days_short_sun: "日",
					days_short_mon: "月",
					days_short_tue: "火",
					days_short_wed: "水",
					days_short_thu: "木",
					days_short_fri: "金",
					days_short_sat: "土",

					app_title: "Regular Calendar Demo",
					app_header_regular_calendar: "通常カレンダー",
					app_header_facility_schedule: "施設スケジュール",
					app_header_facility_structure: "施設構造",
					event_create_title: "新規予定",
					event_edit_title: "予定編集",
					event_custom_create_title: "新規カスタム予定",
					event_custom_edit_title: "カスタム予定編集",

					user_name_label: "ユーザー名 / 患者名",
					resource_label: "リソース",
					date_label: "日付",
					start_time_label: "開始時間",
					duration_label: "期間 (時間)",
					status_label: "ステータス",
					note_label: "メモ",
					department_label: "診療科 (カスタム項目)",
					attendee_label: "参加者",
					usage_label: "用途 (目的)",

					save_button: "保存",
					cancel_button: "キャンセル",
					delete_button: "削除",
					confirm_delete_title: "予定を削除?",
					confirm_delete_message: "本当にこの予定を削除しますか？",

					resource_placeholder: "リソースを選択",
					name_placeholder: "名前を入力",
					department_placeholder: "診療科を選択",
					attendee_placeholder: "参加者名を入力",
					usage_placeholder: "用途を選択",
					facility_settings_title: "施設構造設定",
					facility_action_add_group: "グループ追加",
					facility_action_add_resource: "リソース追加",
					facility_action_done: "完了",
					facility_action_rename: "名前変更",
					facility_action_delete: "削除",
					facility_label_group_name: "グループ名",
					facility_label_resource_name: "リソース名",
					facility_label_no_groups: "グループがありません。",
					facility_confirm_delete_group: "グループを削除?",
					facility_confirm_delete_group_message:
						"本当に削除しますか？このグループ内のリソースも全て削除されます。",
					facility_confirm_delete_resource: "リソースを削除?",
					facility_confirm_delete_resource_message:
						"本当にこのリソースを削除しますか？",

					facility_prompt_group_name: "グループ名を入力",
					facility_prompt_resource_name: "リソース名を入力",
				},
			},
		},
	});

export default i18n;
