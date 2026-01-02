/**
 * ThemeApplier - テーマ適用の抽象化インターフェース
 *
 * ThemeProviderのDOM操作を抽象化し、テスト時にモック可能にします。
 */

import type { ThemeConfig } from "./ThemeProvider";

/**
 * テーマ適用インターフェース
 */
export interface ThemeApplier {
	/**
	 * テーマ変数をDOMに適用
	 * @param config テーマ設定
	 */
	applyVariables(config: ThemeConfig): void;

	/**
	 * 適用したテーマ変数を削除
	 */
	removeVariables(): void;
}

/**
 * DOM実装 - document.documentElement.styleを操作
 *
 * 本番環境で使用する実装。
 * ブラウザのDOM APIを使用してCSS変数を設定・削除します。
 */
export class DOMThemeApplier implements ThemeApplier {
	applyVariables(config: ThemeConfig): void {
		if (typeof window === "undefined" || !document.documentElement) {
			return;
		}

		const root = document.documentElement.style;

		// Apply theme configuration to CSS variables
		if (config.density) root.setProperty("--ui-density", config.density);
		if (config.tabletMode !== undefined)
			root.setProperty("--tablet-mode", config.tabletMode ? "1" : "0");
		if (config.radius !== undefined)
			root.setProperty("--radius", `${config.radius}rem`);
		if (config.fontSize !== undefined)
			root.setProperty("--font-size-base", `${config.fontSize}rem`);
		if (config.componentHeight !== undefined)
			root.setProperty("--component-height", `${config.componentHeight}rem`);
		if (config.listRowHeight !== undefined)
			root.setProperty("--list-row-height", `${config.listRowHeight}rem`);
		if (config.paddingX !== undefined)
			root.setProperty("--padding-x", `${config.paddingX}rem`);
		if (config.paddingY !== undefined)
			root.setProperty("--padding-y", `${config.paddingY}rem`);
		if (config.gap !== undefined) root.setProperty("--gap", `${config.gap}rem`);
		if (config.iconSize !== undefined)
			root.setProperty("--icon-size", `${config.iconSize}rem`);
		if (config.modalPadding !== undefined)
			root.setProperty("--modal-padding", `${config.modalPadding}rem`);
		if (config.checkboxSize !== undefined)
			root.setProperty("--checkbox-size", `${config.checkboxSize}rem`);
		if (config.buttonPaddingX !== undefined)
			root.setProperty("--button-padding-x", `${config.buttonPaddingX}rem`);
		if (config.buttonPaddingY !== undefined)
			root.setProperty("--button-padding-y", `${config.buttonPaddingY}rem`);
		if (config.badgePaddingX !== undefined)
			root.setProperty("--badge-padding-x", `${config.badgePaddingX}rem`);
		if (config.badgePaddingY !== undefined)
			root.setProperty("--badge-padding-y", `${config.badgePaddingY}rem`);
		if (config.cardPadding !== undefined)
			root.setProperty("--card-padding", `${config.cardPadding}rem`);
		if (config.drawerWidthLeft !== undefined)
			root.setProperty("--drawer-width-left", `${config.drawerWidthLeft}px`);
		if (config.drawerWidthRight !== undefined)
			root.setProperty("--drawer-width-right", `${config.drawerWidthRight}px`);
		if (config.stepCircleSize !== undefined)
			root.setProperty("--step-circle-size", `${config.stepCircleSize}rem`);
		if (config.switchWidth !== undefined)
			root.setProperty("--switch-width", `${config.switchWidth}rem`);
		if (config.switchHeight !== undefined)
			root.setProperty("--switch-height", `${config.switchHeight}rem`);
		if (config.switchThumbSize !== undefined)
			root.setProperty("--switch-thumb-size", `${config.switchThumbSize}rem`);
		if (config.keypadButtonHeight !== undefined)
			root.setProperty(
				"--keypad-button-height",
				`${config.keypadButtonHeight}rem`,
			);
	}

	removeVariables(): void {
		if (typeof window === "undefined" || !document.documentElement) {
			return;
		}

		const root = document.documentElement.style;

		// Remove all custom properties
		root.removeProperty("--ui-density");
		root.removeProperty("--tablet-mode");
		root.removeProperty("--radius");
		root.removeProperty("--font-size-base");
		root.removeProperty("--component-height");
		root.removeProperty("--list-row-height");
		root.removeProperty("--padding-x");
		root.removeProperty("--padding-y");
		root.removeProperty("--gap");
		root.removeProperty("--icon-size");
		root.removeProperty("--modal-padding");
		root.removeProperty("--checkbox-size");
		root.removeProperty("--button-padding-x");
		root.removeProperty("--button-padding-y");
		root.removeProperty("--badge-padding-x");
		root.removeProperty("--badge-padding-y");
		root.removeProperty("--card-padding");
		root.removeProperty("--drawer-width-left");
		root.removeProperty("--drawer-width-right");
		root.removeProperty("--step-circle-size");
		root.removeProperty("--switch-width");
		root.removeProperty("--switch-height");
		root.removeProperty("--switch-thumb-size");
		root.removeProperty("--keypad-button-height");
	}
}

/**
 * モック実装 - テスト用
 *
 * DOM操作を行わず、適用された設定をメモリ上に保持します。
 * テストで使用することで、DOM環境なしでテーマ適用ロジックをテスト可能です。
 *
 * @example
 * ```typescript
 * const mockApplier = new MockThemeApplier();
 * mockApplier.applyVariables({ radius: 0.5 });
 * expect(mockApplier.appliedConfig).toEqual({ radius: 0.5 });
 * ```
 */
export class MockThemeApplier implements ThemeApplier {
	/** 適用されたテーマ設定 */
	appliedConfig?: ThemeConfig;

	applyVariables(config: ThemeConfig): void {
		this.appliedConfig = config;
	}

	removeVariables(): void {
		this.appliedConfig = undefined;
	}

	/** テスト用: 適用された設定をクリア */
	reset(): void {
		this.appliedConfig = undefined;
	}
}

/**
 * デフォルトのテーマ適用インスタンス
 */
export const defaultThemeApplier: ThemeApplier = new DOMThemeApplier();
