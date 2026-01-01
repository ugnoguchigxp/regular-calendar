import i18n from './i18n';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('react-i18next', () => ({
  initReactI18next: {},
}));

vi.mock('i18next-browser-languagedetector', () => ({
  default: {},
}));

describe('i18n configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('i18nextの初期化が正しく呼び出されること', async () => {
    await i18n.init({});

    expect(i18next.use).toHaveBeenCalledWith(LanguageDetector);
    expect(i18next.use).toHaveBeenCalledWith(initReactI18next);
    expect(i18next.init).toHaveBeenCalledWith(
      expect.objectContaining({
        debug: true,
        fallbackLng: 'ja',
        interpolation: {
          escapeValue: false,
        },
        resources: expect.objectContaining({
          en: expect.any(Object),
          ja: expect.any(Object),
        }),
      })
    );
  });

  it('英語リソースが正しく定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const resources = initCall[0]?.resources as any;

    expect(resources?.en).toBeDefined();
    expect(resources?.en.translation).toBeDefined();
    expect(resources?.en.translation.calendar).toBe('Calendar');
    expect(resources?.en.translation.today_button).toBe('Today');
    expect(resources?.en.translation.settings_title).toBe('Settings');
  });

  it('日本語リソースが正しく定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const resources = initCall[0]?.resources as any;

    expect(resources?.ja).toBeDefined();
    expect(resources?.ja.translation).toBeDefined();
    expect(resources?.ja.translation.calendar).toBe('カレンダー');
    expect(resources?.ja.translation.today_button).toBe('本日');
    expect(resources?.ja.translation.settings_title).toBe('設定');
  });

  it('ビュー設定の翻訳が定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const enResources = initCall[0]?.resources?.en.translation as any;
    const jaResources = initCall[0]?.resources?.ja.translation as any;

    expect(enResources?.view_day).toBe('Day');
    expect(enResources?.view_week).toBe('Week');
    expect(enResources?.view_month).toBe('Month');

    expect(jaResources?.view_day).toBe('日');
    expect(jaResources?.view_week).toBe('週');
    expect(jaResources?.view_month).toBe('月');
  });

  it('設定関連の翻訳が定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const enResources = initCall[0]?.resources?.en.translation as any;
    const jaResources = initCall[0]?.resources?.ja.translation as any;

    expect(enResources?.settings_theme).toBe('Theme');
    expect(enResources?.settings_language).toBe('Language');
    expect(enResources?.option_light).toBe('Light');
    expect(enResources?.option_dark).toBe('Dark');

    expect(jaResources?.settings_theme).toBe('テーマ');
    expect(jaResources?.settings_language).toBe('言語');
    expect(jaResources?.option_light).toBe('ライト');
    expect(jaResources?.option_dark).toBe('ダーク');
  });

  it('曜日の略称が定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const enResources = initCall[0]?.resources?.en.translation as any;
    const jaResources = initCall[0]?.resources?.ja.translation as any;

    expect(enResources?.days_short_sun).toBe('Sun');
    expect(enResources?.days_short_mon).toBe('Mon');
    expect(enResources?.days_short_tue).toBe('Tue');
    expect(enResources?.days_short_wed).toBe('Wed');
    expect(enResources?.days_short_thu).toBe('Thu');
    expect(enResources?.days_short_fri).toBe('Fri');
    expect(enResources?.days_short_sat).toBe('Sat');

    expect(jaResources?.days_short_sun).toBe('日');
    expect(jaResources?.days_short_mon).toBe('月');
    expect(jaResources?.days_short_tue).toBe('火');
    expect(jaResources?.days_short_wed).toBe('水');
    expect(jaResources?.days_short_thu).toBe('木');
    expect(jaResources?.days_short_fri).toBe('金');
    expect(jaResources?.days_short_sat).toBe('土');
  });

  it('施設設定関連の翻訳が定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const jaResources = initCall[0]?.resources?.ja.translation as any;

    expect(jaResources?.facility_settings_title).toBe('施設構造設定');
    expect(jaResources?.facility_action_add_group).toBe('グループ追加');
    expect(jaResources?.facility_action_add_resource).toBe('リソース追加');
    expect(jaResources?.facility_action_delete).toBe('削除');
  });

  it('イベント関連の翻訳が定義されていること', async () => {
    await i18n.init({});

    const initCall = vi.mocked(i18next.init).mock.calls[0];
    const enResources = initCall[0]?.resources?.en.translation as any;
    const jaResources = initCall[0]?.resources?.ja.translation as any;

    expect(enResources?.event_create_title).toBe('New Event');
    expect(enResources?.event_edit_title).toBe('Edit Event');
    expect(enResources?.save_button).toBe('Save');
    expect(enResources?.cancel_button).toBe('Cancel');

    expect(jaResources?.event_create_title).toBe('新規予定');
    expect(jaResources?.event_edit_title).toBe('予定編集');
    expect(jaResources?.save_button).toBe('保存');
    expect(jaResources?.cancel_button).toBe('キャンセル');
  });
});
