import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
        fallbackLng: 'ja',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: {
                    "calendar": "Calendar",
                    "views": {
                        "day": "Day",
                        "week": "Week",
                        "month": "Month"
                    },
                    "settings": {
                        "title": "Settings",
                        "language": "Language",
                        "theme": "Theme",
                        "density": "UI Density",
                        "radius": "Corner Radius",
                        "fontSize": "Font Size",
                        "weekStart": "Week Starts On",
                        "businessHours": "Business Hours",
                        "closedDays": "Closed Days",
                        "options": {
                            "light": "Light",
                            "dark": "Dark",
                            "compact": "Compact",
                            "normal": "Normal",
                            "spacious": "Spacious",
                            "sunday": "Sunday",
                            "monday": "Monday"
                        },
                        "daysShort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                    },
                    "app": {
                        "header": {
                            "regularCalendar": "Regular Calendar",
                            "facilitySchedule": "Facility Schedule",
                            "facilityStructure": "Facility Struct"
                        }
                    },
                    "eventModal": {
                        "title": {
                            "create": "New Event",
                            "edit": "Edit Event",
                            "createCustom": "New Custom Event",
                            "editCustom": "Edit Custom Event"
                        },
                        "labels": {
                            "userName": "User Name / Patient Name",
                            "resource": "Resource",
                            "date": "Date",
                            "startTime": "Start Time",
                            "duration": "Duration (Hours)",
                            "status": "Status",
                            "note": "Note",
                            "department": "Department (Custom Field)"
                        },
                        "actions": {
                            "save": "Save",
                            "cancel": "Cancel",
                            "delete": "Delete",
                            "confirmDelete": "Delete Event?",
                            "confirmDeleteMessage": "Are you sure you want to delete this event?"
                        },
                        "placeholders": {
                            "selectResource": "Select Resource",
                            "enterName": "Enter name",
                            "selectDepartment": "Select Department"
                        }
                    },
                    "facilitySettings": {
                        "title": "Facility Structure Settings",
                        "actions": {
                            "addGroup": "Add Group",
                            "addResource": "Add Resource",
                            "done": "Done",
                            "rename": "Rename",
                            "delete": "Delete"
                        },
                        "labels": {
                            "groupName": "Group Name",
                            "resourceName": "Resource Name",
                            "noGroups": "No groups defined."
                        },
                        "confirm": {
                            "deleteGroup": "Delete Group?",
                            "deleteGroupMessage": "Are you sure? All resources in this group will be deleted.",
                            "deleteResource": "Delete Resource?",
                            "deleteResourceMessage": "Are you sure you want to delete this resource?"
                        }
                    }
                }
            },
            ja: {
                translation: {
                    "calendar": "カレンダー",
                    "views": {
                        "day": "日",
                        "week": "週",
                        "month": "月"
                    },
                    "settings": {
                        "title": "設定",
                        "language": "言語",
                        "theme": "テーマ",
                        "density": "UI密度",
                        "radius": "角丸",
                        "fontSize": "フォントサイズ",
                        "weekStart": "週の開始曜日",
                        "businessHours": "営業時間",
                        "closedDays": "定休日",
                        "options": {
                            "light": "ライト",
                            "dark": "ダーク",
                            "compact": "コンパクト",
                            "normal": "標準",
                            "spacious": "ゆったり",
                            "sunday": "日曜日",
                            "monday": "月曜日"
                        },
                        "daysShort": ["日", "月", "火", "水", "木", "金", "土"]
                    },
                    "app": {
                        "header": {
                            "regularCalendar": "通常カレンダー",
                            "facilitySchedule": "施設スケジュール",
                            "facilityStructure": "施設構造"
                        }
                    },
                    "eventModal": {
                        "title": {
                            "create": "新規予定",
                            "edit": "予定編集",
                            "createCustom": "新規カスタム予定",
                            "editCustom": "カスタム予定編集"
                        },
                        "labels": {
                            "userName": "ユーザー名 / 患者名",
                            "resource": "リソース",
                            "date": "日付",
                            "startTime": "開始時間",
                            "duration": "期間 (時間)",
                            "status": "ステータス",
                            "note": "メモ",
                            "department": "診療科 (カスタム項目)"
                        },
                        "actions": {
                            "save": "保存",
                            "cancel": "キャンセル",
                            "delete": "削除",
                            "confirmDelete": "予定を削除?",
                            "confirmDeleteMessage": "本当にこの予定を削除しますか？"
                        },
                        "placeholders": {
                            "selectResource": "リソースを選択",
                            "enterName": "名前を入力",
                            "selectDepartment": "診療科を選択"
                        }
                    },
                    "facilitySettings": {
                        "title": "施設構造設定",
                        "actions": {
                            "addGroup": "グループ追加",
                            "addResource": "リソース追加",
                            "done": "完了",
                            "rename": "名前変更",
                            "delete": "削除"
                        },
                        "labels": {
                            "groupName": "グループ名",
                            "resourceName": "リソース名",
                            "noGroups": "グループがありません。"
                        },
                        "confirm": {
                            "deleteGroup": "グループを削除?",
                            "deleteGroupMessage": "本当に削除しますか？このグループ内のリソースも全て削除されます。",
                            "deleteResource": "リソースを削除?",
                            "deleteResourceMessage": "本当にこのリソースを削除しますか？"
                        }
                    }
                }
            }
        }
    });

export default i18n;
